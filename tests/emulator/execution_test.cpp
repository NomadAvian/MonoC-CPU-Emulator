#include "../../emulator/src/core/cpu.h"

#include <cstdint>
#include <cstdio>
#include <vector>
#include <string>

struct RTestCase {
    const char* description;
    isa::Opcode opcode;
    Word rs1_value;
    Word rs2_value;
    Word expected;
};

struct UTestCase {
    const char* description;
    isa::Opcode opcode;
    Word pc_before;
    int32_t imm;
    Word expected_rd;
};

struct STestCase {
    const char* description;
    isa::Opcode opcode;
    Word base_val;
    Word rs2_val;
    int32_t imm;
    Word expected_address;
    Word expected_memory_val;
};

struct BTestCase {
    const char* description;
    isa::Opcode opcode;
    Word pc_before;
    Word rs1_val;
    Word rs2_val;
    int32_t imm;
    Word expected_pc;
    bool expected_taken;
};

struct JTestCase {
    const char* description;
    Word pc_before;
    Word rd_index;
    int32_t imm;
    Word expected_rd_value;
    Word expected_pc;
};

struct IArithTestCase {
    const char* description;
    isa::Opcode opcode;
    Word rs1_value;
    int32_t imm;
    Word expected_rd;
};

struct IJalrTestCase {
    const char* description;
    Word pc_before;
    Word rs1_value;
    Word rd_index;
    int32_t imm;
    Word expected_rd_value;
    Word expected_pc;
};

struct ILoadTestCase {
    const char* description;
    isa::Opcode opcode;
    Word base_value;
    int32_t imm;
    Word address;        
    Word memory_value;   // word written there before the load for verification
    Word expected_rd;
};


const std::vector<RTestCase> kRTestData = {
    // Base R-type 
    {"ADD  20 + 6",              isa::Opcode::kAdd,    20, 6, 26},
    {"SUB  20 - 6",              isa::Opcode::kSub,    20, 6, 14},
    {"AND  20 & 6",              isa::Opcode::kAnd,    20, 6, 4},
    {"OR   20 | 6",              isa::Opcode::kOr,     20, 6, 22},
    {"XOR  20 ^ 6",              isa::Opcode::kXor,    20, 6, 18},

    // Shifts 
    {"SLL  20 << 6",             isa::Opcode::kSll,    20, 6, 1280},
    {"SRL  1280 >> 6",           isa::Opcode::kSrl,    1280, 6, 20},
    {"SRA  -1280 >> 6 signed",   isa::Opcode::kSra, static_cast<Word>(-1280), 6, static_cast<Word>(-20)},
    {"SRA  positive stays same", isa::Opcode::kSra,    1280, 6, 20},

    // Comparisons (result is 0 or 1)
    {"SLT  20 < 6 signed",       isa::Opcode::kSlt,    20, 6, 0},
    {"SLT  6 < 20 signed",       isa::Opcode::kSlt,    6, 20, 1},
    {"SLT  -1 < 1 signed",       isa::Opcode::kSlt, static_cast<Word>(-1), 1, 1},
    {"SLTU 0xFFFFFFFF < 1",      isa::Opcode::kSltu,   0xFFFFFFFF, 1, 0},
    {"SLTU 1 < 0xFFFFFFFF",      isa::Opcode::kSltu,   1, 0xFFFFFFFF, 1},

    // M extension (multiply)
    {"MUL  20 * 6",              isa::Opcode::kMul,    20, 6, 120},
    {"MUL  -20 * 6",             isa::Opcode::kMul,
        static_cast<Word>(-20), 6, static_cast<Word>(-120)},
    {"MULH high half of 20*6",   isa::Opcode::kMulh,   20, 6, 0},
    {"MULH -1 * -1 signed",      isa::Opcode::kMulh,
        static_cast<Word>(-1), static_cast<Word>(-1), 0},
    {"MULHU 0xFFFFFFFF squared", isa::Opcode::kMulhu,
        0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFE},
    {"MULHSU -1 by 0xFFFFFFFF",  isa::Opcode::kMulhsu,
        static_cast<Word>(-1), 0xFFFFFFFF, 0xFFFFFFFF},

    // M extension (divide and remainder)
    {"DIV  20 / 6",              isa::Opcode::kDiv,    20, 6, 3},
    {"DIV  -20 / 6",             isa::Opcode::kDiv,
        static_cast<Word>(-20), 6, static_cast<Word>(-3)},
    {"DIV  by zero",             isa::Opcode::kDiv,    20, 0, 0xFFFFFFFF},
    {"DIVU 20 / 6",              isa::Opcode::kDivu,   20, 6, 3},
    {"DIVU by zero",             isa::Opcode::kDivu,   20, 0, 0xFFFFFFFF},
    {"REM  20 % 6",              isa::Opcode::kRem,    20, 6, 2},
    {"REM  -20 % 6",             isa::Opcode::kRem,
        static_cast<Word>(-20), 6, static_cast<Word>(-2)},
    {"REM  by zero",             isa::Opcode::kRem,    20, 0, 20},
    {"REMU 20 % 6",              isa::Opcode::kRemu,   20, 6, 2},
    {"REMU by zero",             isa::Opcode::kRemu,   20, 0, 20},
};


