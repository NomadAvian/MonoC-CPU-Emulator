#include "../../emulator/src/core/cpu.h"
#include "../../emulator/src/assembler/parser.h"
#include "../../emulator/src/common.h"

#include <cstdio>
#include <cstdlib>
#include <exception>
#include <fstream>
#include <iomanip>
#include <sstream>
#include <string>
#include <vector>

// Assembles a RISC-V program (.asm) to words, writes a temporary hex ROM,
// loads it into the CPU and runs it to completion via CPU::RunAll.
// A program "passes" if it runs without throwing and reaches a halted state.
int main(int argc, char* argv[]) {
    if (argc < 2) {
        std::fprintf(stderr, "usage: %s <prog.asm> [prog.asm ...]\n", argv[0]);
        return 1;
    }

    int passed = 0;
    int failed = 0;
    for (int i = 1; i < argc; ++i) {
        const std::string asm_file = argv[i];
        const std::string rom_file = "/tmp/emu_test_" + std::to_string(i) + ".txt";
        try {
            std::ifstream in(asm_file);
            if (!in)
                throw std::runtime_error("cannot open '" + asm_file + "'");
            std::ostringstream buffer;
            buffer << in.rdbuf();

            std::vector<Word> words;
            riscv::Parser parser;
            parser.Assemble(buffer.str(), words);

            // Data directives are emitted first; the entry point is the
            // word-aligned address just after them (same header the main
            // assembler writes, so LoadFile sets the start PC).
            size_t data_bytes = parser.data_bytes();
            Word entry = static_cast<Word>((data_bytes + 3) & ~static_cast<size_t>(3));

            std::ofstream out(rom_file);
            if (!out)
                throw std::runtime_error("cannot open '" + rom_file + "' for writing");
            out << std::hex << "E 0x" << entry << "\n";
            for (Word w : words) {
                out << std::setfill('0')
                    << std::setw(2) << ((w >>  0) & 0xFF) << ' '
                    << std::setw(2) << ((w >>  8) & 0xFF) << ' '
                    << std::setw(2) << ((w >> 16) & 0xFF) << ' '
                    << std::setw(2) << ((w >> 24) & 0xFF) << '\n';
            }
            out.close();

            cpu::CPU cpu(rom_file);
            
            while (!cpu.IsHalted()) {
                cpu.Step();
            }

            std::printf("%-28s ... PASS\n", asm_file.c_str());
            ++passed;
        } catch (const std::exception& e) {
            std::printf("%-28s ... FAIL (%s)\n", asm_file.c_str(), e.what());
            ++failed;
        }
    }

    std::printf("\nResults: %d passed, %d failed\n", passed, failed);
    return failed == 0 ? 0 : 1;
}