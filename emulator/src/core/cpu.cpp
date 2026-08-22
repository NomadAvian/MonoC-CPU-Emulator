// TODO: linear memory mapping for all memory types
#include "cpu.h"

#include <cassert>
#include <fstream>
#include <stdexcept>

#include "framebuffer.h"

namespace cpu {

void CPU::LoadExecutable(const std::string& filename) {
    if (filename.empty()) return;
    // TODO: more elegant solution to relative filepaths ?
    // resolve a bare filename
    static const char* kCandidates[] = {
        "emulator/roms/",
        "../emulator/roms/",
        "roms/",
        "",
    };
    std::string path;
    for (const char* dir : kCandidates) {
        const std::string candidate = dir + filename;
        if (std::ifstream(candidate)) {
            path = candidate;
            break;
        }
    }

    if (path.empty())
        throw std::runtime_error("CPU: could not open ROM file: " + filename);
    
    Reset();
    ram_.LoadFile(path);
    SetPC(ram_.entry());
}

Word CPU::pc() const {
        return pc_.value;
}

Word CPU::ReadMemoryWord(Word address) const {
    return ram_.ReadWord(address);
}

Half CPU::ReadMemoryHalf(Word address) const {
    return ram_.ReadHalf(address);
}

Byte CPU::ReadMemoryByte(Word address) const {
    return ram_.ReadByte(address);
}

std::vector<Byte> CPU::ReadFramebuffer() {
    std::vector<Byte> buf;
    buf.reserve(kFramebufferBytes);
    for (size_t i = 0; i < kFramebufferBytes; ++i) {
        buf.push_back(ram_.ReadByte(kFramebufferBase + static_cast<Word>(i)));
    }
    return buf;
}

int32_t CPU::SignExtend(uint32_t value, uint32_t bits) const {
    uint32_t shift = 32 - bits;
    return static_cast<int32_t>(value << shift) >> shift;
}

Word CPU::ExtractOpcode(Word instruction) {
    return instruction & 0x7F;             // [6:0]
}

Word CPU::ExtractRd(Word instruction) {
    return (instruction >> 7) & 0x1F;      // [11:7]
}

Word CPU::ExtractFunct3(Word instruction) {
    return (instruction >> 12) & 0x07;     // [14:12]
}

Word CPU::ExtractFunct7(Word instruction) {
    return (instruction >> 25) & 0x7F;     // [31:25]
}

Word CPU::ExtractRs1(Word instruction) {
    return (instruction >> 15) & 0x1F;     // [19:15]
}

Word CPU::ExtractRs2(Word instruction) {
    return (instruction >> 20) & 0x1F;     // [24:20]
}

DecodedInstruction CPU::Decode(Word instruction) {
    switch (ExtractOpcode(instruction)) {
        case 0x33: // R-type
        case 0x0B: // M-extension (R-type)
            return DecodeRType(instruction);
        case 0x13: // I-type
        case 0x03: // Load (I-type)
        case 0x67: // JALR (I-type)
            return DecodeIType(instruction);
        case 0x23: // Store (S-type)
            return DecodeSType(instruction);
        case 0x37: // LUI (U-type)
        case 0x17: // AUIPC (U-type)
            return DecodeUType(instruction);
        case 0x6F: // JAL (J-type)
            return DecodeJType(instruction);
        case 0x63: // Branch (B-type)
            return DecodeBType(instruction);
        case 0x0F: // Fence (I-type)
            return DecodeIType(instruction);
        case 0x73: // Environment (ECALL, EBREAK)
            return DecodeIType(instruction);
        default:
            return {isa::Opcode::kUnknown, 0, 0, 0, 0};
    }
}

DecodedInstruction CPU::DecodeRType(Word instruction) {

    DecodedInstruction instr;
    // R-type instructions do not carry an immediate
    instr.imm = 0;
    instr.rd = ExtractRd(instruction);
    uint32_t funct3 = ExtractFunct3(instruction);
    instr.rs1 = ExtractRs1(instruction);
    instr.rs2 = ExtractRs2(instruction);
    uint32_t funct7 = ExtractFunct7(instruction);

    if(funct7 == 0x01) {
        // M-extension instructions
        switch (funct3) {
            case 0x0:
                instr.opcode = isa::Opcode::kMul; // multiply
                break;
            case 0x1:
                instr.opcode = isa::Opcode::kMulh; // multiply signed
                break;
            case 0x2:
                instr.opcode = isa::Opcode::kMulhsu; // multiply signed and unsigned
                break;
            case 0x3:
                instr.opcode = isa::Opcode::kMulhu; // multiply unsigned
                break;
            case 0x4:
                instr.opcode = isa::Opcode::kDiv; // divide
                break;
            case 0x5:
                instr.opcode = isa::Opcode::kDivu; // divide unsigned
                break;
            case 0x6:
                instr.opcode = isa::Opcode::kRem; // remainder
                break;
            case 0x7:
                instr.opcode = isa::Opcode::kRemu; // remainder unsigned
                break;
            default:
                instr.opcode = isa::Opcode::kUnknown;
        }
    } else {
        // Standard R-type instructions
        switch (funct3) {
            case 0x0:
                if (funct7 == 0x00) {
                    instr.opcode = isa::Opcode::kAdd; // add
                } else if (funct7 == 0x20) {
                    instr.opcode = isa::Opcode::kSub; // subtract
                } else {
                    instr.opcode = isa::Opcode::kUnknown;
                }
                break;
            case 0x1:
                instr.opcode = isa::Opcode::kSll; // shift left logical
                break;
            case 0x2:
                instr.opcode = isa::Opcode::kSlt; // set less than
                break;
            case 0x3:
                instr.opcode = isa::Opcode::kSltu; // set less than unsigned
                break;
            case 0x4:
                instr.opcode = isa::Opcode::kXor; // XOR operation
                break;
            case 0x5:
                if (funct7 == 0x00) {
                    instr.opcode = isa::Opcode::kSrl; // shift right logical
                } else if (funct7 == 0x20) {
                    instr.opcode = isa::Opcode::kSra; // shift right arithmetic
                } else {
                    instr.opcode = isa::Opcode::kUnknown;
                }
                break;
            case 0x6:
                instr.opcode = isa::Opcode::kOr; // OR operation
                break;
            case 0x7:
                instr.opcode = isa::Opcode::kAnd; // AND operation
                break;
            default:
                instr.opcode = isa::Opcode::kUnknown;
        }
    }

    return instr;
}

DecodedInstruction CPU::DecodeIType(Word instruction) {

    DecodedInstruction instr;
    uint32_t opcode = ExtractOpcode(instruction);
    instr.rd = ExtractRd(instruction);
    uint32_t funct3 = ExtractFunct3(instruction);
    instr.rs1 = ExtractRs1(instruction);
    instr.rs2 = 0; // I-type instructions do not have rs2
    uint32_t imm = (instruction >> 20) & 0xFFF; // [31:20]

    instr.imm = SignExtend(imm, 12); // sign-extend the immediate value

    // determine the specific I-type instruction based on funct3
    if(opcode == 0x13) { // OP-IMM
        uint32_t funct7 = (imm >> 5) & 0x7F;  // upper 7 bits = funct7
        uint32_t shamt  = imm & 0x1F;         // lower 5 bits = shift amount
        switch (funct3) {
            case 0x0:
                instr.opcode = isa::Opcode::kAddi; // add immediate
                break;
            case 0x1:
                instr.opcode = isa::Opcode::kSlli; // shift left logical immediate
                instr.imm = shamt; // use shamt for shift amount, sign-extend is not needed 
                break;
            case 0x2:
                instr.opcode = isa::Opcode::kSlti; // set less than immediate
                break;
            case 0x3:
                instr.opcode = isa::Opcode::kSltiu; // set less than immediate unsigned
                break;
            case 0x4:
                instr.opcode = isa::Opcode::kXori; // XOR immediate
                break;
            case 0x5:
                if (funct7 == 0x00) {
                    instr.opcode = isa::Opcode::kSrli; // shift right logical immediate
                    instr.imm = shamt; // use shamt for shift amount, sign-extend is not needed
                } else if (funct7 == 0x20) {
                    instr.opcode = isa::Opcode::kSrai; // shift right arithmetic immediate
                    instr.imm = shamt; // use shamt for shift amount, sign-extend is not needed
                } else {
                    instr.opcode = isa::Opcode::kUnknown;
                }
                break;
            case 0x6:
                instr.opcode = isa::Opcode::kOri; // OR immediate
                break;
            case 0x7:
                instr.opcode = isa::Opcode::kAndi; // AND immediate 
                break;
            default:
                instr.opcode = isa::Opcode::kUnknown; 
        }
    } else if(opcode == 0x03) { // LOAD
        switch (funct3) {
            case 0x0:
                instr.opcode = isa::Opcode::kLb; // load byte
                break;
            case 0x1:
                instr.opcode = isa::Opcode::kLh; // load halfword
                break;
            case 0x2:
                instr.opcode = isa::Opcode::kLw; // load word
                break;
            case 0x4:
                instr.opcode = isa::Opcode::kLbu; // load byte unsigned
                break;
            case 0x5:
                instr.opcode = isa::Opcode::kLhu; // load halfword unsigned
                break;
            default:
                instr.opcode = isa::Opcode::kUnknown;
        }
    } else if(opcode == 0x67) { // JALR
        instr.opcode = isa::Opcode::kJalr;
    } else if(opcode == 0x0F) { // FENCE
        instr.opcode = isa::Opcode::kFence;
    } else if(opcode == 0x73) { // ECALL, EBREAK
        if (funct3 == 0x0) {
            if (imm == 0x000) {
                instr.opcode = isa::Opcode::kEcall; // ECALL instruction
            } else if (imm == 0x001) {
                instr.opcode = isa::Opcode::kEbreak; // EBREAK instruction
            } else {
                instr.opcode = isa::Opcode::kUnknown;
            }
        } else {
            instr.opcode = isa::Opcode::kUnknown;
        }
    } else {
        instr.opcode = isa::Opcode::kUnknown;
    }   
    return instr;
}

DecodedInstruction CPU::DecodeSType(Word instruction) {
    DecodedInstruction instr;
    instr.rd = 0; // S-type instructions do not have a destination register
    uint32_t funct3 = ExtractFunct3(instruction);
    instr.rs1 = ExtractRs1(instruction);
    instr.rs2 = ExtractRs2(instruction);

    // imm[11:5] in [31:25], imm[4:0] in [11:7]
    uint32_t imm11_5 = (instruction >> 25) & 0x7F;
    uint32_t imm4_0  = (instruction >> 7)  & 0x1F;
    uint32_t imm = (imm11_5 << 5) | imm4_0;
    instr.imm = SignExtend(imm, 12);

    // determine the specific S-type instruction based on funct3
    switch (funct3) {
        case 0x0:
            instr.opcode = isa::Opcode::kSb; // store byte
            break;
        case 0x1:
            instr.opcode = isa::Opcode::kSh; // store halfword
            break;
        case 0x2:
            instr.opcode = isa::Opcode::kSw; // store word
            break;
        default:
            instr.opcode = isa::Opcode::kUnknown;
    }
    return instr;
}

DecodedInstruction CPU::DecodeUType(Word instruction) {
    DecodedInstruction instr;
    instr.rs1 = 0; // U-type instructions do not have rs1
    instr.rs2 = 0; // U-type instructions do not have rs2
    instr.rd = ExtractRd(instruction);
    instr.imm = static_cast<int32_t>(instruction & 0xFFFFF000); // no sign-extension needed for U-type

    uint32_t opcode = ExtractOpcode(instruction);
    if(opcode == 0x37) { // LUI
        instr.opcode = isa::Opcode::kLui; // load upper immediate
    } else if(opcode == 0x17) { // AUIPC
        instr.opcode = isa::Opcode::kAuipc; // add upper immediate to PC
    } else {
        instr.opcode = isa::Opcode::kUnknown;
    }
    return instr;
}

DecodedInstruction CPU::DecodeBType(Word instruction) {
    DecodedInstruction instr;
    instr.rd = 0; // B-type instructions do not have a destination register
    uint32_t funct3 = ExtractFunct3(instruction);
    instr.rs1 = ExtractRs1(instruction);
    instr.rs2 = ExtractRs2(instruction);

    // B-type immediate is spread across several fields
    uint32_t imm12   = (instruction >> 31) & 0x1;   // imm[12]
    uint32_t imm11   = (instruction >> 7)  & 0x1;   // imm[11]
    uint32_t imm10_5 = (instruction >> 25) & 0x3F;  // imm[10:5]
    uint32_t imm4_1  = (instruction >> 8)  & 0xF;   // imm[4:1]

    uint32_t imm = (imm12 << 12) | (imm11 << 11) | (imm10_5 << 5) | (imm4_1 << 1);
    instr.imm = SignExtend(imm, 13);

    // determine the specific B-type instruction based on funct3
    switch (funct3) {
        case 0x0:
            instr.opcode = isa::Opcode::kBeq; // branch if equal
            break;
        case 0x1:
            instr.opcode = isa::Opcode::kBne; // branch if not equal
            break;
        case 0x4:
            instr.opcode = isa::Opcode::kBlt; // branch if less than
            break;
        case 0x5:
            instr.opcode = isa::Opcode::kBge; // branch if greater than or equal
            break;
        case 0x6:
            instr.opcode = isa::Opcode::kBltu; // branch if less than unsigned
            break;
        case 0x7:
            instr.opcode = isa::Opcode::kBgeu; // branch if greater than or equal unsigned
            break;  
        default:
            instr.opcode = isa::Opcode::kUnknown;
    }
    return instr;
}

DecodedInstruction CPU::DecodeJType(Word instruction) {
    DecodedInstruction instr;
    instr.opcode = isa::Opcode::kJal; // JAL instruction
    instr.rs1 = 0; // J-type instructions do not have rs1
    instr.rs2 = 0; // J-type instructions do not have rs2
    instr.rd = ExtractRd(instruction);

    // J-type immediate is spread across several fields
    uint32_t imm20    = (instruction >> 31) & 0x1;   // imm[20]
    uint32_t imm19_12 = (instruction >> 12) & 0xFF;  // imm[19:12]
    uint32_t imm11    = (instruction >> 20) & 0x1;   // imm[11]
    uint32_t imm10_1  = (instruction >> 21) & 0x3FF; // imm[10:1]

    uint32_t imm = (imm20 << 20) | (imm19_12 << 12) | (imm11 << 11) | (imm10_1 << 1);
    instr.imm = SignExtend(imm, 21);

    return instr;
}

void CPU::WriteReg(size_t index, Word value) {
    if (index < 1 || index > 31)
        return;
    x[index].value = value;
}

Word CPU::ReadReg(size_t index) const {
    if (index > 31)
        return 0;
    return x[index].value;
}

AluOp CPU::MapToAluOp(isa::Opcode opcode) const {
    AluOp op;
    switch (opcode){
        case isa::Opcode::kAdd:
        case isa::Opcode::kAddi:
            op = AluOp::kAdd;
            break;
        case isa::Opcode::kAnd:
        case isa::Opcode::kAndi:
            op = AluOp::kAnd;
            break;
        case isa::Opcode::kSub:
            op = AluOp::kSub;
            break;
        case isa::Opcode::kOr:
        case isa::Opcode::kOri:
            op = AluOp::kOr;
            break;
        case isa::Opcode::kXor:
        case isa::Opcode::kXori:
            op = AluOp::kXor;
            break;
        case isa::Opcode::kSlt:
        case isa::Opcode::kSlti:
            op = AluOp::kSlt;
            break;
        case isa::Opcode::kSltu:
        case isa::Opcode::kSltiu:
            op = AluOp::kSltu;
            break;
        case isa::Opcode::kSll:
        case isa::Opcode::kSlli:
            op = AluOp::kSll;
            break;
        case isa::Opcode::kSrl:
        case isa::Opcode::kSrli:
            op = AluOp::kSrl;
            break;
        case isa::Opcode::kSra:
        case isa::Opcode::kSrai:
            op = AluOp::kSra;
            break;
        case isa::Opcode::kMul:
            op = AluOp::kMul;
            break;
        case isa::Opcode::kMulh:
            op = AluOp::kMulh;
            break;
        case isa::Opcode::kMulhsu:
            op = AluOp::kMulhsu;
            break;
        case isa::Opcode::kMulhu:
            op = AluOp::kMulhu;
            break;
        case isa::Opcode::kDiv:
            op = AluOp::kDiv;
            break;
        case isa::Opcode::kDivu:
            op = AluOp::kDivu;
            break;
        case isa::Opcode::kRem:
            op = AluOp::kRem;
            break;
        case isa::Opcode::kRemu:
            op = AluOp::kRemu;
            break;
        case isa::Opcode::kUnknown:
        default:
            assert(false && "MapToAluOp: unmapped opcode reached the ALU dispatch layer");
            std::abort();
    }
    return op;
}

AluOutput CPU::EffectiveAddress(Word base, int32_t offset) const {
    // compute effective address by adding base and offset
    return alu_.Execute(base, static_cast<Word>(offset), AluOp::kAdd);
}

bool CPU::Execute(DecodedInstruction instr) {
    switch (instr.opcode) {
        // R-type
        case isa::Opcode::kAdd:
        case isa::Opcode::kSub:
        case isa::Opcode::kSll:
        case isa::Opcode::kSlt:
        case isa::Opcode::kSltu:
        case isa::Opcode::kXor:
        case isa::Opcode::kSrl:
        case isa::Opcode::kSra:
        case isa::Opcode::kOr:
        case isa::Opcode::kAnd:
        // M-extension (R-type)
        case isa::Opcode::kMul:
        case isa::Opcode::kMulh:
        case isa::Opcode::kMulhsu:
        case isa::Opcode::kMulhu:
        case isa::Opcode::kDiv:
        case isa::Opcode::kDivu:
        case isa::Opcode::kRem:
        case isa::Opcode::kRemu:
            return ExecuteRType(instr);

        // I-type (including loads, JALR, FENCE, ECALL, EBREAK)
        case isa::Opcode::kAddi:
        case isa::Opcode::kSlti:
        case isa::Opcode::kSltiu:
        case isa::Opcode::kAndi:
        case isa::Opcode::kOri:
        case isa::Opcode::kXori:
        case isa::Opcode::kSlli:
        case isa::Opcode::kSrli:
        case isa::Opcode::kSrai:
        case isa::Opcode::kLb:
        case isa::Opcode::kLh:
        case isa::Opcode::kLw:
        case isa::Opcode::kLbu:
        case isa::Opcode::kLhu:
        case isa::Opcode::kJalr:
        case isa::Opcode::kFence:
        case isa::Opcode::kEcall:
        case isa::Opcode::kEbreak:
            return ExecuteIType(instr);

        // S-type
        case isa::Opcode::kSb:
        case isa::Opcode::kSh:
        case isa::Opcode::kSw:
            return ExecuteSType(instr);

        // U-type
        case isa::Opcode::kLui:
        case isa::Opcode::kAuipc:
            return ExecuteUType(instr);

        // J-type
        case isa::Opcode::kJal:
            return ExecuteJType(instr);

        // B-type
        case isa::Opcode::kBeq:
        case isa::Opcode::kBne:
        case isa::Opcode::kBlt:
        case isa::Opcode::kBge:
        case isa::Opcode::kBltu:
        case isa::Opcode::kBgeu:
            return ExecuteBType(instr);

        default:
            return false;
    }
}

bool CPU::ExecuteRType(DecodedInstruction instr) {
    Word rs1 = ReadReg(static_cast<size_t>(instr.rs1));
    Word rs2 = ReadReg(static_cast<size_t>(instr.rs2));
    AluOp alu_opcode = MapToAluOp(instr.opcode);
    AluOutput alu_output = alu_.Execute(rs1, rs2, alu_opcode);
    WriteReg(static_cast<size_t>(instr.rd), alu_output.result);
    return false;
}

bool CPU::ExecuteIType(DecodedInstruction instr) {
    switch (instr.opcode) {
        // arithmetic / shift-immediate group
        case isa::Opcode::kAddi:
        case isa::Opcode::kSlti:
        case isa::Opcode::kSltiu:
        case isa::Opcode::kAndi:
        case isa::Opcode::kOri:
        case isa::Opcode::kXori:
        case isa::Opcode::kSlli:
        case isa::Opcode::kSrli:
        case isa::Opcode::kSrai: {
            Word rs1 = ReadReg(static_cast<size_t>(instr.rs1));
            Word rs2 = static_cast<Word>(instr.imm); // immediate as second operand
            AluOp alu_opcode = MapToAluOp(instr.opcode);
            AluOutput alu_output = alu_.Execute(rs1, rs2, alu_opcode);
            WriteReg(static_cast<size_t>(instr.rd), alu_output.result);
            return false;
        }

        // loads
        case isa::Opcode::kLb:
        case isa::Opcode::kLbu:
        case isa::Opcode::kLh:
        case isa::Opcode::kLhu:
        case isa::Opcode::kLw: {
            Word base = ReadReg(static_cast<size_t>(instr.rs1));
            AluOutput addr = EffectiveAddress(base, instr.imm);
            switch (instr.opcode) {
                case isa::Opcode::kLb: {
                    Byte raw = ram_.ReadByte(addr.result);
                    WriteReg(static_cast<size_t>(instr.rd), static_cast<Word>(SignExtend(raw, 8))); // sign-extend byte
                    break;
                }
                case isa::Opcode::kLbu: {
                    Byte raw = ram_.ReadByte(addr.result);
                    WriteReg(static_cast<size_t>(instr.rd), static_cast<Word>(raw));
                    break;
                }
                case isa::Opcode::kLh: {
                    Half raw = ram_.ReadHalf(addr.result);
                    WriteReg(static_cast<size_t>(instr.rd), static_cast<Word>(SignExtend(raw, 16))); // sign-extend halfword
                    break;
                }
                case isa::Opcode::kLhu: {
                    Half raw = ram_.ReadHalf(addr.result);
                    WriteReg(static_cast<size_t>(instr.rd), static_cast<Word>(raw));
                    break; 
                }
                case isa::Opcode::kLw: {
                    WriteReg(static_cast<size_t>(instr.rd), ram_.ReadWord(addr.result));
                    break;
                }
                default:
                    break;
            }
            return false;
        }

        // JALR
        case isa::Opcode::kJalr: {
            Word return_address = pc_.value + 4;
            Word base = ReadReg(static_cast<size_t>(instr.rs1));
            AluOutput target_address = EffectiveAddress(base, instr.imm);
            target_address.result &= ~1u;  // clear LSB per spec
            if (target_address.result & 0x3) {
                throw std::runtime_error("JALR: misaligned target address");
            }
            WriteReg(static_cast<size_t>(instr.rd), return_address);
            SetPC(target_address.result);
            return true;
        }

        case isa::Opcode::kFence:
            return false;  // nop for single core
        case isa::Opcode::kEcall:
            Ecall();
            return false;
        case isa::Opcode::kEbreak:
            halted_ = true;
            return false;
        default:
            assert(false); 
            return false;
    }
}

bool CPU::ExecuteSType(DecodedInstruction instr) {
    Word base = ReadReg(static_cast<size_t>(instr.rs1));
    Word value = ReadReg(static_cast<size_t>(instr.rs2));
    AluOutput addr = EffectiveAddress(base, instr.imm);
    switch (instr.opcode){
        case isa::Opcode::kSb:
            ram_.WriteByte(static_cast<size_t>(addr.result), static_cast<Byte>(value & 0xFF));
            break;
        case isa::Opcode::kSh:
            ram_.WriteHalf(static_cast<size_t>(addr.result), static_cast<Half>(value & 0xFFFF));
            break;
        case isa::Opcode::kSw:
            ram_.WriteWord(static_cast<size_t>(addr.result), value);
            break;
        default:
            assert(false);
    }
    return false;
}


bool CPU::ExecuteJType(DecodedInstruction instr) {
    Word return_address = pc_.value + 4; // address of the next instruction
    WriteReg(static_cast<size_t>(instr.rd), return_address);
    AluOutput target_address = EffectiveAddress(pc_.value, instr.imm);
    if (target_address.result & 0x3){
        throw std::runtime_error("JAL: misaligned target address");    
    }
    else {
        SetPC(target_address.result);
    }
    return true;
}

bool CPU::ExecuteUType(DecodedInstruction instr) {
    switch (instr.opcode) {
        case isa::Opcode::kLui:
            WriteReg(static_cast<size_t>(instr.rd), static_cast<Word>(instr.imm)); 
            break;
        case isa::Opcode::kAuipc: {
            AluOutput result = EffectiveAddress(pc_.value, instr.imm);
            WriteReg(static_cast<size_t>(instr.rd), result.result); 
            break;
        }
        default:
            assert(false);
    }
    return false;
}

bool CPU::ExecuteBType(DecodedInstruction instr) {
    Word rs1 = ReadReg(static_cast<size_t>(instr.rs1));
    Word rs2 = ReadReg(static_cast<size_t>(instr.rs2));
    AluOutput target_address = EffectiveAddress(pc_.value, instr.imm);
    bool take_branch = false;
    switch (instr.opcode) {
        case isa::Opcode::kBeq:
            take_branch = (rs1 == rs2);
            break;
        case isa::Opcode::kBne:
            take_branch = (rs1 != rs2);
            break;
        case isa::Opcode::kBlt:
            take_branch = (static_cast<int32_t>(rs1) < static_cast<int32_t>(rs2));
            break;
        case isa::Opcode::kBge:
            take_branch = (static_cast<int32_t>(rs1) >= static_cast<int32_t>(rs2));
            break;
        case isa::Opcode::kBltu:
            take_branch = (rs1 < rs2);
            break;
        case isa::Opcode::kBgeu:
            take_branch = (rs1 >= rs2); 
            break;
        default:
            assert(false);
    }

    if(take_branch) {
        if (target_address.result & 0x3) {
            throw std::runtime_error("Branch: misaligned target address");
        } else {
            SetPC(target_address.result);
        }
    }
    return take_branch; // branch taken / not taken
}

void CPU::Reset() {
    // initialize registers
    for (int i = 0; i < 32; i++) {
        x[i].value = 0;
    }
    // initialize program counter
    SetPC(0);
    ram_.Reset();
    halted_ = false;
}

void CPU::Step() {
    Word instr = Fetch();
    DecodedInstruction decoded_instr = Decode(instr);
    bool pc_changed = Execute(decoded_instr);
    if (!pc_changed) {
        IncrementPC();
    }
}

void CPU::Ecall() {
    Word ecall_number = x[17].value;
    switch (static_cast<ecall>(ecall_number)) {
        // print functions
        case ecall::kPrintint:
            break;
        case ecall::kPrintstring:
            break;
        case ecall::kPrintchar:
            break;
            
        // read functions
        case ecall::kReadint:
            break;
        case ecall::kReadstring:
            break;
        case ecall::kReadchar:
            break;

        // exit calls
        case ecall::kExit:
        case ecall::kExit2:
            halted_ = true; // do not change this pls
            break;

        default:
            // std::cerr << "ERROR: Unknown ecall code encountered." << std::endl;
            break;
    }
}

} // namespace cpu


