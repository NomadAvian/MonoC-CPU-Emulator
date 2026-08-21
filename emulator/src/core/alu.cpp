#include "alu.h"

#include <cassert>
#include <climits>

namespace cpu {

AluOutput Alu::FixOutput(uint32_t result, bool carry) {
    return AluOutput{
        .result = result,
        .is_neg = ((result >> 31) & 1) != 0,
        .is_zero = (result == 0),
        .carry = carry
    };
}

AluOutput Alu::Execute(uint32_t rs1, uint32_t rs2, AluOp op) const {
    switch (op)
    {
    case AluOp::kAdd:{
        // rs1 + rs2
        uint64_t sum = static_cast<uint64_t>(rs1) + static_cast<uint64_t>(rs2);
        bool carry = (sum >> 32) & 1;
        return FixOutput(static_cast<uint32_t>(sum), carry);
    }
    case AluOp::kSub:{
        // rs1 - rs2
        uint64_t diff = static_cast<uint64_t>(rs1) - static_cast<uint64_t>(rs2);
        bool carry = rs1 < rs2;
        return FixOutput(static_cast<uint32_t>(diff), carry);
    }
    case AluOp::kAnd:{
        // Bitwise AND
        return FixOutput(rs1 & rs2);
    }
    case AluOp::kOr:{
        // Bitwise OR
        return FixOutput(rs1 | rs2);
    }
    case AluOp::kXor:{
        // Bitwise XOR
        return FixOutput(rs1 ^ rs2);
    }
    case AluOp::kSll:{
        // Left shift; only low 5 bits of rs2 count (RV32 shamt).
        uint32_t shift_amount = rs2 & 0x1F;
        return FixOutput(rs1 << shift_amount);
    }
    case AluOp::kSrl:{
        // Right shift (zero-fill); shamt from low 5 bits of rs2.
        uint32_t shift_amount = rs2 & 0x1F;
        return FixOutput(rs1 >> shift_amount);
    }
    case AluOp::kSra:{
        // Arithmetic right shift (sign-fill), via signed rs1.
        uint32_t shift_amount = rs2 & 0x1F;
        return FixOutput(static_cast<uint32_t>(static_cast<int32_t>(rs1) >> shift_amount));
    }
    case AluOp::kSlt:{
        // Signed less-than compare, result is 0 or 1.
        return FixOutput((static_cast<int32_t>(rs1) < static_cast<int32_t>(rs2)) ? 1 : 0);
    }
    case AluOp::kSltu:{
        // Unsigned less-than compare, result is 0 or 1.
        return FixOutput((rs1 < rs2) ? 1 : 0);
    }
    case AluOp::kMul:{
        // Signed x signed multiply, low 32 bits of the product.
        int64_t product = static_cast<int64_t>(static_cast<int32_t>(rs1)) * static_cast<int64_t>(static_cast<int32_t>(rs2));
        return FixOutput(static_cast<uint32_t>(product));
    }
    case AluOp::kMulh:{
        // Signed x signed multiply, high 32 bits of the product.
        int64_t product = static_cast<int64_t>(static_cast<int32_t>(rs1)) * static_cast<int64_t>(static_cast<int32_t>(rs2));
        return FixOutput(static_cast<uint32_t>(product >> 32));
    }
    case AluOp::kMulhu:{
        // Unsigned x unsigned multiply, high 32 bits of the product.
        uint64_t product = static_cast<uint64_t>(rs1) * static_cast<uint64_t>(rs2);
        return FixOutput(static_cast<uint32_t>(product >> 32));
    }
    case AluOp::kMulhsu:{
        // Signed rs1 x unsigned rs2 multiply, high 32 bits (needs 128-bit
        // intermediate to keep both sign and full unsigned range correct).
        __int128 product = static_cast<int64_t>(static_cast<int32_t>(rs1)) * static_cast<__int128>(rs2);
        return FixOutput(static_cast<uint32_t>(static_cast<uint64_t>(product >> 32)));
    }
    case AluOp::kDiv:{
        // Signed divide. RISC-V spec: div by zero -> all-ones; overflow
        // (INT_MIN / -1) -> INT_MIN, both without trapping.
        if (rs2 == 0) {
            return FixOutput(static_cast<uint32_t>(-1));
        } else if (rs1 == static_cast<uint32_t>(INT32_MIN) && rs2 == static_cast<uint32_t>(-1)) {
            return FixOutput(static_cast<uint32_t>(INT32_MIN));
        } else {
            return FixOutput(static_cast<uint32_t>(static_cast<int32_t>(rs1) / static_cast<int32_t>(rs2)));
        }
    }
    case AluOp::kDivu:{
        // Unsigned divide. Div by zero -> all-ones per spec.
        if (rs2 == 0) {
            return FixOutput(static_cast<uint32_t>(-1));
        } else {
            return FixOutput(rs1 / rs2);
        }
    }
    case AluOp::kRem:{
        // Signed remainder. Div by zero -> dividend; the INT_MIN / -1
        // overflow case -> remainder 0, both without trapping.
        if (rs2 == 0) {
            return FixOutput(rs1);
        } else if (rs1 == static_cast<uint32_t>(INT32_MIN) && rs2 == static_cast<uint32_t>(-1)) {
            return FixOutput(0);
        } else {
            return FixOutput(static_cast<uint32_t>(static_cast<int32_t>(rs1) % static_cast<int32_t>(rs2)));
        }
    }
    case AluOp::kRemu:{
        // Unsigned remainder. Div by zero -> dividend per spec.
        if (rs2 == 0) {
            return FixOutput(rs1);
        } else {
            return FixOutput(rs1 % rs2);
        }
    }
    default:
        assert(false);
        return FixOutput(0);
    }
}

}  // namespace cpu