const std::vector<UTestCase> kUTestData = {
    // LUI (writes the immediate directly, pc irrelevant)
    {"LUI 0x12345000",           isa::Opcode::kLui,   0x1000,
        static_cast<int32_t>(0x12345000), 0x12345000},
    {"LUI 0x80000000 sign bit",  isa::Opcode::kLui,   0x1000,
        static_cast<int32_t>(0x80000000), 0x80000000},
    {"LUI 0x00000000",           isa::Opcode::kLui,   0x1000, 0, 0},
    {"LUI 0xFFFFF000 all ones",  isa::Opcode::kLui,   0x1000,
        static_cast<int32_t>(0xFFFFF000), 0xFFFFF000},

    // AUIPC (pc + imm)
    {"AUIPC at pc=0",            isa::Opcode::kAuipc, 0x0,
        static_cast<int32_t>(0x12345000), 0x12345000},
    {"AUIPC at pc=0x1000",       isa::Opcode::kAuipc, 0x1000,
        static_cast<int32_t>(0x12345000), 0x12346000},
    {"AUIPC imm zero",           isa::Opcode::kAuipc, 0x2000, 0, 0x2000},
    {"AUIPC negative imm",       isa::Opcode::kAuipc, 0x5000,
        static_cast<int32_t>(0xFFFFF000), 0x4000},
    {"AUIPC wraps at high pc",   isa::Opcode::kAuipc, 0xFFFFF000,
        static_cast<int32_t>(0x00002000), 0x1000},
};

const std::vector<STestCase> kSTestData = {
    {"SB 0xAB at 0x100",         isa::Opcode::kSb, 0x100, 0xAB,        0, 0x100, 0x000000AB},
    {"SB high bits ignored",     isa::Opcode::kSb, 0x100, 0xFFFFFFAB,  0, 0x100, 0x000000AB},
    {"SB with imm +4",           isa::Opcode::kSb, 0x100, 0xCD,        4, 0x104, 0x000000CD},
    {"SB with imm -4",           isa::Opcode::kSb, 0x104, 0xEF,       -4, 0x100, 0x000000EF},

    {"SH 0x1234 at 0x200",       isa::Opcode::kSh, 0x200, 0x1234,      0, 0x200, 0x00001234},
    {"SH high bits ignored",     isa::Opcode::kSh, 0x200, 0xFFFF1234,  0, 0x200, 0x00001234},
    {"SH with imm +4",           isa::Opcode::kSh, 0x200, 0x5678,      4, 0x204, 0x00005678},
    {"SH with imm -4",           isa::Opcode::kSh, 0x204, 0x9ABC,     -4, 0x200, 0x00009ABC},

    {"SW 0x12345678 at 0x300",   isa::Opcode::kSw, 0x300, 0x12345678,  0, 0x300, 0x12345678},
    {"SW all ones",              isa::Opcode::kSw, 0x300, 0xFFFFFFFF,  0, 0x300, 0xFFFFFFFF},
    {"SW with imm +4",           isa::Opcode::kSw, 0x300, 0xDEADBEEF,  4, 0x304, 0xDEADBEEF},
    {"SW with imm -4",           isa::Opcode::kSw, 0x304, 0xCAFEBABE, -4, 0x300, 0xCAFEBABE},
    {"SW zero",                  isa::Opcode::kSw, 0x300, 0,           0, 0x300, 0x00000000},
};

