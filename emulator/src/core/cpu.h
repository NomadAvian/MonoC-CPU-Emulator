#ifndef CPU_CPU_H_
#define CPU_CPU_H_

#include <string>

#include "../common.h"
#include "alu.h"
#include "memory.h"

namespace isa {

enum class Opcode {
	// register immediate
	kAddi, kSlti, kSltiu, kAndi,
	kOri, kXori, kSlli, kSrli,
	kSrai, kLui, kAuipc,

	// register to register
	kAdd, kSub, kSlt, kSltu, kAnd,
	kOr, kXor, kSll, kSrl, kSra,

	// control transfer
	kJal, kJalr, kBeq, kBne,
	kBlt, kBge, kBltu, kBgeu,

	// load/store
	kLb, kLh, kLw, kLbu, kLhu,
	kSb, kSh, kSw,

	// env
	kFence, kEcall, kEbreak,

	// M extension
	kMul, kMulh, kMulhsu, kMulhu,
	kDiv, kDivu, kRem, kRemu,

	kUnknown,
};

} // namespace isa

namespace cpu {

struct Reg {
    Word value;
};

struct DecodedInstruction {
    isa::Opcode opcode;
    Word rs1;
    Word rs2;
    Word rd;
    int32_t imm;
};

class CPU {
public:
    CPU(std::string filename = "") : ram_(), rom_() {
        // initialize registers
        for (int i = 0; i < 32; i++) {
            x[i].value = 0;
        }
        // initialize program counter
        pc_.value = 0;
        LoadROM(filename);
    }

    void LoadROM(const std::string& filename);

	Word Fetch() const {
        return rom_.ReadWord(pc_.value);
    }

    DecodedInstruction Decode     (Word instruction);
    DecodedInstruction DecodeRType(Word instruction);
    DecodedInstruction DecodeIType(Word instruction);
    DecodedInstruction DecodeSType(Word instruction);
    DecodedInstruction DecodeUType(Word instruction);
    DecodedInstruction DecodeJType(Word instruction);
    DecodedInstruction DecodeBType(Word instruction);

    void ExecuteRType(DecodedInstruction instr);
    void ExecuteIType(DecodedInstruction instr);
    void ExecuteSType(DecodedInstruction instr);
    void ExecuteUType(DecodedInstruction instr);
    void ExecuteJType(DecodedInstruction instr);
    void ExecuteBType(DecodedInstruction instr);

    void WriteReg(size_t index, Word value);
    Word ReadReg (size_t index) const;

private:
    Reg        x[32];
    Reg        pc_;
    Memory     ram_;
    Memory     rom_;
    alu::Alu   alu_;

    int32_t SignExtend(uint32_t value, uint32_t bits) const;

    Word ExtractRs1(Word instruction);
    Word ExtractRs2(Word instruction);

};

} // namespace cpu

#endif // CPU_CPU_H_
