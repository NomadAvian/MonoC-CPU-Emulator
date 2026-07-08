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

class CPU {
public:
    CPU() : ram_(), rom_() {
        // initialize registers
        for (int i = 0; i < 32; i++) {
            x[i].value = 0;
        }
        // initialize program counter
        pc_.value = 0;
    }

    void LoadROM(std::string filename);

	Word Fetch() const;

    void Decode     (Word instruction);
    void DecodeRType(Word instruction);
    void DecodeIType(Word instruction);
    void DecodeSType(Word instruction);
    void DecodeUType(Word instruction);

    void ExecuteRType();
    void ExecuteIType();
    void ExecuteSType();
    void ExecuteUType();

    void WriteReg(size_t index, Word value);
    Word ReadReg (size_t index) const;

private:
    Reg        x[32];
    Reg        pc_;
    Memory     ram_;
    Memory     rom_;
    alu::Alu   alu_;
};

} // namespace cpu

#endif // CPU_CPU_H_