const std::vector<BTestCase> kBTestData = {
    // BEQ / BNE with distinct operands.
    {"BEQ 5 == 5 taken",        isa::Opcode::kBeq, 0x1000, 5, 5,  8, 0x1008, true},
    {"BEQ 5 == 6 not taken",    isa::Opcode::kBeq, 0x1000, 5, 6,  8, 0x1000, false},
    {"BNE 5 != 6 taken",        isa::Opcode::kBne, 0x1000, 5, 6,  8, 0x1008, true},
    {"BNE 5 != 5 not taken",    isa::Opcode::kBne, 0x1000, 5, 5,  8, 0x1000, false},

    // BLT / BGE signed.
    {"BLT 3 < 7 taken",         isa::Opcode::kBlt, 0x1000, 3, 7,  8, 0x1008, true},
    {"BLT 7 < 3 not taken",     isa::Opcode::kBlt, 0x1000, 7, 3,  8, 0x1000, false},
    {"BGE 7 >= 3 taken",        isa::Opcode::kBge, 0x1000, 7, 3,  8, 0x1008, true},
    {"BGE 3 >= 7 not taken",    isa::Opcode::kBge, 0x1000, 3, 7,  8, 0x1000, false},

    // BLTU / BGEU unsigned.
    {"BLTU 3 < 7 taken",        isa::Opcode::kBltu, 0x1000, 3, 7, 8, 0x1008, true},
    {"BLTU 7 < 3 not taken",    isa::Opcode::kBltu, 0x1000, 7, 3, 8, 0x1000, false},
    {"BGEU 7 >= 3 taken",       isa::Opcode::kBgeu, 0x1000, 7, 3, 8, 0x1008, true},
    {"BGEU 3 >= 7 not taken",   isa::Opcode::kBgeu, 0x1000, 3, 7, 8, 0x1000, false},

    // Signed vs unsigned divergence (same operands, opposite outcomes)
    {"BLT -1 < 1 taken",        isa::Opcode::kBlt,  0x1000, 0xFFFFFFFF, 1, 8, 0x1008, true},
    {"BLTU 0xFFFFFFFF < 1 not", isa::Opcode::kBltu, 0x1000, 0xFFFFFFFF, 1, 8, 0x1000, false},
    {"BGE -1 >= 1 not taken",   isa::Opcode::kBge,  0x1000, 0xFFFFFFFF, 1, 8, 0x1000, false},
    {"BGEU 0xFFFFFFFF >= 1",    isa::Opcode::kBgeu, 0x1000, 0xFFFFFFFF, 1, 8, 0x1008, true},

    // Equal operands across all six (distinctive taken pattern)
    {"BEQ equal taken",         isa::Opcode::kBeq,  0x1000, 42, 42, 8, 0x1008, true},
    {"BNE equal not taken",     isa::Opcode::kBne,  0x1000, 42, 42, 8, 0x1000, false},
    {"BLT equal not taken",     isa::Opcode::kBlt,  0x1000, 42, 42, 8, 0x1000, false},
    {"BGE equal taken",         isa::Opcode::kBge,  0x1000, 42, 42, 8, 0x1008, true},
    {"BLTU equal not taken",    isa::Opcode::kBltu, 0x1000, 42, 42, 8, 0x1000, false},
    {"BGEU equal taken",        isa::Opcode::kBgeu, 0x1000, 42, 42, 8, 0x1008, true},

    // Backward branch (how loops are encoded)
    {"BEQ backward -8",         isa::Opcode::kBeq,  0x1000, 5, 5, -8, 0x0FF8, true},
    {"BNE backward -16",        isa::Opcode::kBne,  0x1000, 5, 6, -16, 0x0FF0, true},

    // Zero offset (self-branch. Taken, PC unchanged)
    {"BEQ offset zero",         isa::Opcode::kBeq,  0x1000, 5, 5, 0, 0x1000, true},
};

