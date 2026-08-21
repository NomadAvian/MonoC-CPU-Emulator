#ifndef ALU_ALU_H_
#define ALU_ALU_H_

#include <cstdint>

namespace cpu {

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
    uint32_t result = 0;
    bool is_neg     = false;
    bool is_zero    = false;
    bool carry      = false;
};

// the ALU does not need to be a class as it does not have a state
// but it is kept as one to conceptually represent it as a
// component of the cpu
class Alu {
public:
    Alu() = default;

    [[nodiscard]] AluOutput Execute(uint32_t rs1, uint32_t rs2, AluOp op) const;

private:
    [[nodiscard]] static AluOutput FixOutput(uint32_t result, bool carry = false);
};

}  // namespace cpu

#endif  // ALU_ALU_H_
