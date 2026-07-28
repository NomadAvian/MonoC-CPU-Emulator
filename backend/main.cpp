// route -> cpu state -> send to Ollama -> return

#include <crow.h>
#include "../emulator/src/core/cpu.h"

int main()
{
    crow::SimpleApp app;
    cpu::CPU* cpu_instance = nullptr;

    // GET /ai/test
    CROW_ROUTE(app, "/ai/test").methods(crow::HTTPMethod::GET)
    ([](){
        return "Hello World, this is a test for MCP & Backend Server";
    });

    // POST /cpu/load
    // creates/resets the CPU and loads a ROM
    CROW_ROUTE(app, "/cpu/load").methods(crow::HTTPMethod::POST)
    ([&cpu_instance](const crow::request& req) {
        // TODO
        return crow::response(200, "loaded the cpu");
    });

    // POST /cpu/step
    // runs one instruction, returns new PC and whether the CPU halted
    CROW_ROUTE(app, "/cpu/step").methods(crow::HTTPMethod::POST)
    ([&cpu_instance]() {
        if (!cpu_instance) return crow::response(400, "no cpu loaded");
        // TODO
        return crow::response(200, "stepped");
    });

    // GET /cpu/registers
    // returns all 32 registers + PC
    CROW_ROUTE(app, "/cpu/registers")
    ([&cpu_instance]() {
        if (!cpu_instance) return crow::response(400, "no cpu loaded");
        // TODO
        return crow::response(200, "registers");
    });

    // GET /cpu/memory/:addr
    // reads 64 bytes of RAM starting at addr (hex or decimal); addr data type conversion happens in the front end
    CROW_ROUTE(app, "/cpu/memory/<string>")
    ([&cpu_instance](const std::string& addr_str) {
        if (!cpu_instance) return crow::response(400, "no cpu loaded");
        // TODO
        return crow::response(200, "memory");
    });

    // POST /ai/explain
    CROW_ROUTE(app, "/ai/explain").methods(crow::HTTPMethod::POST)
    ([](const crow::request& req) {
        auto body = crow::json::load(req.body);
        // TODO send to Ollama/Gemini
        return crow::response(200, "ai is up");
    });

    app.port(6969).multithreaded().run();
}