const std::vector<JTestCase> kJTestData = {
    {"JAL x1 forward +8",       0x1000, 1,   8, 0x1004, 0x1008},
    {"JAL x1 forward +2048",    0x1000, 1, 2048, 0x1004, 0x1800},
    {"JAL x1 backward -8",      0x1000, 1,  -8, 0x1004, 0x0FF8},
    {"JAL x1 backward -2048",   0x1000, 1, -2048, 0x1004, 0x0800},
    {"JAL x0 discards link",    0x1000, 0,   8,      0, 0x1008},
    {"JAL x5 alt link reg",     0x1000, 5,   8, 0x1004, 0x1008},
    {"JAL at pc zero",          0x0000, 1,   8, 0x0004, 0x0008},
    {"JAL offset zero",         0x1000, 1,   0, 0x1004, 0x1000},
    {"JAL wraps at high pc",    0xFFFFFFF8, 1, 16, 0xFFFFFFFC, 0x00000008},
};

const std::vector<IArithTestCase> kIArithTestData = {
    {"ADDI 20 + 6",             isa::Opcode::kAddi,  20,  6, 26},
    {"ADDI 20 + -6",            isa::Opcode::kAddi,  20, -6, 14},
    {"ADDI 0 + -1",             isa::Opcode::kAddi,   0, -1, 0xFFFFFFFF},
    {"ADDI max positive imm",   isa::Opcode::kAddi,   0, 2047, 2047},
    {"ADDI max negative imm",   isa::Opcode::kAddi,   0, -2048, 0xFFFFF800},

    {"ANDI 20 & 6",             isa::Opcode::kAndi,  20,  6, 4},
    {"ORI  20 | 6",             isa::Opcode::kOri,   20,  6, 22},
    {"XORI 20 ^ 6",             isa::Opcode::kXori,  20,  6, 18},
    {"XORI with -1 inverts",    isa::Opcode::kXori,  20, -1, 0xFFFFFFEB},

    {"SLTI 20 < 6 signed",      isa::Opcode::kSlti,  20,  6, 0},
    {"SLTI 6 < 20 signed",      isa::Opcode::kSlti,   6, 20, 1},
    {"SLTI -1 < 1 signed",      isa::Opcode::kSlti, 0xFFFFFFFF, 1, 1},
    {"SLTIU 0xFFFFFFFF < 1",    isa::Opcode::kSltiu, 0xFFFFFFFF, 1, 0},
    {"SLTIU 1 < -1 unsigned",   isa::Opcode::kSltiu,  1, -1, 1},

    {"SLLI 20 << 6",            isa::Opcode::kSlli,  20,  6, 1280},
    {"SRLI 1280 >> 6",          isa::Opcode::kSrli, 1280, 6, 20},
    {"SRAI -1280 >> 6 signed",  isa::Opcode::kSrai, 0xFFFFFB00, 6, 0xFFFFFFEC},
    {"SRAI positive stays",     isa::Opcode::kSrai, 1280, 6, 20},
};

const std::vector<ILoadTestCase> kILoadTestData = {
    {"LW 0x12345678",        isa::Opcode::kLw,  0x100,  0, 0x100, 0x12345678, 0x12345678},
    {"LW with imm +4",       isa::Opcode::kLw,  0x100,  4, 0x104, 0xDEADBEEF, 0xDEADBEEF},
    {"LW with imm -4",       isa::Opcode::kLw,  0x104, -4, 0x100, 0xCAFEBABE, 0xCAFEBABE},

    {"LB 0x7F positive",     isa::Opcode::kLb,  0x200,  0, 0x200, 0x0000007F, 0x0000007F},
    {"LB 0xFF sign extends", isa::Opcode::kLb,  0x200,  0, 0x200, 0x000000FF, 0xFFFFFFFF},
    {"LB 0x80 sign extends", isa::Opcode::kLb,  0x200,  0, 0x200, 0x00000080, 0xFFFFFF80},
    {"LB ignores high bytes",isa::Opcode::kLb,  0x200,  0, 0x200, 0xFFFFFF01, 0x00000001},

    {"LBU 0xFF zero extends",isa::Opcode::kLbu, 0x200,  0, 0x200, 0x000000FF, 0x000000FF},
    {"LBU 0x80 zero extends",isa::Opcode::kLbu, 0x200,  0, 0x200, 0x00000080, 0x00000080},

    {"LH 0x7FFF positive",   isa::Opcode::kLh,  0x300,  0, 0x300, 0x00007FFF, 0x00007FFF},
    {"LH 0xFFFF sign ext",   isa::Opcode::kLh,  0x300,  0, 0x300, 0x0000FFFF, 0xFFFFFFFF},
    {"LH 0x8000 sign ext",   isa::Opcode::kLh,  0x300,  0, 0x300, 0x00008000, 0xFFFF8000},

    {"LHU 0xFFFF zero ext",  isa::Opcode::kLhu, 0x300,  0, 0x300, 0x0000FFFF, 0x0000FFFF},
    {"LHU 0x8000 zero ext",  isa::Opcode::kLhu, 0x300,  0, 0x300, 0x00008000, 0x00008000},
};

