#include "scanner.h"

#include <charconv>
#include <cstdint>
#include <string>
#include <unordered_set>
#include <utility>
#include <variant>

#include "error.h"
#include "token.h"
#include "token_type.h"
#include "value.h"

namespace riscv {

// Set of RV32I and RV32M instruction mnemonics
const std::unordered_set<std::string> Scanner::kInstructions = {
    // RV32I Base Integer Instruction Set
    "lui", "auipc", "jal", "jalr",
    "beq", "bne", "blt", "bge", "bltu", "bgeu",
    "lb", "lh", "lw", "lbu", "lhu",
    "sb", "sh", "sw",
    "addi", "slti", "sltiu", "xori", "ori", "andi",
    "slli", "srli", "srai",
    "add", "sub", "sll", "slt", "sltu", "xor", "srl", "sra", "or", "and",
    "fence", "ecall", "ebreak",

    // RV32M Standard Extension
    "mul", "mulh", "mulhsu", "mulhu",
    "div", "divu", "rem", "remu",

    // Pseudo-instructions
    "la", "li", "j", "mv", "call", "nop",
    "ble", "bgt", "bleu", "bgtu"
};

// Set of canonical and ABI register names
const std::unordered_set<std::string> Scanner::kRegisters = {
    // Canonical names
    "x0",  "x1",  "x2",  "x3",  "x4",  "x5",  "x6",  "x7",
    "x8",  "x9",  "x10", "x11", "x12", "x13", "x14", "x15",
    "x16", "x17", "x18", "x19", "x20", "x21", "x22", "x23",
    "x24", "x25", "x26", "x27", "x28", "x29", "x30", "x31",

    // ABI symbolic names
    "zero", "ra",  "sp",  "gp",  "tp",  "t0",  "t1",  "t2",
    "s0",   "fp",  "s1",  "a0",  "a1",  "a2",  "a3",  "a4",
    "a5",   "a6",  "a7",  "s2",  "s3",  "s4",  "s5",  "s6",
    "s7",   "s8",  "s9",  "s10", "s11", "t3",  "t4",  "t5",
    "t6"
};

std::vector<Token> Scanner::ScanTokens() {
    while (!IsAtEnd()) {
        start_ = current_;
        ScanToken();
    }

    tokens_.emplace_back(TokenType::kEndOfFile, "", LiteralValue{}, line_);
    return tokens_;
}

bool Scanner::IsAtEnd() const {
    return current_ >= source_.size();
}

void Scanner::ScanToken() {
    char c = Advance();
    switch (c) {
        case '(': AddToken(TokenType::kLeftParen); break;
        case ')': AddToken(TokenType::kRightParen); break;
        case ',': AddToken(TokenType::kComma); break;
        case ':': AddToken(TokenType::kColon); break;
        case '+': AddToken(TokenType::kPlus); break;

        case '-':
            // If followed by digits, parse as a negative numeric literal
            if (IsDigit(Peek())) {
                ScanNumber();
            } else {
                AddToken(TokenType::kMinus);
            }
            break;

        case '.':
            if (IsAlpha(Peek())) {
                ScanDirective();
            } else {
                AddToken(TokenType::kDot);
            }
            break;

        case '#':
            // Standard RISC-V single-line comment
            while (Peek() != '\n' && !IsAtEnd()) {
                Advance();
            }
            break;

        case '/':
            if (Match('/')) {
                // C++ style single-line comment
                while (Peek() != '\n' && !IsAtEnd()) {
                    Advance();
                }
            } else if (Match('*')) {
                // C style multi-line comment
                ScanBlockComment();
            } else {
                throw Error();
            }
            break;

        case ' ':
        case '\r':
        case '\t':
            // Ignore whitespace
            break;

        case '\n':
            line_++;
            break;

        case '"':
            ScanString();
            break;

        default:
            if (IsDigit(c)) {
                ScanNumber();
            } else if (IsAlpha(c)) {
                ScanIdentifierOrKeyword();
            } else {
                throw Error();
            }
            break;
    }
}

char Scanner::Advance() {
    return source_[current_++];
}

void Scanner::AddToken(TokenType type) {
    AddToken(type, std::monostate{});
}

void Scanner::AddToken(TokenType type, LiteralValue literal) {
    std::string text = source_.substr(start_, current_ - start_);
    tokens_.emplace_back(type, text, std::move(literal), line_);
}

bool Scanner::Match(char expected) {
    if (IsAtEnd()) return false;
    if (source_[current_] != expected) return false;

    current_++;
    return true;
}

char Scanner::Peek() const {
    if (IsAtEnd()) return '\0';
    return source_[current_];
}

char Scanner::PeekNext() const {
    if (current_ + 1 >= source_.size()) return '\0';
    return source_[current_ + 1];
}

void Scanner::ScanString() {
    while (Peek() != '"' && !IsAtEnd()) {
        if (Peek() == '\n') line_++;
        Advance();
    }

    if (IsAtEnd()) {
        throw Error();
    }

    Advance();  // Closing quote

    std::string value = source_.substr(start_ + 1, current_ - start_ - 2);
    AddToken(TokenType::kString, value);
}

void Scanner::ScanNumber() {
    int base = 10;

    // Check for base prefixes (0x, 0b, 0o)
    if (source_[start_] == '0' && start_ + 1 < source_.size()) {
        char prefix = source_[start_ + 1];
        if (prefix == 'x' || prefix == 'X') {
            base = 16;
            Advance();  // Consume 'x'
        } else if (prefix == 'b' || prefix == 'B') {
            base = 2;
            Advance();  // Consume 'b'
        } else if (prefix == 'o' || prefix == 'O') {
            base = 8;
            Advance();  // Consume 'o'
        }
    }

    // Consume all digits matching base format
    while (!IsAtEnd()) {
        char c = Peek();
        if (base == 16 && IsHexDigit(c)) {
            Advance();
        } else if (base == 10 && IsDigit(c)) {
            Advance();
        } else if (base == 2 && (c == '0' || c == '1')) {
            Advance();
        } else if (base == 8 && (c >= '0' && c <= '7')) {
            Advance();
        } else {
            break;
        }
    }

    std::string text = source_.substr(start_, current_ - start_);
    int64_t value = 0;

    const char* parse_ptr = text.data();
    size_t parse_len = text.size();

    // Adjust pointer past prefixes for non-decimal formats
    if (base != 10) {
        if (text.rfind("-", 0) == 0) {
            parse_ptr += 3;
            parse_len -= 3;
        } else {
            parse_ptr += 2;
            parse_len -= 2;
        }
    }

    auto [ptr, ec] = std::from_chars(parse_ptr, parse_ptr + parse_len, value, base);
    if (ec != std::errc{}) {
        throw Error();
    }

    if (text.rfind("-", 0) == 0 && base != 10) {
        value = -value;
    }

    AddToken(TokenType::kInteger, value);
}

void Scanner::ScanIdentifierOrKeyword() {
    while (IsAlphanumeric(Peek())) {
        Advance();
    }

    // Check if identifier is immediately followed by ':' (Label definition)
    if (Peek() == ':') {
        Advance();  // Consume ':'
        AddToken(TokenType::kLabelDef);
        return;
    }

    std::string text = source_.substr(start_, current_ - start_);

    if (kInstructions.find(text) != kInstructions.end()) {
        AddToken(TokenType::kInstruction);
    } else if (kRegisters.find(text) != kRegisters.end()) {
        AddToken(TokenType::kRegister);
    } else {
        AddToken(TokenType::kIdentifier);
    }
}

void Scanner::ScanDirective() {
    while (IsAlphanumeric(Peek())) {
        Advance();
    }
    AddToken(TokenType::kDirective);
}

void Scanner::ScanBlockComment() {
    while (!(Peek() == '*' && PeekNext() == '/')) {
        if (IsAtEnd()) {
            throw Error();
        }
        if (Peek() == '\n') line_++;
        Advance();
    }
    Advance();  // Consume '*'
    Advance();  // Consume '/'
}

}  // namespace riscv