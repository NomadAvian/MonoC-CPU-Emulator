#ifndef CPU_H_INCLUDE
#define CPU_H_INCLUDE

#include "../common.h"
#include "memory.h"

namespace isa {

enum class Opcode {
	// register immediate
	ADDI, SLTI, SLTIU, ANDI,
	ORI, XORI, SLLI, SRLI,
	SRAI, LUI, AUIPC,

	// register to register
	ADD, SUB, SLT, SLTU, AND,
	OR, XOR, SLL, SRL, SRA,

	// control transfer
	JAL, JALR, BEQ, BNE,
	BLT, BGE, BLTU, BGEU,

	// load/store
	LB, LH, LW, LBU, LHU,
	SB, SH, SW,

	// env
	FENCE, ECALL, EBREAK,

	// M extension
	MUL, MULH, MULHSU, MULHU,
	DIV, DIVU, REM, REMU,

	UNKNOWN,
};

} // Opcode

struct Reg {
    Word value;
};

class CPU {
public:
    CPU() : ram(), rom() {
        // initialize registers
        for (int i = 0; i < 32; i++) {
            x[i].value = 0;
        }
        // initialize program counter
        pc.value = 0;
    }

	Word fetch();

private:
    Reg        x[32];
    Reg        pc;
    Memory     ram;
    Memory     rom;
};

#endif // !CPU_H_INCLUDE