const std::vector<IJalrTestCase> kIJalrTestData = {
    {"JALR x1, rs1=0x2000, +0",   0x1000, 0x2000, 1,   0, 0x1004, 0x2000},
    {"JALR x1, rs1=0x2000, +8",   0x1000, 0x2000, 1,   8, 0x1004, 0x2008},
    {"JALR x1, rs1=0x2000, -8",   0x1000, 0x2000, 1,  -8, 0x1004, 0x1FF8},
    {"JALR clears LSB odd sum",   0x1000, 0x2001, 1,   0, 0x1004, 0x2000},
    {"JALR clears LSB via imm",   0x1000, 0x2000, 1,   1, 0x1004, 0x2000},
    {"JALR x0 discards link",     0x1000, 0x2000, 0,   8,      0, 0x2008},
    {"JALR rd == rs1 hazard",     0x1000, 0x2000, 1,   8, 0x1004, 0x2008},
    {"JALR target independent of pc", 0x8000, 0x2000, 1, 0, 0x8004, 0x2000},
};

int TestRType(const std::vector<RTestCase>& data) {
  int failed = 0;

  printf("%-30s | %-10s | %-10s | %-10s | %-10s | %-10s | %s\n",
         "Description", "rs1", "rs2", "Expected", "Got", "PC Changed", "Status");

  for (const auto& item : data) {
    cpu::CPU cpu("");
    Word pc_before = cpu.pc();
    cpu.WriteReg(1, item.rs1_value);
    cpu.WriteReg(2, item.rs2_value);

    cpu::DecodedInstruction instr{item.opcode, 1, 2, 3, 0};
    bool pc_changed = cpu.ExecuteRType(instr);

    Word got = cpu.ReadReg(3);
    bool pass = (got == item.expected && pc_before == cpu.pc() && pc_changed == false);
    if (!pass) ++failed;

    printf("%-30s | %-10u | %-10u | %-10u | %-10u | %-10s | %s\n",
           item.description,
           item.rs1_value,
           item.rs2_value,
           item.expected,
           got,
           pc_changed ? "Yes" : "No",
           pass ? "PASS" : "FAIL");
  }

  return failed;
}

int TestUType(const std::vector<UTestCase>& data) {
    int failed = 0;

    printf("%-30s | %-10s | %-10s | %-10s | %-10s | %s\n",
         "Description", "imm", "Expected Rd", "Got Rd", "PC Changed", "Status");
    
    for(const auto& item : data) {
        cpu::CPU cpu("");
        cpu.set_pc_for_testing(item.pc_before);
        cpu::DecodedInstruction instr{item.opcode, 0, 0, 3, item.imm};
        bool pc_changed = cpu.ExecuteUType(instr);
        Word got = cpu.ReadReg(3);
        bool pass = (cpu.pc() == item.pc_before) && (got == item.expected_rd) &&
                    (pc_changed == false);
        if(!pass) ++failed;

         printf("%-30s | %-10d | %-10u | %-10u | %-10s | %s\n",
           item.description,
           item.imm,
           item.expected_rd,
           got,
           pc_changed ? "Yes" : "No",
           pass ? "PASS" : "FAIL");

    }
    return failed;
}

