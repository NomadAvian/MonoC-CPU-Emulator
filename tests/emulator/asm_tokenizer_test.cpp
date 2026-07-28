#include <fstream>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

#include "../../emulator/src/assembler/error.h"
#include "../../emulator/src/assembler/scanner.h"
#include "../../emulator/src/assembler/token.h"

int main(int argc, char* argv[]) {
    std::string file_path = "data/test.asm";

    if (argc > 1) {
        file_path = argv[1];
    }

    // Read the assembly file into a string buffer
    std::ifstream input_file(file_path);
    if (!input_file.is_open()) {
        std::cerr << "Error: Could not open file '" << file_path << "'\n";
        return 1;
    }

    std::stringstream buffer;
    buffer << input_file.rdbuf();
    std::string source_code = buffer.str();
    input_file.close();

    // Tokenize source code
    try {
        riscv::Scanner scanner(source_code);
        std::vector<riscv::Token> tokens = scanner.ScanTokens();

        // Print header
        std::cout << "Successfully tokenized " << file_path << ":\n";
        std::cout << "----------------------------------------\n";

        // Print all tokens
        for (const auto& token : tokens) {
            std::cout << "[Line " << token.line() << "] "
                      << token.ToDisplayString() << "\n";
        }
    } catch (const riscv::Error&) {
        std::cerr << "Lexical analysis failed due to errors.\n";
        return 1;
    }

    return 0;
}