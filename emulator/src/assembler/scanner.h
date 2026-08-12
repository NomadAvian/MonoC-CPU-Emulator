#ifndef RISCV_SCANNER_H_
#define RISCV_SCANNER_H_

#include <cstddef>
#include <string>
#include <unordered_set>
#include <utility>
#include <vector>

#include "error.h"
#include "token.h"
#include "token_type.h"

namespace riscv {

class Scanner {
public:
    explicit Scanner(std::string source)
        : source_(std::move(source)) {}

    std::vector<Token> ScanTokens();

private:
    bool IsAtEnd() const;
    void ScanToken();
    char Advance();
    void AddToken(TokenType type);
    void AddToken(TokenType type, LiteralValue literal);

    bool Match(char expected);
    char Peek() const;
    char PeekNext() const;

    void ScanString();
    void ScanNumber();
    void ScanIdentifierOrKeyword();
    void ScanDirective();
    void ScanBlockComment();

    static bool IsDigit(char c) {
        return c >= '0' && c <= '9';
    }

    static bool IsHexDigit(char c) {
        return IsDigit(c) || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F');
    }

    static bool IsAlpha(char c) {
        return (c >= 'A' && c <= 'Z') ||
               (c >= 'a' && c <= 'z') ||
               (c == '_') || (c == '$');
    }

    static bool IsAlphanumeric(char c) {
        return IsAlpha(c) || IsDigit(c);
    }

    static const std::unordered_set<std::string> kInstructions;
    static const std::unordered_set<std::string> kRegisters;

    std::string source_;
    std::vector<Token> tokens_;

    size_t start_ = 0;
    size_t current_ = 0;
    int line_ = 1;
};

}  // namespace riscv

#endif  // RISCV_SCANNER_H_