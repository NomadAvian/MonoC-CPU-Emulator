#include <cstdio>
#include <fstream>
#include <iostream>
#include <iomanip>
#include <sstream>
#include <stdexcept>
#include <string>
#include <vector>

#include "../../emulator/src/common.h"
#include "../../emulator/src/assembler/parser.h"

int main(int argc, char* argv[]) {
    if (argc < 2) {
        std::cerr << "usage: " << argv[0] << " <input.asm> [output.txt]\n";
        return 1;
    }

    std::string input = argv[1];
    std::string output = (argc >= 3) ? argv[2] : "out.txt";

    std::ifstream in(input);
    if (!in) {
        std::cerr << "error: could not open '" << input << "'\n";
        return 1;
    }
    std::ostringstream buffer;
    buffer << in.rdbuf();

    riscv::Parser parser;
    std::vector<Word> words;
    try {
        parser.Assemble(buffer.str(), words);
    } catch (const std::runtime_error& e) {
        std::cerr << "error: " << e.what() << "\n";
        return 1;
    }

    std::ofstream out(output);
    if (!out) {
        std::cerr << "error: could not open '" << output << "' for writing\n";
        return 1;
    }
    for (Word w : words) {
        out << std::hex << std::setfill('0')
            << std::setw(2) << ((w >>  0) & 0xFF) << ' '
            << std::setw(2) << ((w >>  8) & 0xFF) << ' '
            << std::setw(2) << ((w >> 16) & 0xFF) << ' '
            << std::setw(2) << ((w >> 24) & 0xFF) << '\n';
    }
    out.close();

    for (size_t k = 0; k < words.size(); ++k) {
        std::printf("0x%04X  0x%08X\n",
                    static_cast<unsigned>(k * 4),
                    static_cast<unsigned>(words[k]));
    }
    std::fprintf(stderr, "%zu words written to '%s'\n",
                 words.size(), output.c_str());
    return 0;
}
