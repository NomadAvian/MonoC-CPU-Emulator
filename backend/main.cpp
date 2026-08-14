#include "../emulator/src/assembler/assembler.h"
#include "../emulator/src/assembler/error.h"
#include "../emulator/src/core/cpu.h"
#include <crow.h>

int main() {
  crow::SimpleApp app;
  cpu::CPU *cpu_instance = new cpu::CPU("test_program.txt");

  // POST /cpu/compile
  // assembles the source buffer into a ROM and loads it into the CPU
  CROW_ROUTE(app, "/cpu/compile")
      .methods(crow::HTTPMethod::POST)(
          [&cpu_instance](const crow::request &req) {
            if (!cpu_instance)
              return crow::response(400, "no cpu loaded");

            auto body = crow::json::load(req.body);
            if (!body || !body.has("source"))
              return crow::response(400, "missing 'source' in request body");

            crow::json::wvalue res;
            try {
              std::vector<Word> words = riscv::Assembler::AssembleToRom(
                  body["source"].s(), "test_program");
              cpu_instance->Reset();
              // resets the cpu
              cpu_instance->LoadROM("test_program.txt");
              res["ok"] = true;
              res["size"] = static_cast<int64_t>(words.size());
              return crow::response(200, res);
            } catch (const std::exception &e) {
              res["ok"] = false;
              res["error"] = std::string(e.what());
              return crow::response(400, res);
            }
          });

  // POST /cpu/reset
  // resets the cpu state
  CROW_ROUTE(app, "/cpu/reset")
      .methods(crow::HTTPMethod::POST)([&cpu_instance]() {
        if (!cpu_instance)
          return crow::response(400, "no cpu loaded");
        cpu_instance->Reset();
        return crow::response(200, "reset");
      });

  // POST /cpu/step
  // runs one instruction, returns new PC and whether the CPU halted
  CROW_ROUTE(app, "/cpu/step")
      .methods(crow::HTTPMethod::POST)([&cpu_instance]() {
        if (!cpu_instance)
          return crow::response(400, "no cpu loaded");
        cpu_instance->Step();
        return crow::response(200, "stepped");
      });

  // GET /cpu/registers
  // returns all 32 registers + PC
  CROW_ROUTE(app, "/cpu/registers")
  ([&cpu_instance]() {
    crow::json::wvalue res;
    res["pc"] = cpu_instance->pc();
    res["registers"] = std::vector<crow::json::wvalue>();
    auto &regs = res["registers"];
    for (size_t i = 0; i < 32; i++) {
      regs[i] = cpu_instance->ReadReg(i);
    }
    return crow::response(200, res);
  });

  // GET /cpu/memory/:addr
  // reads 64 bytes of RAM starting at addr (hex or decimal); addr data type
  // conversion happens in the front end
  CROW_ROUTE(app, "/cpu/memory/<string>")
  ([&cpu_instance](const std::string &addr_str) {
    if (!cpu_instance)
      return crow::response(400, "no cpu loaded");
    // TODO
    return crow::response(200, "memory");
  });

  // GET /cpu/source
  // returns the source code of the currently loaded program
  CROW_ROUTE(app, "/cpu/source")
  ([&cpu_instance]() {
    crow::json::wvalue res;
    res["source"] = cpu_instance->source();
    return crow::response(200, res);
  });

  //TODO
  // need: make a route + function which answers the
  // llm: what instruction is at PC right now
  // goal: user says what does line 5 do?  llm reads the source (cpu/source)


  app.port(6969).multithreaded().run();
}
