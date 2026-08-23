#include <crow.h>
#include <cstdint>
#include <string>
#include <vector>

#include "session_instance.cpp"
#include "../emulator/src/core/framebuffer.h"

int main()
{
    const char* env_port = std::getenv("PORT");
    int port = env_port ? std::stoi(env_port) : 6969;

    crow::SimpleApp app;
    backend::SessionRegistry registry;

    // resolves the X-Session-Id header to a live session
    // create new session if none is found
    auto resolve = [&registry](const crow::request& req) {
        return registry.GetOrCreate(req.get_header_value("X-Session-Id"));
    };

    // stamps every response with current session id
    auto respond = [](const backend::SessionInstance& s, crow::response res) {
        res.add_header("X-Session-Id", s.id());
        return res;
    };

    // POST /cpu/compile
    // assembles the source buffer into the session's own ROM and loads it
    CROW_ROUTE(app, "/cpu/compile").methods(crow::HTTPMethod::POST)
    ([&resolve, &respond](const crow::request& req) {
        auto body = crow::json::load(req.body);
        if (!body || !body.has("source"))
            return crow::response(400, "missing 'source' in request body");

        auto session = resolve(req);

        crow::json::wvalue res;
        try {
            const size_t size = session->Compile(body["source"].s());
            res["ok"]        = true;
            res["size"]      = static_cast<int64_t>(size);
            res["sessionId"] = session->id();
        } catch (const std::exception& e) {
            res["ok"]    = false;
            res["error"] = std::string(e.what());
            return respond(*session, crow::response(400, res));
        }
        return respond(*session, crow::response(200, res));
    });

    // POST /cpu/reset
    // resets the session's cpu state
    CROW_ROUTE(app, "/cpu/reset").methods(crow::HTTPMethod::POST)
    ([&resolve, &respond](const crow::request& req) {
        auto session = resolve(req);
        session->Reset();
        return respond(*session, crow::response(200, "reset"));
    });

    // POST /cpu/step
    // runs one or more instructions, returns whether the CPU halted
    CROW_ROUTE(app, "/cpu/step").methods(crow::HTTPMethod::POST)
    ([&resolve, &respond](const crow::request& req) {
        auto session = resolve(req);

        int count = 1;
        // check count = 1 or more & sanitize parameter
        if (req.url_params.get("count") != nullptr) {
            try {
                count = std::stoi(req.url_params.get("count"));
            } catch (...) {
                count = 1;
            }
            if (count < 1) count = 1;
        }

        session->Step(count);

        crow::json::wvalue res;
        res["stepped"] = true;
        res["halted"]  = session->halted();
        res["waiting"] = session->waiting();
        return respond(*session, crow::response(200, res));
    });

    // GET /cpu/registers
    // returns all 32 registers + PC for this session
    CROW_ROUTE(app, "/cpu/registers")
    ([&resolve, &respond](const crow::request& req) {
        auto session = resolve(req);

        const auto regs = session->Registers();
        crow::json::wvalue res;
        res["pc"] = session->Pc();
        res["registers"] = std::vector<crow::json::wvalue>();
        auto& list = res["registers"];
        for (size_t i = 0; i < regs.size(); i++) {
            list[i] = regs[i];
        }
        return respond(*session, crow::response(200, res));
    });

    // GET /cpu/screen
    // returns the values of the memory addr that
    // correspond to the screen's mapping
    CROW_ROUTE(app, "/cpu/screen")
    ([&resolve, &respond](const crow::request& req) {
        auto session = resolve(req);

        const auto fb = session->Framebuffer();
        std::string body(reinterpret_cast<const char*>(fb.data()), fb.size());

        crow::response res(200);
        res.add_header("X-Fb-Width",  std::to_string(kFramebufferWidth));
        res.add_header("X-Fb-Height", std::to_string(kFramebufferHeight));
        res.add_header("Content-Type", "application/octet-stream");
        res.body = body;
        return respond(*session, std::move(res));
    });

    // GET /cpu/output
    // accumulated print-syscall output; `len` lets the frontend poll deltas
    CROW_ROUTE(app, "/cpu/output")
    ([&resolve, &respond](const crow::request& req) {
        auto session = resolve(req);

        const auto snap = session->console();
        crow::json::wvalue res;
        res["text"] = snap.text;
        res["len"]  = static_cast<int64_t>(snap.len);
        return respond(*session, crow::response(200, res));
    });

    // POST /cpu/input
    // appends data to the session's stdin buffer (read syscalls consume it)
    CROW_ROUTE(app, "/cpu/input").methods(crow::HTTPMethod::POST)
    ([&resolve, &respond](const crow::request& req) {
        auto body = crow::json::load(req.body);
        if (!body || !body.has("data"))
            return crow::response(400, "missing 'data' in request body");

        auto session = resolve(req);
        session->WriteInput(body["data"].s());
        return respond(*session, crow::response(200, "input"));
    });

    // POST /cpu/console-clear
    // wipes the session's console output + pending input
    CROW_ROUTE(app, "/cpu/console-clear").methods(crow::HTTPMethod::POST)
    ([&resolve, &respond](const crow::request& req) {
        auto session = resolve(req);
        session->ClearConsole();
        return respond(*session, crow::response(200, "cleared"));
    });

    // GET /cpu/memory/:addr
    // reads 64 bytes of RAM starting at addr (hex or decimal); addr data type conversion happens in the front end
    CROW_ROUTE(app, "/cpu/memory/<string>")
    ([&resolve, &respond](const crow::request& req, [[maybe_unused]] const std::string& addr_str) {
        auto session = resolve(req);
        // TODO: convert to number and return mem addr
        return respond(*session, crow::response(200, "memory"));
    });

    app.port(port).multithreaded().run();
}
