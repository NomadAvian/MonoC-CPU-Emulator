#include "../../emulator/src/core/alu.h"

#include <charconv>
#include <cstdint>
#include <cstdio>
#include <fstream>
#include <sstream>
#include <stdexcept>
#include <string>
#include <unordered_map>
#include <vector>


const std::string kTestDataPath = "./data/alu_inputs.csv";

struct TestCase {
    std::string operation;
    std::string opcode;
    uint32_t rs1;
    uint32_t rs2;
    uint32_t expected_result;
    alu::AluOutput alu_result;
};

uint32_t ParseUint32(const std::string& str) {
    uint32_t value = 0;
    auto [ptr, ec] = std::from_chars(str.data(), str.data() + str.size(), value);
    if (ec != std::errc{}) {
        throw std::runtime_error("Failed to parse value: " + str);
    }
    return value;
}

void ReadCsv(
        const std::string& filename,
        const std::unordered_map<std::string, alu::AluOp>& opcode_map,
        const alu::Alu& alu,
        std::vector<TestCase>& test_cases) {
    std::ifstream file(filename);
    if (!file.is_open()) {
        throw std::runtime_error("Could not open file: " + filename);
    }

    std::string line;
    std::getline(file, line);  // Skip header.

    while (std::getline(file, line)) {
        std::istringstream ss(line);
        TestCase tc;
        std::string rs1_str, rs2_str, expected_str;

        std::getline(ss, tc.operation, ',');
        std::getline(ss, tc.opcode, ',');
        std::getline(ss, rs1_str, ',');
        std::getline(ss, rs2_str, ',');
        std::getline(ss, expected_str, ',');

        tc.rs1 = ParseUint32(rs1_str);
        tc.rs2 = ParseUint32(rs2_str);
        tc.expected_result = ParseUint32(expected_str);
        tc.alu_result = alu.Execute(tc.rs1, tc.rs2, opcode_map.at(tc.opcode));

        test_cases.push_back(tc);
    }
}

int main() {
    static const std::unordered_map<std::string, alu::AluOp> opcode_map = {
            {"kAdd",    alu::AluOp::kAdd},
            {"kSub",    alu::AluOp::kSub},
            {"kAnd",    alu::AluOp::kAnd},
            {"kOr",     alu::AluOp::kOr},
            {"kXor",    alu::AluOp::kXor},
            {"kSll",    alu::AluOp::kSll},
            {"kSrl",    alu::AluOp::kSrl},
            {"kSra",    alu::AluOp::kSra},
            {"kSlt",    alu::AluOp::kSlt},
            {"kSltu",   alu::AluOp::kSltu},
            {"kMul",    alu::AluOp::kMul},
            {"kMulh",   alu::AluOp::kMulh},
            {"kMulhu",  alu::AluOp::kMulhu},
            {"kMulhsu", alu::AluOp::kMulhsu},
            {"kDiv",    alu::AluOp::kDiv},
            {"kDivu",   alu::AluOp::kDivu},
            {"kRem",    alu::AluOp::kRem},
            {"kRemu",   alu::AluOp::kRemu},
    };

    const alu::Alu alu;
    std::vector<TestCase> test_cases;

    try {
        ReadCsv(kTestDataPath, opcode_map, alu, test_cases);
    } catch (const std::exception& e) {
        printf("Error: %s\n", e.what());
        return 1;
    }

    // Print header.
    printf("%-50s | %-8s | %-12s | %-12s | %-12s | %-12s | %-14s | %s\n",
           "Operation", "Opcode", "rs1", "rs2",
           "Expected", "Got", "Flags", "Status");
    printf("%s\n", std::string(120, '-').c_str());

    int passed = 0;
    int failed = 0;

    for (const auto& tc : test_cases) {
        bool pass = (tc.alu_result.result == tc.expected_result);
        pass ? ++passed : ++failed;

        printf("%-50s | %-8s | %-12u | %-12u | %-12u | %-12u | Z=%d N=%d C=%d    | %s\n",
               tc.operation.c_str(),
               tc.opcode.c_str(),
               tc.rs1,
               tc.rs2,
               tc.expected_result,
               tc.alu_result.result,
               tc.alu_result.is_zero,
               tc.alu_result.is_neg,
               tc.alu_result.carry,
               pass ? "PASS" : "FAIL");
    }

    printf("%s\n", std::string(120, '-').c_str());
    printf("Total: %zu | Passed: %d | Failed: %d\n",
           test_cases.size(), passed, failed);

    return failed > 0 ? 1 : 0;
}