int TestSType(const std::vector<STestCase>& data) {
    int failed = 0;

    printf("%-30s | %-8s | %-10s | %-10s | %-8s | %-12s | %-12s | %-12s | %-10s | %s\n",
        "Description", "Opcode", "Base value", "Rs2 value", "Imm",
        "Expected Addr", "Expected mem", "Got mem", "PC Changed", "Status");

    for(const auto& item : data) {
        cpu::CPU cpu("");
        Word pc_before = cpu.pc();
        cpu.WriteReg(1, item.base_val);
        cpu.WriteReg(2, item.rs2_val);
        cpu::DecodedInstruction instr{item.opcode, 1, 2, 0, item.imm};
        bool pc_changed = cpu.ExecuteSType(instr);

        // always read a full word so an over-wide store is visible.
        Word memory_val = cpu.ReadMemoryWord(item.expected_address);

        bool pass = (memory_val == item.expected_memory_val) &&
                    (cpu.pc() == pc_before);
        if(!pass) ++failed;

        printf("%-30s | %-8d | %-10u | %-10u | %-8d | %-12u | %-12u | %-12u | %-10s | %s\n",
            item.description,
            static_cast<int>(item.opcode),
            item.base_val,
            item.rs2_val,
            item.imm,
            item.expected_address,
            item.expected_memory_val,
            memory_val,
            pc_changed ? "Yes" : "No",
            pass ? "PASS" : "FAIL");
    }
    return failed;
}

int TestBType(const std::vector<BTestCase>& data) {
    int failed = 0;

    printf("%-30s | %-8s | %-10s | %-10s | %-10s | %-8s | %-12s | %-12s | %-14s | %-10s | %s\n",
        "Description", "Opcode", "PC Before", "Rs1 value", "Rs2 value", "Imm",
        "Expected PC", "Got PC", "Expected taken", "Got taken", "Status");

    for(const auto& item : data) {
        cpu::CPU cpu("");
        cpu.set_pc_for_testing(item.pc_before);
        cpu.WriteReg(1, item.rs1_val);
        cpu.WriteReg(2, item.rs2_val);
        cpu::DecodedInstruction instr{item.opcode, 1, 2, 0, item.imm};
        bool taken = cpu.ExecuteBType(instr);
        bool pass = cpu.pc() == item.expected_pc && taken == item.expected_taken;
        if(!pass) ++failed;

        printf("%-30s | %-8d | %-10u | %-10u | %-10u | %-8d | %-12u | %-12u | %-14s | %-10s | %s\n",
        item.description,
        static_cast<int>(item.opcode),
        item.pc_before,
        item.rs1_val,
        item.rs2_val,
        item.imm,
        item.expected_pc,
        cpu.pc(),
        item.expected_taken ? "Yes" : "No",
        taken ? "Yes" : "No",
        pass ? "PASS" : "FAIL");
    }
    return failed;

}

int TestJType(const std::vector<JTestCase>& data) {
    int failed = 0;

    printf("%-30s | %-10s | %-10s | %-12s | %-15s | %-12s | %-12s | %-12s | %s\n",
        "Description", "PC Before", "Rd Index", "Imm",
        "Expected Rd Val", "Got Rd Val", "Expected Pc", "Got PC", "Status");

    for(const auto& item : data) {
        cpu::CPU cpu("");
        cpu.set_pc_for_testing(item.pc_before);
        cpu::DecodedInstruction instr{isa::Opcode::kJal, 0, 0, item.rd_index, item.imm};
        bool taken = cpu.ExecuteJType(instr); 
        Word rd = cpu.ReadReg(item.rd_index);
        bool pass = (rd ==item.expected_rd_value) && (cpu.pc() == item.expected_pc) && (taken == true);
        if(!pass) ++failed;

        printf("%-30s | %-10u | %-10u | %-12d | %-15u | %-12u | %-12u | %-12u | %s\n",
            item.description,
            item.pc_before,
            item.rd_index,
            item.imm,
            item.expected_rd_value,
            rd,
            item.expected_pc,
            cpu.pc(),
            pass ? "PASS" : "FAIL");
    }
    return failed;
}

