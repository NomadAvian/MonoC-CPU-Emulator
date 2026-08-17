// route -> cpu state -> send to Ollama -> return

#include <crow.h>
#include "../emulator/src/core/cpu.h"
#include "../emulator/src/assembler/assembler.h"

int main()
{
    crow::SimpleApp app;
    cpu::CPU* cpu_instance = new cpu::CPU("test_program.txt");

    // POST /cpu/compile
    // assembles the source buffer into a ROM and loads it into the CPU
    CROW_ROUTE(app, "/cpu/compile").methods(crow::HTTPMethod::POST)
    ([&cpu_instance](const crow::request& req) {
        if (!cpu_instance) return crow::response(400, "no cpu loaded");

        auto body = crow::json::load(req.body);
        if (!body || !body.has("source"))
            return crow::response(400, "missing 'source' in request body");

        crow::json::wvalue res;
        try {
            std::vector<Word> words =
                riscv::Assembler::AssembleToRom(body["source"].s(), "test_program");
            cpu_instance->Reset();
            // resets the cpu
            cpu_instance->LoadROM("test_program.txt");
            res["ok"]   = true;
            res["size"] = static_cast<int64_t>(words.size());
            return crow::response(200, res);
        } catch (const std::exception& e) {
            res["ok"]    = false;
            res["error"] = std::string(e.what());
            return crow::response(400, res);
        }
    });

    // POST /cpu/reset
    // resets the cpu state
    CROW_ROUTE(app, "/cpu/reset").methods(crow::HTTPMethod::POST)
    ([&cpu_instance]() {
        if (!cpu_instance) return crow::response(400, "no cpu loaded");
        cpu_instance->Reset();
        return crow::response(200, "reset");
    });

    // POST /cpu/step
    // runs one or more instructions, returns whether the CPU halted
    CROW_ROUTE(app, "/cpu/step").methods(crow::HTTPMethod::POST)
    ([&cpu_instance](const crow::request& req) {
        if (!cpu_instance) return crow::response(400, "no cpu loaded");
        
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

        // step batch
        for (int i = 0; i < count; i++) {
            cpu_instance->Step();
            if (cpu_instance->IsHalted()) break;
        }
        
        crow::json::wvalue res;
        res["stepped"] = true;
        res["halted"] = cpu_instance->IsHalted();
        return crow::response(200, res);
    });

    // GET /cpu/registers
    // returns all 32 registers + PC
    CROW_ROUTE(app, "/cpu/registers")
    ([&cpu_instance]() {
        crow::json::wvalue res;
        res["pc"] = cpu_instance->pc();
        res["registers"] = std::vector<crow::json::wvalue>();
        auto& regs = res["registers"];
        for (size_t i = 0; i < 32; i++) {
            regs[i] = cpu_instance->ReadReg(i);
        }
        return crow::response(200, res);
    });

    // GET /cpu/memory/:addr
    // reads 64 bytes of RAM starting at addr (hex or decimal); addr data type conversion happens in the front end
    CROW_ROUTE(app, "/cpu/memory/<string>")
    ([&cpu_instance](const std::string& addr_str) {
        if (!cpu_instance) return crow::response(400, "no cpu loaded");
        // TODO: convert to number and return mem addr
        return crow::response(200, "memory");
    });

    app.port(6969).multithreaded().run();
}
