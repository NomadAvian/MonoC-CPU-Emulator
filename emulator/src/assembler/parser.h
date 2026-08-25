#ifndef RISCV_PARSER_H_
#define RISCV_PARSER_H_

#include <cstdint>
#include <string>
#include <unordered_map>
#include <vector>

#include "../common.h"
#include "scanner.h"
#include "token.h"
#include "token_type.h"

namespace riscv {

// Two-pass parser for RV32I/RV32M assembly.
// Pass 1 collects label -> address into symbols_,
// pass 2 emits one 32-bit word per instruction / .word value.
class Parser {
public:
    // Assembles `source` into a flat list of words
    // Throws std::runtime_error on any scanner/parser error.
    void Assemble(const std::string& source, std::vector<Word>& words);

    // Number of raw bytes emitted by data directives (.word/.byte/.half/strings),
    // excluding any padding added to align the following code. These bytes occupy
    // the start of the word stream in order; instruction words follow.
    size_t data_bytes() const { return data_bytes_; }

private:
    enum class Format {
        kR, kI, kShift, kB, kU, kJ, kLoad, kStore, kJalr, kNone
    };

    struct Entry {
        Format   format;
        uint32_t opcode;
        uint32_t funct3;
        uint32_t funct7;
        int64_t  fixed_imm;
    };

    struct Statement {
        int line = 0;
        std::vector<Token> tokens;
    };

    void SplitStatements();
    void FirstPass();
    void SecondPass(std::vector<Word>& words);

    void EncodeInstruction(const Statement& stmt, size_t idx, Word pc, Word& word);
    Word Encode(const Entry& e, int rd, int rs1, int rs2,
                int64_t imm, int64_t offset) const;

    // Field helpers
    static Word FieldRd(int rd)           { return (static_cast<Word>(rd) & 0x1F) << 7; }
    static Word FieldRs1(int rs1)         { return (static_cast<Word>(rs1) & 0x1F) << 15; }
    static Word FieldRs2(int rs2)         { return (static_cast<Word>(rs2) & 0x1F) << 20; }
    static Word FieldFunct3(uint32_t f3)  { return (f3 & 0x7) << 12; }
    static Word FieldFunct7(uint32_t f7)  { return (f7 & 0x7F) << 25; }
    static Word FieldImm12(int64_t imm)   { return (static_cast<Word>(imm) & 0xFFF) << 20; }
    static Word FieldImm20(int64_t imm)   { return (static_cast<Word>(imm) & 0xFFFFF) << 12; }
    Word FieldImmS(int64_t imm) const;
    Word FieldImmB(int64_t offset) const;
    Word FieldImmJ(int64_t offset) const;

    static const Entry* Lookup(const std::string& mnemonic);
    static size_t FirstNonLabel(const Statement& stmt);
    bool IsKeyword(const std::string& name) const;

    [[noreturn]] void Error(const Statement& s, const std::string& msg) const;
    void ExpectReg(const Statement& s, size_t& i, int& reg) const;
    void ExpectComma(const Statement& s, size_t& i) const;
    int64_t ExpectInteger(const Statement& s, size_t& i) const;
    void ExpectEnd(const Statement& s, size_t i) const;
    int64_t ParseImm(const Statement& s, size_t& i, Word pc) const;
    void ParseMemOffset(const Statement& s, size_t& i, int64_t& imm, int& rs1) const;
    void ParseBranchTarget(const Statement& s, size_t& i, Word pc, int64_t& offset) const;
    int64_t Resolve(const Statement& s, const Token& t) const;
    bool IsMemForm(const Statement& s, size_t i) const;
    bool ParseReg(const Token& token, int& reg) const;
    TokenType Peek(const Statement& s, size_t i) const;

    // Pseudo-instruction support
    bool IsPseudoInstruction(const std::string& mnem) const;
    size_t PseudoExpansionWords(const Statement& s, size_t idx) const;
    void EncodePseudo(const Statement& s, size_t idx, Word pc, std::vector<Word>& words);

    // Byte packing for .byte/.half/.word/strings
    void EmitByte(Byte b, std::vector<Word>& words, Word& pc);
    void FlushBytes(std::vector<Word>& words, Word& pc);
    std::vector<Byte> UnescapeString(const std::string& raw) const;

    std::vector<Token> tokens_;
    std::vector<Statement> statements_;
    std::unordered_map<std::string, Word> symbols_;

    // Byte buffer for .byte/.half/.word/strings packing
    std::vector<Byte> byte_buffer_;
    // Raw bytes emitted by data directives (excludes code-alignment padding)
    size_t data_bytes_ = 0;

    static const std::unordered_map<std::string, Entry> kEntries;
    static const std::unordered_map<std::string, int> kAbiRegisters;
    // Named constants resolvable anywhere an identifier/label is allowed.
    static const std::unordered_map<std::string, Word> kKeywords;
};

}  // namespace riscv

#endif  // RISCV_PARSER_H_