int TestIArithType(const std::vector<IArithTestCase>& data) {
  int failed = 0;

  printf("%-30s | %-10s | %-10s | %-10s | %-10s | %-10s | %s\n",
         "Description", "rs1", "imm", "Expected Rd", "Got Rd", "PC Changed", "Status");

  for (const auto& item : data) {
    cpu::CPU cpu("");
    Word pc_before = cpu.pc();
    cpu.WriteReg(1, item.rs1_value);

    cpu::DecodedInstruction instr{item.opcode, 1, 0, 3, item.imm};
    bool pc_changed = cpu.ExecuteIType(instr);

    Word got = cpu.ReadReg(3);
    bool pass = (got == item.expected_rd && pc_before == cpu.pc() && pc_changed == false);
    if (!pass) ++failed;

    printf("%-30s | %-10u | %-10d | %-10u | %-10u | %-10s | %s\n",
           item.description,
           item.rs1_value,
           item.imm,
           item.expected_rd,
           got,
           pc_changed ? "Yes" : "No",
           pass ? "PASS" : "FAIL");
  }

  return failed;
}

int TestILoadType(const std::vector<ILoadTestCase>& data) {
    int failed = 0;

    printf("%-30s | %-10s | %-8s | %-10s | %-12s | %-12s | %-12s | %s\n",
        "Description", "Base", "Imm", "Address", "Mem value",
        "Expected Rd", "Got Rd", "Status");

    for(const auto& item : data) {
        cpu::CPU cpu("");
        cpu.write_memory_word_for_testing(item.address, item.memory_value);
        cpu.WriteReg(1, item.base_value);
        cpu::DecodedInstruction instr{item.opcode, 1, 0, 3, item.imm};
        bool pc_changed = cpu.ExecuteIType(instr);
        Word rd = cpu.ReadReg(3);
        bool pass = (rd == item.expected_rd) && (pc_changed == false);
        if(!pass) ++failed;

        printf("%-30s | 0x%08X | %-8d | 0x%08X | 0x%08X   | 0x%08X   | 0x%08X   | %s\n",
            item.description,
            item.base_value,
            item.imm,
            item.address,
            item.memory_value,
            item.expected_rd,
            rd,
            pass ? "PASS" : "FAIL");
    }
    return failed;

}


int TestIJalrType(const std::vector<IJalrTestCase>& data) {
    int failed = 0;

    printf("%-30s | %-10s | %-10s | %-12s | %-12s | %-15s | %-12s | %-12s | %-12s | %s\n",
        "Description", "PC Before", "Rs1 value", "Rd Index", "Imm",
        "Expected Rd Val", "Got Rd Val", "Expected Pc", "Got PC", "Status");

    for(const auto& item : data) {
        cpu::CPU cpu("");
        cpu.set_pc_for_testing(item.pc_before);
        cpu.WriteReg(1, item.rs1_value);
        cpu::DecodedInstruction instr{isa::Opcode::kJalr, 1, 0, item.rd_index, item.imm};
        bool taken = cpu.ExecuteIType(instr); 
        Word rd = cpu.ReadReg(item.rd_index);
        bool pass = (rd == item.expected_rd_value) && (cpu.pc() == item.expected_pc) && (taken == true);
        if(!pass) ++failed;

        printf("%-30s | %-10u | %-10u | %-12u | %-12d | %-15u | %-12u | %-12u | %-12u | %s\n",
            item.description,
            item.pc_before,
            item.rs1_value,      
            item.rd_index,
            item.imm,
            item.expected_rd_value,
            rd,
            item.expected_pc,
            cpu.pc(),
            pass ? "PASS" : "FAIL");
    }
    return failed;
}


int main() {
    int failure = 0;
    printf("Testing R type executions.\n");
    failure += TestRType(kRTestData);
    printf("\nTesting U type executions.\n");
    failure += TestUType(kUTestData);
    printf("\nTesting S type execution.\n");
    failure += TestSType(kSTestData);
    printf("\nTesting B type execution.\n");
    failure += TestBType(kBTestData);
    printf("\nTesting J type execution.\n");
    failure += TestJType(kJTestData);
    printf("\nTesting I Arithmatic type execution.\n");
    failure += TestIArithType(kIArithTestData);
    printf("\nTesting I Load execution.\n");
    failure += TestILoadType(kILoadTestData);
    printf("\nTesting I JALR execution.\n");
    failure += TestIJalrType(kIJalrTestData);
    printf("\nTotal failures: %d\n", failure);
    return failure > 0 ? 1 : 0;

}