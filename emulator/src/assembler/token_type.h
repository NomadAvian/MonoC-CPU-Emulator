#ifndef RISCV_TOKEN_TYPE_H_
#define RISCV_TOKEN_TYPE_H_

namespace riscv {

enum class TokenType {
    // Punctuation
    kLeftParen,
    kRightParen,
    kComma,
    kColon,
    kPlus,
    kMinus,
    kDot,

    // Assembly constructs
    kInstruction,  // RV32I / RV32M instruction mnemonics
    kRegister,     // Hardware/ABI register names (x0-x31, zero, sp, etc.)
    kDirective,    // Assembler directives (.text, .word, .asciz, etc.)
    kLabelDef,     // Label definition (e.g., "main:")
    kIdentifier,   // Generic symbol or label reference (e.g., "buffer")

    // Literals
    kInteger,      // Decimal, Hex (0x), Binary (0b), Octal (0o)
    kString,       // String literal (e.g., "Hello World")

    // Special
    kEndOfFile
};

const char* TokenTypeToString(TokenType type);

}  // namespace riscv

#endif  // RISCV_TOKEN_TYPE_H_