#include "token_type.h"

namespace riscv {

const char* TokenTypeToString(TokenType type) {
    switch (type) {
        case TokenType::kLeftParen:   return "LEFT_PAREN";
        case TokenType::kRightParen:  return "RIGHT_PAREN";
        case TokenType::kComma:       return "COMMA";
        case TokenType::kColon:       return "COLON";
        case TokenType::kPlus:        return "PLUS";
        case TokenType::kMinus:       return "MINUS";
        case TokenType::kDot:         return "DOT";

        case TokenType::kInstruction: return "INSTRUCTION";
        case TokenType::kRegister:    return "REGISTER";
        case TokenType::kDirective:   return "DIRECTIVE";
        case TokenType::kLabelDef:    return "LABEL_DEF";
        case TokenType::kIdentifier:  return "IDENTIFIER";

        case TokenType::kInteger:     return "INTEGER";
        case TokenType::kString:      return "STRING";

        case TokenType::kEndOfFile:   return "END_OF_FILE";
    }
    return "UNKNOWN_TOKEN_TYPE";
}

}  // namespace riscv