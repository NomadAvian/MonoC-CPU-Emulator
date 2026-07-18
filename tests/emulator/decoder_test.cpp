#include "../../emulator/src/core/cpu.h"

#include <charconv>
#include <cstdint>
#include <cstdio>
#include <fstream>
#include <sstream>
#include <stdexcept>
#include <string>
#include <unordered_map>
#include <vector>


const std::string kTestDataPath = "./tests/emulator/data/decoder_inputs.csv";

struct TestCase {
    cpu::DecodedInstruction decoded_instr;
    std::string operation;
    std::string instruction_hex;
    Word opcode;
    Word rs1;
    Word rs2;
    Word rd;
    int32_t imm;
};

uint32_t ParseHex(const std::string& str) {
    uint32_t value = 0;
    auto [ptr, ec] = std::from_chars(str.data() + 2 , str.data() + str.size(), value, 16);
    if (ec != std::errc{}) {
        throw std::runtime_error("Failed to parse value: " + str);
    }
    return value;
}

uint32_t ParseDecimal(const std::string& str) {
    uint32_t value = 0;
    auto [ptr, ec] = std::from_chars(str.data(), str.data() + str.size(), value);
    if (ec != std::errc{}) {
        throw std::runtime_error("Failed to parse value: " + str);
    }
    return value;
}

int32_t ParseInt32(const std::string& str) {
  int32_t value = 0;
  auto [ptr, ec] = std::from_chars(str.data(), str.data() + str.size(), value);
  if (ec != std::errc{}) {
    throw std::runtime_error("Failed to parse value: " + str);
  }
  return value;
}

void ReadCsv(
        const std::string& filename,
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
        std::string opcode_str,rs1_str, rs2_str, rd_str, imm_str;

        std::getline(ss, tc.operation, ',');
        std::getline(ss, tc.instruction_hex, ',');
        std::getline(ss, opcode_str, ',');
        std::getline(ss, rd_str, ',');
        std::getline(ss, rs1_str, ',');
        std::getline(ss, rs2_str, ',');
        std::getline(ss, imm_str, ',');

        tc.opcode= ParseDecimal(opcode_str);
        tc.rs1 = ParseDecimal(rs1_str);
        tc.rs2 = ParseDecimal(rs2_str);
        tc.rd  = ParseDecimal(rd_str);
        tc.imm = ParseInt32(imm_str);

        test_cases.push_back(tc);
    }
}

int main() {
    std::vector<TestCase> test_cases;
    cpu::CPU cpu;
    try {
        ReadCsv(kTestDataPath, test_cases);
    } catch (const std::exception& e) {
        printf("Error: %s\n", e.what());
        return 1;
    }

    // Print header.
    printf("%-30s | %-18s | %-8s | %-8s | %-8s | %-8s | %-8s | %-8s | %-8s | %-8s | %-14s | %-14s | %s\n",
       "Operation", "Hex", "Exp.Op", "Got.Op",
       "Exp.rs1", "Got.rs1", "Exp.rs2", "Got.rs2",
       "Exp.rd", "Got.rd", "Exp Imm", "Got Imm", "Status");
    int passed = 0;
    int failed = 0;

   for (const auto& tc : test_cases) {
    Word instr = ParseHex(tc.instruction_hex);
    auto decoded = cpu.Decode(instr);
    bool pass = (static_cast<int>(decoded.opcode) == tc.opcode) &&
                (decoded.rs1 == tc.rs1) &&
                (decoded.rs2 == tc.rs2) &&
                (decoded.rd  == tc.rd)  &&
                (decoded.imm == tc.imm);
    pass ? ++passed : ++failed;
    

            printf("%-30s | %-18s | %-8u | %-8d | %-8u | %-8u | %-8u | %-8u | %-8u | %-8u | %-14u | %-14u | %s\n",
                tc.operation.c_str(),
                tc.instruction_hex.c_str(),
                tc.opcode,
                static_cast<int>(decoded.opcode),
                tc.rs1,
                decoded.rs1,
                tc.rs2,
                decoded.rs2,
                tc.rd,
                decoded.rd,
                tc.imm,
                decoded.imm,
            pass ? "PASS" : "FAIL");
    }

    printf("\nTotal: %zu | Passed: %d | Failed: %d\n",
           test_cases.size(), passed, failed);

    return failed > 0 ? 1 : 0;
}
