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


enum class ecall : Word {
    kPrintint    = 1,
    kPrintstring = 4,
    kPrintchar   = 11,
    kReadint     = 5,
    kReadstring  = 8,
    kReadchar    = 12,
    kExit        = 10,
    kExit2       = 93
};

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
        Reset();
        LoadROM(filename);
    }

    void LoadROM(const std::string& filename);	

    Word ReadReg (size_t index) const;
    Word pc() const;
    void SetPC(Word value) { pc_.value = value; }
    void IncrementPC() { pc_.value += 4; }

    Word ReadMemoryWord(Word address) const;
    Half ReadMemoryHalf(Word address) const;
    Byte ReadMemoryByte(Word address) const;

    // accessors for frontend

    void Reset();
    void Step();

    bool IsHalted() const { return halted_; }

    // program I/O: print syscalls append to output_, read syscalls consume input_
    // const std::string& Output() const { return output_; }
    // void ClearOutput() { output_.clear(); }
    // void WriteInput(const std::string& data) { input_ += data; }
    // void ClearInput() { input_.clear(); input_pos_ = 0; }

private:
    Reg         x[32];
    Reg         pc_;
    Memory      ram_;
    Memory      rom_;
    alu::Alu    alu_;
    bool        halted_;
    // std::string output_;
    // std::string input_;
    // size_t      input_pos_ = 0;

    int32_t SignExtend(uint32_t value, uint32_t bits) const;
    void MirrorRomToRam();

    // fixed bit-field extractors
    Word ExtractOpcode(Word instruction);
    Word ExtractRd    (Word instruction);
    Word ExtractFunct3(Word instruction);
    Word ExtractFunct7(Word instruction);
    Word ExtractRs1   (Word instruction);
    Word ExtractRs2   (Word instruction);
    alu::AluOp MapToAluOp(isa::Opcode opcode) const;
    alu::AluOutput EffectiveAddress(Word base, int32_t offset) const;

    void WriteReg(size_t index, Word value);

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

    // returns whether pc_ has been updated
    bool Execute     (DecodedInstruction instr);

    bool ExecuteRType(DecodedInstruction instr);
    bool ExecuteIType(DecodedInstruction instr);
    bool ExecuteSType(DecodedInstruction instr);
    bool ExecuteUType(DecodedInstruction instr);
    bool ExecuteJType(DecodedInstruction instr);
    bool ExecuteBType(DecodedInstruction instr);

    void Ecall();
};

} // namespace cpu

#endif // CPU_CPU_H_
