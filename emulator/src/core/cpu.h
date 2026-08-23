#ifndef CPU_CPU_H_
#define CPU_CPU_H_

#include <string>
#include <vector>

#include "../common.h"
#include "alu.h"
#include "io.h"
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


enum class CpuState {
    kRunning,
    kWaiting,
    kHalted,
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
    CPU(std::string filename = "") : ram_() {
        Reset();
        LoadExecutable(filename);
    }

    void LoadExecutable(const std::string& filename);	

    Word ReadReg (size_t index) const;
    Word pc() const;
    void SetPC(Word value) { pc_.value = value; }
    void IncrementPC() { pc_.value += 4; }

    Word ReadMemoryWord(Word address) const;
    Half ReadMemoryHalf(Word address) const;
    Byte ReadMemoryByte(Word address) const;

    void WriteMemoryByte(Word address, Byte value);

    // accessors for frontend

    void Reset();
    void Step();
    std::vector<Byte> ReadFramebuffer();

    void SetIo(Io* io) { io_ = io; }

    CpuState state() const { return state_; }
    bool IsWaiting() const { return state_ == CpuState::kWaiting; }
    bool IsHalted()  const { return state_ == CpuState::kHalted; }

private:
    Reg         x[32];
    Reg         pc_;
    Memory      ram_;
    Alu         alu_;
    CpuState    state_ = CpuState::kRunning;
    Io*         io_;

    // the only writer of state_; ecalls and internal ops transition here
    void SetCpuState(CpuState s) { state_ = s; }

    int32_t SignExtend(uint32_t value, uint32_t bits) const;

    // fixed bit-field extractors
    Word ExtractOpcode(Word instruction);
    Word ExtractRd    (Word instruction);
    Word ExtractFunct3(Word instruction);
    Word ExtractFunct7(Word instruction);
    Word ExtractRs1   (Word instruction);
    Word ExtractRs2   (Word instruction);
    AluOp MapToAluOp(isa::Opcode opcode) const;
    AluOutput EffectiveAddress(Word base, int32_t offset) const;

    void WriteReg(size_t index, Word value);

    Word Fetch() {
        return ram_.ReadWord(pc_.value);
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
