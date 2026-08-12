#ifndef ASSEMBLER_ASSEMBLER_H_
#define ASSEMBLER_ASSEMBLER_H_

#include <bitset>
#include <filesystem>
#include <fstream>
#include <stdexcept>
#include <string>
#include <vector>

#include "../common.h"
#include "parser.h"

namespace riscv {

class Assembler {
public:
    // Directory the ROM .txt files are written to. The app is launched from the
    // repo root via start_dev.sh, but the crow server runs with cwd = build/;
    // resolve the repo's emulator/roms/ from whichever of those (or emulator/)
    // we're invoked from.
    static std::string RomsDirectory() {
        static const char* kCandidates[] = {
            "emulator/roms",     // repo root
            "../emulator/roms",  // build/ (crow server)
            "roms",              // emulator/
        };
        for (const char* dir : kCandidates) {
            if (std::filesystem::is_directory(dir))
                return dir;
        }
        return kCandidates[0];
    }

    static std::vector<Word> Assemble(const std::string& source) {
        std::vector<Word> words;
        riscv::Parser parser;
        parser.Assemble(source, words);
        return words;
    }

    // assembles `source` and writes the words to the roms directory
    static std::vector<Word> AssembleToRom(const std::string& source, const std::string& name) {
        std::vector<Word> words = Assemble(source);

        const std::string path = RomsDirectory() + "/" + name + ".txt";
        std::ofstream out(path);
        if (!out.is_open())
            throw std::runtime_error("Assembler: unable to open output file: " + path);

        for (Word w : words)
            out << std::bitset<32>(w) << "\n";

        return words;
    }
};

} // namespace riscv

#endif // ASSEMBLER_ASSEMBLER_H_