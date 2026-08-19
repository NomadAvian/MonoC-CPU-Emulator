#include "parser.h"

#include <algorithm>
#include <stdexcept>

namespace riscv {

// Instruction encoding table
const std::unordered_map<std::string, Parser::Entry> Parser::kEntries = {
    // R-type (opcode 0x33)
    {"add",    {Format::kR, 0x33, 0x0, 0x00, 0}},
    {"sub",    {Format::kR, 0x33, 0x0, 0x20, 0}},
    {"sll",    {Format::kR, 0x33, 0x1, 0x00, 0}},
    {"slt",    {Format::kR, 0x33, 0x2, 0x00, 0}},
    {"sltu",   {Format::kR, 0x33, 0x3, 0x00, 0}},
    {"xor",    {Format::kR, 0x33, 0x4, 0x00, 0}},
    {"srl",    {Format::kR, 0x33, 0x5, 0x00, 0}},
    {"sra",    {Format::kR, 0x33, 0x5, 0x20, 0}},
    {"or",     {Format::kR, 0x33, 0x6, 0x00, 0}},
    {"and",    {Format::kR, 0x33, 0x7, 0x00, 0}},

    // M-extension (opcode 0x33, funct7 0x01)
    {"mul",    {Format::kR, 0x33, 0x0, 0x01, 0}},
    {"mulh",   {Format::kR, 0x33, 0x1, 0x01, 0}},
    {"mulhsu", {Format::kR, 0x33, 0x2, 0x01, 0}},
    {"mulhu",  {Format::kR, 0x33, 0x3, 0x01, 0}},
    {"div",    {Format::kR, 0x33, 0x4, 0x01, 0}},
    {"divu",   {Format::kR, 0x33, 0x5, 0x01, 0}},
    {"rem",    {Format::kR, 0x33, 0x6, 0x01, 0}},
    {"remu",   {Format::kR, 0x33, 0x7, 0x01, 0}},

    // I-type arithmetic/immediate (opcode 0x13)
    {"addi",   {Format::kI, 0x13, 0x0, 0x00, 0}},
    {"slti",   {Format::kI, 0x13, 0x2, 0x00, 0}},
    {"sltiu",  {Format::kI, 0x13, 0x3, 0x00, 0}},
    {"xori",   {Format::kI, 0x13, 0x4, 0x00, 0}},
    {"ori",    {Format::kI, 0x13, 0x6, 0x00, 0}},
    {"andi",   {Format::kI, 0x13, 0x7, 0x00, 0}},

    // Shifts (opcode 0x13, shamt in imm[4:0], funct7 in imm[11:5])
    {"slli",   {Format::kShift, 0x13, 0x1, 0x00, 0}},
    {"srli",   {Format::kShift, 0x13, 0x5, 0x00, 0}},
    {"srai",   {Format::kShift, 0x13, 0x5, 0x20, 0}},

    // Loads (opcode 0x03)
    {"lb",     {Format::kLoad, 0x03, 0x0, 0x00, 0}},
    {"lh",     {Format::kLoad, 0x03, 0x1, 0x00, 0}},
    {"lw",     {Format::kLoad, 0x03, 0x2, 0x00, 0}},
    {"lbu",    {Format::kLoad, 0x03, 0x4, 0x00, 0}},
    {"lhu",    {Format::kLoad, 0x03, 0x5, 0x00, 0}},

    // Stores (opcode 0x23)
    {"sb",     {Format::kStore, 0x23, 0x0, 0x00, 0}},
    {"sh",     {Format::kStore, 0x23, 0x1, 0x00, 0}},
    {"sw",     {Format::kStore, 0x23, 0x2, 0x00, 0}},

    // Branches (opcode 0x63)
    {"beq",    {Format::kB, 0x63, 0x0, 0x00, 0}},
    {"bne",    {Format::kB, 0x63, 0x1, 0x00, 0}},
    {"blt",    {Format::kB, 0x63, 0x4, 0x00, 0}},
    {"bge",    {Format::kB, 0x63, 0x5, 0x00, 0}},
    {"bltu",   {Format::kB, 0x63, 0x6, 0x00, 0}},
    {"bgeu",   {Format::kB, 0x63, 0x7, 0x00, 0}},

    // Upper immediates
    {"lui",    {Format::kU, 0x37, 0x0, 0x00, 0}},
    {"auipc",  {Format::kU, 0x17, 0x0, 0x00, 0}},

    // Jumps
    {"jal",    {Format::kJ, 0x6F, 0x0, 0x00, 0}},
    {"jalr",   {Format::kJalr, 0x67, 0x0, 0x00, 0}},

    // System
    {"fence",  {Format::kNone, 0x0F, 0x0, 0x00, 0x0FF}},
    {"ecall",  {Format::kNone, 0x73, 0x0, 0x00, 0}},
    {"ebreak", {Format::kNone, 0x73, 0x0, 0x00, 1}},
};

const std::unordered_map<std::string, int> Parser::kAbiRegisters = {
    {"zero", 0},  {"ra", 1},   {"sp", 2},   {"gp", 3},   {"tp", 4},
    {"t0", 5},    {"t1", 6},   {"t2", 7},   {"s0", 8},   {"fp", 8},
    {"s1", 9},    {"a0", 10},  {"a1", 11},  {"a2", 12},  {"a3", 13},
    {"a4", 14},   {"a5", 15},  {"a6", 16},  {"a7", 17},  {"s2", 18},
    {"s3", 19},   {"s4", 20},  {"s5", 21},  {"s6", 22},  {"s7", 23},
    {"s8", 24},   {"s9", 25},  {"s10", 26}, {"s11", 27}, {"t3", 28},
    {"t4", 29},   {"t5", 30},  {"t6", 31},
};

void Parser::Assemble(const std::string& source, std::vector<Word>& words) {
    Scanner scanner(source);
    try {
        tokens_ = scanner.ScanTokens();
    } catch (const riscv::Error&) {
        throw std::runtime_error("parser: lexical error while scanning input");
    }

    SplitStatements();
    FirstPass();
    SecondPass(words);
}

void Parser::SplitStatements() {
    for (const Token& token : tokens_) {
        if (token.type() == TokenType::kEndOfFile) continue;
        if (statements_.empty() || statements_.back().line != token.line()) {
            statements_.push_back(Statement{token.line(), {}});
        }
        statements_.back().tokens.push_back(token);
    }
}

size_t Parser::FirstNonLabel(const Statement& stmt) {
    for (size_t i = 0; i < stmt.tokens.size(); ++i) {
        if (stmt.tokens[i].type() != TokenType::kLabelDef) return i;
    }
    return stmt.tokens.size();
}

void Parser::FirstPass() {
    byte_buffer_.clear();
    Word pc = 0;
    for (const Statement& stmt : statements_) {
        size_t idx = FirstNonLabel(stmt);

        for (size_t k = 0; k < idx; ++k) {
            std::string name = stmt.tokens[k].lexeme();
            if (!name.empty() && name.back() == ':') name.pop_back();
            if (symbols_.find(name) != symbols_.end()) {
                Error(stmt, "duplicate label '" + name + "'");
            }
            symbols_[name] = pc;
        }

        if (idx >= stmt.tokens.size()) continue;  // label-only line

        const Token& t = stmt.tokens[idx];
        if (t.type() == TokenType::kInstruction) {
            if (IsPseudoInstruction(t.lexeme())) {
                pc += static_cast<Word>(4 * PseudoExpansionWords(stmt, idx));
            } else {
                pc += 4;
            }
            continue;
        }
        if (t.type() != TokenType::kDirective) {
            Error(stmt, "expected instruction or directive");
        }

        std::string d = t.lexeme();
        if (!d.empty() && d.front() == '.') d.erase(0, 1);

        if (d == "text" || d == "data" || d == "globl" || d == "global" ||
            d == "rodata" || d == "bss") {
            continue;
        } else if (d == "section") {
            // .section name [, "flags"] — logical marker, no effect on output
            size_t i = idx + 1;
            if (i >= stmt.tokens.size() ||
                (stmt.tokens[i].type() != TokenType::kIdentifier &&
                 stmt.tokens[i].type() != TokenType::kString &&
                 stmt.tokens[i].type() != TokenType::kDirective)) {
                Error(stmt, "expected section name");
            }
            ++i;
            if (i < stmt.tokens.size()) {
                if (stmt.tokens[i].type() != TokenType::kComma) {
                    Error(stmt, "expected ',' after section name");
                }
                ++i;
                if (i >= stmt.tokens.size() ||
                    stmt.tokens[i].type() != TokenType::kString) {
                    Error(stmt, "expected flags string");
                }
                ++i;
            }
            ExpectEnd(stmt, i);
        } else if (d == "word") {
            size_t i = idx + 1;
            bool expect_value = true;
            int count = 0;
            while (i < stmt.tokens.size()) {
                const Token& v = stmt.tokens[i];
                if (expect_value) {
                    if (v.type() != TokenType::kInteger &&
                        v.type() != TokenType::kIdentifier) {
                        Error(stmt, "expected value in .word");
                    }
                    ++count;
                    expect_value = false;
                    ++i;
                } else if (v.type() == TokenType::kComma) {
                    expect_value = true;
                    ++i;
                } else {
                    Error(stmt, "expected ',' in .word");
                }
            }
            if (count == 0) {
                Error(stmt, ".word requires at least one value");
            }
            pc += static_cast<Word>(4 * count);
        } else if (d == "byte") {
            size_t i = idx + 1;
            bool expect_value = true;
            int count = 0;
            while (i < stmt.tokens.size()) {
                const Token& v = stmt.tokens[i];
                if (expect_value) {
                    if (v.type() != TokenType::kInteger &&
                        v.type() != TokenType::kIdentifier) {
                        Error(stmt, "expected value in .byte");
                    }
                    ++count;
                    expect_value = false;
                    ++i;
                } else if (v.type() == TokenType::kComma) {
                    expect_value = true;
                    ++i;
                } else {
                    Error(stmt, "expected ',' in .byte");
                }
            }
            if (count == 0) {
                Error(stmt, ".byte requires at least one value");
            }
            pc += static_cast<Word>(count);
        } else if (d == "half") {
            size_t i = idx + 1;
            bool expect_value = true;
            int count = 0;
            while (i < stmt.tokens.size()) {
                const Token& v = stmt.tokens[i];
                if (expect_value) {
                    if (v.type() != TokenType::kInteger &&
                        v.type() != TokenType::kIdentifier) {
                        Error(stmt, "expected value in .half");
                    }
                    ++count;
                    expect_value = false;
                    ++i;
                } else if (v.type() == TokenType::kComma) {
                    expect_value = true;
                    ++i;
                } else {
                    Error(stmt, "expected ',' in .half");
                }
            }
            if (count == 0) {
                Error(stmt, ".half requires at least one value");
            }
            pc += static_cast<Word>(2 * count);
        } else if (d == "align") {
            size_t i = idx + 1;
            int64_t n = ExpectInteger(stmt, i);
            ExpectEnd(stmt, i);
            if (n < 0 || n > 30) {
                Error(stmt, "invalid .align exponent");
            }
            Word mask = (Word(1) << n) - 1;
            pc = (pc + mask) & ~mask;
        } else if (d == "equ") {
            size_t i = idx + 1;
            if (i >= stmt.tokens.size() ||
                stmt.tokens[i].type() != TokenType::kIdentifier) {
                Error(stmt, "expected symbol name in .equ");
            }
            std::string name = stmt.tokens[i].lexeme();
            ++i;
            if (i >= stmt.tokens.size() ||
                stmt.tokens[i].type() != TokenType::kComma) {
                Error(stmt, "expected ',' in .equ");
            }
            ++i;
            int64_t value = ExpectInteger(stmt, i);
            ExpectEnd(stmt, i);
            symbols_[name] = static_cast<Word>(value);
        } else {
            Error(stmt, "unknown directive '" + t.lexeme() + "'");
        }
    }
}

void Parser::SecondPass(std::vector<Word>& words) {
    Word pc = 0;
    for (const Statement& stmt : statements_) {
        size_t idx = FirstNonLabel(stmt);
        if (idx >= stmt.tokens.size()) continue;  // label-only line

        const Token& t = stmt.tokens[idx];
        if (t.type() == TokenType::kInstruction) {
            if (IsPseudoInstruction(t.lexeme())) {
                FlushBytes(words, pc);
                EncodePseudo(stmt, idx, pc, words);
                pc += static_cast<Word>(4 * PseudoExpansionWords(stmt, idx));
            } else {
                FlushBytes(words, pc);
                Word w;
                EncodeInstruction(stmt, idx, pc, w);
                words.push_back(w);
                pc += 4;
            }
            continue;
        }
        if (t.type() != TokenType::kDirective) {
            Error(stmt, "expected instruction or directive");
        }

        std::string d = t.lexeme();
        if (!d.empty() && d.front() == '.') d.erase(0, 1);

        if (d == "text" || d == "data" || d == "globl" || d == "global" ||
            d == "rodata" || d == "bss") {
            continue;
        } else if (d == "section") {
            // .section name [, "flags"] — logical marker, no effect on output
            // arguments validated in FirstPass, nothing to do here
            continue;
        } else if (d == "word") {
            FlushBytes(words, pc);
            size_t i = idx + 1;
            bool expect_value = true;
            while (i < stmt.tokens.size()) {
                const Token& v = stmt.tokens[i];
                if (expect_value) {
                    int64_t val = 0;
                    if (v.type() == TokenType::kInteger) {
                        val = std::get<int64_t>(v.literal());
                        ++i;
                    } else if (v.type() == TokenType::kIdentifier) {
                        val = Resolve(stmt, v);
                        ++i;
                    } else {
                        Error(stmt, "expected value in .word");
                    }
                    words.push_back(static_cast<Word>(val));
                    pc += 4;
                    expect_value = false;
                } else if (v.type() == TokenType::kComma) {
                    ++i;
                    expect_value = true;
                } else {
                    Error(stmt, "expected ',' in .word");
                }
            }
        } else if (d == "byte") {
            size_t i = idx + 1;
            bool expect_value = true;
            while (i < stmt.tokens.size()) {
                const Token& v = stmt.tokens[i];
                if (expect_value) {
                    int64_t val = 0;
                    if (v.type() == TokenType::kInteger) {
                        val = std::get<int64_t>(v.literal());
                        ++i;
                    } else if (v.type() == TokenType::kIdentifier) {
                        val = Resolve(stmt, v);
                        ++i;
                    } else {
                        Error(stmt, "expected value in .byte");
                    }
                    EmitByte(static_cast<Byte>(val), words, pc);
                    expect_value = false;
                } else if (v.type() == TokenType::kComma) {
                    ++i;
                    expect_value = true;
                } else {
                    Error(stmt, "expected ',' in .byte");
                }
            }
        } else if (d == "half") {
            size_t i = idx + 1;
            bool expect_value = true;
            while (i < stmt.tokens.size()) {
                const Token& v = stmt.tokens[i];
                if (expect_value) {
                    int64_t val = 0;
                    if (v.type() == TokenType::kInteger) {
                        val = std::get<int64_t>(v.literal());
                        ++i;
                    } else if (v.type() == TokenType::kIdentifier) {
                        val = Resolve(stmt, v);
                        ++i;
                    } else {
                        Error(stmt, "expected value in .half");
                    }
                    uint16_t hv = static_cast<uint16_t>(val);
                    EmitByte(static_cast<Byte>(hv & 0xFF), words, pc);
                    EmitByte(static_cast<Byte>((hv >> 8) & 0xFF), words, pc);
                    expect_value = false;
                } else if (v.type() == TokenType::kComma) {
                    ++i;
                    expect_value = true;
                } else {
                    Error(stmt, "expected ',' in .half");
                }
            }
        } else if (d == "align") {
            size_t i = idx + 1;
            int64_t n = ExpectInteger(stmt, i);
            ExpectEnd(stmt, i);
            Word mask = (Word(1) << n) - 1;
            Word aligned = (pc + mask) & ~mask;
            while (pc < aligned) {
                EmitByte(0, words, pc);
            }
        } else if (d == "equ") {
            // symbol already defined in FirstPass
        } else {
            Error(stmt, "unknown directive '" + t.lexeme() + "'");
        }
    }
    FlushBytes(words, pc);
}

bool Parser::IsPseudoInstruction(const std::string& mnem) const {
    return mnem == "la" || mnem == "li" || mnem == "j" ||
           mnem == "mv" || mnem == "call" || mnem == "nop" ||
           mnem == "ble" || mnem == "bgt" || mnem == "bleu" || mnem == "bgtu";
}

size_t Parser::PseudoExpansionWords(const Statement& s, size_t idx) const {
    const std::string& mnem = s.tokens[idx].lexeme();

    if (mnem == "la" || mnem == "call") return 2;
    if (mnem == "j" || mnem == "mv" || mnem == "nop") return 1;

    if (mnem == "li") {
        if (idx + 3 < s.tokens.size()) {
            const Token& t = s.tokens[idx + 3];
            if (t.type() == TokenType::kInteger) {
                int64_t val = std::get<int64_t>(t.literal());
                if (val >= -2048 && val <= 2047) return 1;
            }
        }
        return 2;
    }

    return 1;
}

void Parser::EncodePseudo(const Statement& s, size_t idx, Word pc,
                          std::vector<Word>& words) {
    const std::string& mnem = s.tokens[idx].lexeme();
    size_t i = idx + 1;
    int rd = 0, rs1 = 0;
    int64_t imm = 0;

    if (mnem == "la") {
        ExpectReg(s, i, rd);
        ExpectComma(s, i);
        int64_t target = ParseImm(s, i, pc);
        ExpectEnd(s, i);

        int64_t offset = target - static_cast<int64_t>(pc);
        int64_t lo = offset & 0xFFF;
        int64_t hi = ((offset + 0x800) >> 12) & 0xFFFFF;

        words.push_back(Encode(*Lookup("auipc"), rd, 0, 0, hi, 0));
        words.push_back(Encode(*Lookup("addi"), rd, rd, 0, lo, 0));
        return;
    }

    if (mnem == "li") {
        ExpectReg(s, i, rd);
        ExpectComma(s, i);
        imm = ParseImm(s, i, pc);
        ExpectEnd(s, i);

        if (imm >= -2048 && imm <= 2047) {
            words.push_back(Encode(*Lookup("addi"), rd, 0, 0, imm, 0));
        } else {
            int64_t lo = imm & 0xFFF;
            int64_t hi = ((imm + 0x800) >> 12) & 0xFFFFF;
            words.push_back(Encode(*Lookup("lui"), rd, 0, 0, hi, 0));
            words.push_back(Encode(*Lookup("addi"), rd, rd, 0, lo, 0));
        }
        return;
    }

    if (mnem == "j") {
        int64_t target = ParseImm(s, i, pc);
        ExpectEnd(s, i);

        int64_t offset = target - static_cast<int64_t>(pc);
        if (offset & 1) Error(s, "branch/jump target is not word-aligned");

        words.push_back(Encode(*Lookup("jal"), 0, 0, 0, 0, offset));
        return;
    }

    if (mnem == "mv") {
        ExpectReg(s, i, rd);
        ExpectComma(s, i);
        ExpectReg(s, i, rs1);
        ExpectEnd(s, i);

        words.push_back(Encode(*Lookup("addi"), rd, rs1, 0, 0, 0));
        return;
    }

    if (mnem == "call") {
        int64_t target = ParseImm(s, i, pc);
        ExpectEnd(s, i);

        int64_t offset = target - static_cast<int64_t>(pc);
        int64_t lo = offset & 0xFFF;
        int64_t hi = ((offset + 0x800) >> 12) & 0xFFFFF;

        rd = 1;  // x1 = ra
        words.push_back(Encode(*Lookup("auipc"), rd, 0, 0, hi, 0));
        words.push_back(Encode(*Lookup("jalr"), rd, rd, 0, lo, 0));
        return;
    }

    if (mnem == "nop") {
        ExpectEnd(s, i);
        words.push_back(Encode(*Lookup("addi"), 0, 0, 0, 0, 0));
        return;
    }

    // Branch pseudo-instructions: swap operands and use the real branch
    int rs2 = 0;
    int64_t off = 0;
    const Entry* e = nullptr;

    if (mnem == "ble") {
        ExpectReg(s, i, rs1);
        ExpectComma(s, i);
        ExpectReg(s, i, rs2);
        ExpectComma(s, i);
        ParseBranchTarget(s, i, pc, off);
        ExpectEnd(s, i);
        e = Lookup("bge");
        // ble rs1, rs2, label  =>  bge rs2, rs1, label
        words.push_back(Encode(*e, 0, rs2, rs1, 0, off));
        return;
    }
    if (mnem == "bgt") {
        ExpectReg(s, i, rs1);
        ExpectComma(s, i);
        ExpectReg(s, i, rs2);
        ExpectComma(s, i);
        ParseBranchTarget(s, i, pc, off);
        ExpectEnd(s, i);
        e = Lookup("blt");
        // bgt rs1, rs2, label  =>  blt rs2, rs1, label
        words.push_back(Encode(*e, 0, rs2, rs1, 0, off));
        return;
    }
    if (mnem == "bleu") {
        ExpectReg(s, i, rs1);
        ExpectComma(s, i);
        ExpectReg(s, i, rs2);
        ExpectComma(s, i);
        ParseBranchTarget(s, i, pc, off);
        ExpectEnd(s, i);
        e = Lookup("bgeu");
        // bleu rs1, rs2, label  =>  bgeu rs2, rs1, label
        words.push_back(Encode(*e, 0, rs2, rs1, 0, off));
        return;
    }
    if (mnem == "bgtu") {
        ExpectReg(s, i, rs1);
        ExpectComma(s, i);
        ExpectReg(s, i, rs2);
        ExpectComma(s, i);
        ParseBranchTarget(s, i, pc, off);
        ExpectEnd(s, i);
        e = Lookup("bltu");
        // bgtu rs1, rs2, label  =>  bltu rs2, rs1, label
        words.push_back(Encode(*e, 0, rs2, rs1, 0, off));
        return;
    }

    Error(s, "unknown pseudo-instruction '" + mnem + "'");
}

void Parser::EmitByte(Byte b, std::vector<Word>& words, Word& pc) {
    byte_buffer_.push_back(b);
    pc += 1;
    if (byte_buffer_.size() == 4) {
        Word w = static_cast<Word>(byte_buffer_[0])
               | (static_cast<Word>(byte_buffer_[1]) << 8)
               | (static_cast<Word>(byte_buffer_[2]) << 16)
               | (static_cast<Word>(byte_buffer_[3]) << 24);
        words.push_back(w);
        byte_buffer_.clear();
    }
}

void Parser::FlushBytes(std::vector<Word>& words, Word& pc) {
    if (byte_buffer_.empty()) return;
    Word padding = 4 - byte_buffer_.size();
    while (byte_buffer_.size() < 4) byte_buffer_.push_back(0);
    Word w = static_cast<Word>(byte_buffer_[0])
           | (static_cast<Word>(byte_buffer_[1]) << 8)
           | (static_cast<Word>(byte_buffer_[2]) << 16)
           | (static_cast<Word>(byte_buffer_[3]) << 24);
    words.push_back(w);
    pc += padding;
    byte_buffer_.clear();
}

const Parser::Entry* Parser::Lookup(const std::string& mnemonic) {
    auto it = kEntries.find(mnemonic);
    return it == kEntries.end() ? nullptr : &it->second;
}

bool Parser::ParseReg(const Token& token, int& reg) const {
    if (token.type() != TokenType::kRegister) return false;
    const std::string& name = token.lexeme();
    if (name.size() >= 2 && name[0] == 'x' &&
        std::all_of(name.begin() + 1, name.end(),
                    [](char c) { return c >= '0' && c <= '9'; })) {
        int n = std::stoi(name.substr(1));
        if (n > 31) return false;
        reg = n;
        return true;
    }
    auto it = kAbiRegisters.find(name);
    if (it == kAbiRegisters.end()) return false;
    reg = it->second;
    return true;
}

void Parser::ExpectReg(const Statement& s, size_t& i, int& reg) const {
    if (i >= s.tokens.size() || !ParseReg(s.tokens[i], reg)) {
        Error(s, "expected register");
    }
    ++i;
}

void Parser::ExpectComma(const Statement& s, size_t& i) const {
    if (i < s.tokens.size() && s.tokens[i].type() == TokenType::kComma) {
        ++i;
        return;
    }
    Error(s, "expected ','");
}

int64_t Parser::ExpectInteger(const Statement& s, size_t& i) const {
    if (i >= s.tokens.size() ||
        s.tokens[i].type() != TokenType::kInteger) {
        Error(s, "expected integer");
    }
    return std::get<int64_t>(s.tokens[i++].literal());
}

void Parser::ExpectEnd(const Statement& s, size_t i) const {
    if (i == s.tokens.size()) return;
    Error(s, "unexpected trailing token '" + s.tokens[i].lexeme() + "'");
}

TokenType Parser::Peek(const Statement& s, size_t i) const {
    if (i >= s.tokens.size()) return TokenType::kEndOfFile;
    return s.tokens[i].type();
}

int64_t Parser::Resolve(const Statement& s, const Token& t) const {
    auto it = symbols_.find(t.lexeme());
    if (it == symbols_.end()) {
        Error(s, "undefined symbol '" + t.lexeme() + "'");
    }
    return static_cast<int64_t>(it->second);
}

int64_t Parser::ParseImm(const Statement& s, size_t& i, Word pc) const {
    (void)pc;

    if (i >= s.tokens.size()) {
        Error(s, "expected immediate");
    }
    const Token& t = s.tokens[i];
    if (t.type() == TokenType::kInteger) {
        ++i;
        return std::get<int64_t>(t.literal());
    }
    if (t.type() == TokenType::kIdentifier) {
        ++i;
        return Resolve(s, t);
    }
    Error(s, "expected immediate (integer or label)");
    return 0;  // unreachable
}

bool Parser::IsMemForm(const Statement& s, size_t i) const {
    if (Peek(s, i) == TokenType::kLeftParen) return true;
    TokenType t = Peek(s, i);
    return (t == TokenType::kInteger || t == TokenType::kIdentifier) &&
           Peek(s, i + 1) == TokenType::kLeftParen;
}

void Parser::ParseMemOffset(const Statement& s, size_t& i,
                            int64_t& imm, int& rs1) const {
    imm = 0;
    if (i < s.tokens.size()) {
        const Token& t = s.tokens[i];
        if (t.type() == TokenType::kInteger) {
            imm = std::get<int64_t>(t.literal());
            ++i;
        } else if (t.type() == TokenType::kIdentifier) {
            imm = Resolve(s, t);
            ++i;
        }
    }
    if (i >= s.tokens.size() ||
        s.tokens[i].type() != TokenType::kLeftParen) {
        Error(s, "expected '(' in memory operand");
    }
    ++i;
    ExpectReg(s, i, rs1);
    if (i >= s.tokens.size() ||
        s.tokens[i].type() != TokenType::kRightParen) {
        Error(s, "expected ')' in memory operand");
    }
    ++i;
}

void Parser::ParseBranchTarget(const Statement& s, size_t& i,
                               Word pc, int64_t& offset) const {
    int64_t target = 0;
    if (i >= s.tokens.size()) {
        Error(s, "expected branch target");
    }
    const Token& t = s.tokens[i];
    if (t.type() == TokenType::kIdentifier) {
        target = Resolve(s, t);
        ++i;
    } else if (t.type() == TokenType::kInteger) {
        target = std::get<int64_t>(t.literal());
        ++i;
    } else {
        Error(s, "expected branch target (label or address)");
    }
    offset = target - static_cast<int64_t>(pc);
    if (offset & 1) {
        Error(s, "branch/jump target is not word-aligned");
    }
}

void Parser::EncodeInstruction(const Statement& s, size_t idx, Word pc,
                               Word& word) {
    const Entry* e = Lookup(s.tokens[idx].lexeme());
    if (e == nullptr) {
        Error(s, "unknown instruction '" + s.tokens[idx].lexeme() + "'");
    }

    size_t i = idx + 1;
    int rd = 0, rs1 = 0, rs2 = 0;
    int64_t imm = 0, off = 0;

    switch (e->format) {
        case Format::kR:
            ExpectReg(s, i, rd);
            ExpectComma(s, i);
            ExpectReg(s, i, rs1);
            ExpectComma(s, i);
            ExpectReg(s, i, rs2);
            ExpectEnd(s, i);
            break;

        case Format::kI:
            ExpectReg(s, i, rd);
            ExpectComma(s, i);
            ExpectReg(s, i, rs1);
            ExpectComma(s, i);
            imm = ParseImm(s, i, pc);
            ExpectEnd(s, i);
            if (imm < -2048 || imm > 2047) {
                Error(s, "immediate out of range for 12-bit field");
            }
            break;

        case Format::kShift:
            ExpectReg(s, i, rd);
            ExpectComma(s, i);
            ExpectReg(s, i, rs1);
            ExpectComma(s, i);
            imm = ExpectInteger(s, i);
            ExpectEnd(s, i);
            if (imm < 0 || imm > 31) {
                Error(s, "shift amount must be in [0,31]");
            }
            break;

        case Format::kLoad:
            ExpectReg(s, i, rd);
            ExpectComma(s, i);
            ParseMemOffset(s, i, imm, rs1);
            ExpectEnd(s, i);
            break;

        case Format::kStore:
            ExpectReg(s, i, rs2);
            ExpectComma(s, i);
            ParseMemOffset(s, i, imm, rs1);
            ExpectEnd(s, i);
            break;

        case Format::kB:
            ExpectReg(s, i, rs1);
            ExpectComma(s, i);
            ExpectReg(s, i, rs2);
            ExpectComma(s, i);
            ParseBranchTarget(s, i, pc, off);
            ExpectEnd(s, i);
            if (off < -8192 || off > 8190) {
                Error(s, "branch target out of range");
            }
            break;

        case Format::kU:
            ExpectReg(s, i, rd);
            ExpectComma(s, i);
            imm = ParseImm(s, i, pc);
            ExpectEnd(s, i);
            break;

        case Format::kJ:
            if (Peek(s, i) == TokenType::kRegister) {
                ExpectReg(s, i, rd);
                ExpectComma(s, i);
            } else {
                rd = 1;  // rd defaults to ra
            }
            ParseBranchTarget(s, i, pc, off);
            ExpectEnd(s, i);
            if (off < -1048576 || off > 1048574) {
                Error(s, "jal target out of range");
            }
            break;

        case Format::kJalr:
            if (Peek(s, i) == TokenType::kRegister &&
                Peek(s, i + 1) == TokenType::kEndOfFile) {
                // "jalr rs1"  =>  jalr ra, 0(rs1)
                ExpectReg(s, i, rs1);
                rd = 1;
            } else if (Peek(s, i) == TokenType::kRegister) {
                ExpectReg(s, i, rd);
                ExpectComma(s, i);
                if (IsMemForm(s, i)) {
                    ParseMemOffset(s, i, imm, rs1);
                } else if (Peek(s, i) == TokenType::kRegister) {
                    ExpectReg(s, i, rs1);
                    if (Peek(s, i) == TokenType::kComma) {
                        ++i;
                        imm = ParseImm(s, i, pc);
                    }
                } else {
                    Error(s, "expected jalr operand");
                }
            } else if (IsMemForm(s, i)) {
                rd = 1;
                ParseMemOffset(s, i, imm, rs1);
            } else {
                Error(s, "expected jalr operand");
            }
            ExpectEnd(s, i);
            if (imm < -2048 || imm > 2047) {
                Error(s, "immediate out of range for 12-bit field");
            }
            break;

        case Format::kNone:
            ExpectEnd(s, i);
            imm = e->fixed_imm;
            break;
    }

    word = Encode(*e, rd, rs1, rs2, imm, off);
}

Word Parser::FieldImmS(int64_t imm) const {
    Word i = static_cast<Word>(imm) & 0xFFF;
    return ((i & 0x1F) << 7) | (((i >> 5) & 0x7F) << 25);
}

Word Parser::FieldImmB(int64_t offset) const {
    int32_t s = static_cast<int32_t>(offset);
    return ((static_cast<Word>(s >> 11) & 0x1) << 7)   // imm[11]
         | ((static_cast<Word>(s >> 1) & 0xF) << 8)    // imm[4:1]
         | ((static_cast<Word>(s >> 5) & 0x3F) << 25)  // imm[10:5]
         | ((static_cast<Word>(s >> 12) & 0x1) << 31); // imm[12]
}

Word Parser::FieldImmJ(int64_t offset) const {
    int32_t s = static_cast<int32_t>(offset);
    return ((static_cast<Word>(s >> 12) & 0xFF) << 12)   // imm[19:12]
         | ((static_cast<Word>(s >> 11) & 0x1) << 20)    // imm[11]
         | ((static_cast<Word>(s >> 1) & 0x3FF) << 21)   // imm[10:1]
         | ((static_cast<Word>(s >> 20) & 0x1) << 31);   // imm[20]
}

Word Parser::Encode(const Entry& e, int rd, int rs1, int rs2,
                    int64_t imm, int64_t offset) const {
    switch (e.format) {
        case Format::kR:
            return e.opcode | FieldRd(rd) | FieldFunct3(e.funct3)
                 | FieldRs1(rs1) | FieldRs2(rs2) | FieldFunct7(e.funct7);

        case Format::kI:
        case Format::kNone:
            return e.opcode | FieldRd(rd) | FieldFunct3(e.funct3)
                 | FieldRs1(rs1) | FieldImm12(imm);

        case Format::kShift:
            return e.opcode | FieldRd(rd) | FieldFunct3(e.funct3)
                 | FieldRs1(rs1)
                 | FieldImm12(static_cast<int64_t>(e.funct7 << 5)
                              | (imm & 0x1F));

        case Format::kStore:
            return e.opcode | FieldImmS(imm) | FieldFunct3(e.funct3)
                 | FieldRs1(rs1) | FieldRs2(rs2);

        case Format::kB:
            return e.opcode | FieldImmB(offset) | FieldFunct3(e.funct3)
                 | FieldRs1(rs1) | FieldRs2(rs2);

        case Format::kU:
            return e.opcode | FieldRd(rd) | FieldImm20(imm);

        case Format::kJ:
            return e.opcode | FieldRd(rd) | FieldImmJ(offset);

        case Format::kLoad:
        case Format::kJalr:
            return e.opcode | FieldRd(rd) | FieldFunct3(e.funct3)
                 | FieldRs1(rs1) | FieldImm12(imm);
    }
    return e.opcode;  // unreachable
}

void Parser::Error(const Statement& s, const std::string& msg) const {
    throw std::runtime_error("parser error (line " +
                             std::to_string(s.line) + "): " + msg);
}

}  // namespace riscv
