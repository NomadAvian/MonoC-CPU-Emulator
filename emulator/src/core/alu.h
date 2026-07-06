#ifndef ALU_ALU_H_
#define ALU_ALU_H_

#include <cstdint>

namespace alu {

enum class AluOp {

    // Arithmetic
    kAdd,
    kSub,
    kAnd,
    kOr,
    kXor,

    // Shift
    kSll,
    kSrl,
    kSra,

    // Logical Compare
    kSlt,
    kSltu,

    // Multiplication
    kMul,
    kMulh,
    kMulhu,
    kMulhsu,

    // Division and Remainder
    kDiv,
    kDivu,
    kRem,
    kRemu,
};

struct AluOutput {
    uint32_t result;
    bool is_neg;
    bool is_zero;
    bool carry;
};

class Alu {
public:
    Alu() = default;

    [[nodiscard]] AluOutput Execute(uint32_t rs1, uint32_t rs2, AluOp op) const;

private:
    [[nodiscard]] static AluOutput FixOutput(uint32_t result, bool carry = false);
};

}  // namespace alu

#endif  // ALU_ALU_H_
