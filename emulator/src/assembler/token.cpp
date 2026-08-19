#include "token.h"

#include <string>

#include "token_type.h"

namespace riscv {

std::string Token::ToDisplayString() const {
    return std::string(TokenTypeToString(type_)) + "  " + lexeme_;
}

}  // namespace riscv