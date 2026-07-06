#include "alu.h"

#include <cassert>
#include <climits>


namespace {

    alu::AluOutput FixOutput(uint32_t result, bool carry = false) {
        
        return alu::AluOutput{
            .result = result,
            .is_neg = ((result >> 31) & 1) != 0,
            .is_zero = (result == 0),
            .carry = carry
        };
    }
}  //namespace


namespace alu {

AluOutput Execute(uint32_t rs1, uint32_t rs2, AluOp op){
    switch (op)
    {
    case AluOp::kAdd:{
        uint64_t sum = static_cast<uint64_t>(rs1) + static_cast<uint64_t>(rs2);
        bool carry = (sum >>32) & 1;
        return FixOutput(static_cast<uint32_t>(sum), carry);
    }
    case AluOp::kSub:{
        uint64_t diff = static_cast<uint64_t>(rs1) - static_cast<uint64_t>(rs2);
        bool carry = rs1 < rs2;
        return FixOutput(static_cast<uint32_t>(diff), carry);
    }
    case AluOp::kAnd:{
        return FixOutput(rs1 & rs2);
    }
    case AluOp::kOr:{
        return FixOutput(rs1 | rs2);
    }
    case AluOp::kXor:{
        return FixOutput(rs1 ^ rs2);
    }
    case AluOp::kSll:{
        uint32_t shift_amount = rs2 & 0x1F;
        return FixOutput(rs1 << shift_amount);
    }
        case AluOp::kSrl:{
        uint32_t shift_amount = rs2 & 0x1F;
        return FixOutput(rs1 >> shift_amount);
    }
    case AluOp::kSra:{
        uint32_t shift_amount = rs2 & 0x1F;
        return FixOutput(static_cast<uint32_t>(static_cast<int32_t>(rs1) >> shift_amount));
    }
    case AluOp::kSlt:{
        return FixOutput((static_cast<int32_t>(rs1) < static_cast<int32_t>(rs2)) ? 1 : 0);
    }
    case AluOp::kSltu:{
        return FixOutput((rs1 < rs2) ? 1 : 0);
    }
    case AluOp::kMul:{
        int64_t product = static_cast<int64_t>(static_cast<int32_t>(rs1)) * static_cast<int64_t>(static_cast<int32_t>(rs2));
        return FixOutput(static_cast<uint32_t>(product));
    }
    case AluOp::kMulh:{
        int64_t product = static_cast<int64_t>(static_cast<int32_t>(rs1)) * static_cast<int64_t>(static_cast<int32_t>(rs2));
        return FixOutput(static_cast<uint32_t>(product >> 32));
    }
        case AluOp::kMulhu:{
        uint64_t product = static_cast<uint64_t>(rs1) * static_cast<uint64_t>(rs2);
        return FixOutput(static_cast<uint32_t>(product >> 32));
    }
    case AluOp::kMulhsu:{
        __int128 product = static_cast<int64_t>(static_cast<int32_t>(rs1)) * static_cast<__int128>(rs2);
        return FixOutput(static_cast<uint32_t>(static_cast<uint64_t>(product >> 32)));
    }
    case AluOp::kDiv:{
        if (rs2 == 0) {
            return FixOutput(static_cast<uint32_t>(-1));
        } else if (rs1 == static_cast<uint32_t>(INT32_MIN) && rs2 == static_cast<uint32_t>(-1)) {
            return FixOutput(static_cast<uint32_t>(INT32_MIN));
        } else {
            return FixOutput(static_cast<uint32_t>(static_cast<int32_t>(rs1) / static_cast<int32_t>(rs2)));
        }
    }
    case AluOp::kDivu:{
        if (rs2 == 0) {
            return FixOutput(static_cast<uint32_t>(-1));
        } else {
            return FixOutput(rs1 / rs2);
        }
    }
    case AluOp::kRem:{
        if (rs2 == 0) {
            return FixOutput(rs1);
        } else if (rs1 == static_cast<uint32_t>(INT32_MIN) &&   rs2 == static_cast<uint32_t>(-1)) {
            return FixOutput(0);
        } else {
            return FixOutput(static_cast<uint32_t>(static_cast<int32_t>(rs1) % static_cast<int32_t>(rs2)));
        }    
    }
    case AluOp::kRemu:{
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

} // namespace alu







