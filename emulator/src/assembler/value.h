#ifndef RISCV_VALUE_H_
#define RISCV_VALUE_H_

#include <cstdint>
#include <string>
#include <variant>

namespace riscv {

// Represents the literal value attached to tokens such as INTEGER or STRING.
// std::monostate is used for tokens that carry no literal payload.
using LiteralValue = std::variant<std::monostate, int64_t, std::string>;

}  // namespace riscv

#endif  // RISCV_VALUE_H_