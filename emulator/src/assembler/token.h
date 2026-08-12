#ifndef RISCV_TOKEN_H_
#define RISCV_TOKEN_H_

#include <string>
#include <utility>
#include <variant>

#include "token_type.h"
#include "value.h"

namespace riscv {

class Token {
public:
    Token(TokenType type, std::string lexeme, LiteralValue literal, int line)
        : type_(type),
          lexeme_(std::move(lexeme)),
          literal_(std::move(literal)),
          line_(line) {}

    TokenType type() const { return type_; }
    const std::string& lexeme() const { return lexeme_; }
    const LiteralValue& literal() const { return literal_; }
    int line() const { return line_; }

    std::string ToDisplayString() const;

private:
    TokenType type_;
    std::string lexeme_;
    LiteralValue literal_;
    int line_;
};

}  // namespace riscv

#endif  // RISCV_TOKEN_H_