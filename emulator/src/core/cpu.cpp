#include "cpu.h"

#include <cassert>
#include <stdexcept>

namespace cpu {

void CPU::LoadROM(const std::string& filename) {
    rom_.LoadFile(filename);
}

int32_t CPU::SignExtend(uint32_t value, uint32_t bits) const {
    uint32_t shift = 32 - bits;
    return static_cast<int32_t>(value << shift) >> shift;
}

Word CPU::ExtractRs1(Word instruction){
    return (instruction >> 15) & 0x1F;
}

Word CPU::ExtractRs2(Word instruction){
    return (instruction >> 20) & 0x1F;
}

DecodedInstruction CPU::Decode(Word instruction) {
    // extract the opcode from the instruction
    uint32_t opcode = instruction & 0x7F;

    // determine the instruction type based on the opcode
    switch (opcode) {
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
            return DecodeIType(instruction); // treat as I-type for decoding
        default:
            return {isa::Opcode::kUnknown, 0, 0, 0, 0};
    }
}

DecodedInstruction CPU::DecodeRType(Word instruction) {

    DecodedInstruction instr;
    // the opcode (7 bits) [6:0] are not needed as we already know it's R-type
    instr.rd = (instruction >> 7) & 0x1F; // extract rd (5 bits) [11:7]
    uint32_t funct3 = (instruction >> 12) & 0x07; // extract funct3 (3 bits) [14:12]
    instr.rs1 = ExtractRs1(instruction); // extract rs1 (5 bits) [19:15]
    instr.rs2 = ExtractRs2(instruction); // extract rs2 (5 bits) [24:20]
    uint32_t funct7 = (instruction >> 25) & 0x7F; // extract funct7 (7 bits) [31:25]

    instr.imm = 0; // R-type instructions do not have an immediate value
    
    // determine the specific R-type instruction based on funct3 and funct7
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
    uint32_t opcode = (instruction & 0x7F); // extract opcode (7 bits) [6:0]
    instr.rd = (instruction >> 7) & 0x1F; // extract rd (5 bits) [11:7]
    uint32_t funct3 = (instruction >> 12) & 0x07; // extract funct3 (3 bits) [14:12]
    instr.rs1 = ExtractRs1(instruction); // extract rs1 (5 bits) [19:15]
    instr.rs2 = 0; // I-type instructions do not have rs2
    uint32_t imm = (instruction >> 20) & 0xFFF; // extract immediate (12 bits) [31:20]

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
    // the opcode (7 bits) [6:0] are not needed as we already know it's S-type
    uint32_t imm4_0 = (instruction >> 7) & 0x1F; // extract imm[4:0] (5 bits) [11:7]
    uint32_t funct3 = (instruction >> 12) & 0x07; // extract funct3 (3 bits) [14:12]
    instr.rs1 = ExtractRs1(instruction); // extract rs1 (5 bits) [19:15]
    instr.rs2 = ExtractRs2(instruction); // extract rs2 (5 bits) [24:20]
    instr.rd = 0; // S-type instructions do not have a destination register
    uint32_t imm11_5 = (instruction >> 25) & 0x7F; // extract imm[11:5] (7 bits) [31:25]

    uint32_t imm = (imm11_5 << 5) | imm4_0; // combine to form the full immediate
    instr.imm = SignExtend(imm, 12); // sign-extend the immediate value

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
    uint32_t opcode = instruction & 0x7F; // extract opcode (7 bits) [6:0]
    instr.rd = (instruction >> 7) & 0x1F; // extract rd (5 bits) [11:7]
    uint32_t imm = instruction & 0xFFFFF000; // extract immediate (20 bits) [31:12]
    instr.rs1 = 0; // U-type instructions do not have rs1
    instr.rs2 = 0; // U-type instructions do not have rs2
    instr.imm = static_cast<int32_t>(imm); // no sign-extension needed for U-type

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
    // the opcode (7 bits) [6:0] are not needed as we already know it's B-type
    uint32_t imm11 = (instruction >> 7) & 0x1; // extract imm[11] (1 bit) [7]
    uint32_t imm4_1 = (instruction >> 8) & 0xF; // extract imm[4:1] (4 bits) [11:8]
    uint32_t funct3 = (instruction >> 12) & 0x07; // extract funct3 (3 bits) [14:12]
    instr.rs1 = ExtractRs1(instruction); // extract rs1 (5 bits) [19:15]
    instr.rs2 = ExtractRs2(instruction); // extract rs2 (5 bits) [24:20]
    instr.rd = 0; // B-type instructions do not have a destination register
    uint32_t imm10_5 = (instruction >> 25) & 0x3F; // extract imm[10:5] (6 bits) [30:25]
    uint32_t imm12 = (instruction >> 31) & 0x1; // extract imm[12] (1 bit) [31]

    uint32_t imm = (imm12 << 12) | (imm11 << 11) | (imm10_5 << 5) | (imm4_1 << 1); // combine to form the full immediate
    instr.imm = SignExtend(imm, 13); // sign-extend the immediate value

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
    // the opcode (7 bits) [6:0] are not needed as we already know it's J-type
    instr.opcode = isa::Opcode::kJal; // JAL instruction        
    instr.rs1 = 0; // J-type instructions do not have rs1
    instr.rs2 = 0; // J-type instructions do not have rs2
    instr.rd = (instruction >> 7) & 0x1F; // extract rd (5 bits) [11:7]
    uint32_t imm19_12 = (instruction >> 12) & 0xFF; // extract imm[19:12] (8 bits) [19:12]
    uint32_t imm11 = (instruction >> 20) & 0x1; // extract imm[11] (1 bit) [20]
    uint32_t imm10_1 = (instruction >> 21) & 0x3FF; // extract imm[10:1] (10 bits) [30:21]
    uint32_t imm20 = (instruction >> 31) & 0x1; // extract imm[20] (1 bit) [31]

    uint32_t imm = (imm20 << 20) | (imm19_12 << 12) | (imm11 << 11) | (imm10_1 << 1); // combine to form the full immediate
    instr.imm = SignExtend(imm, 21); // sign-extend the immediate value

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

alu::AluOp CPU::MapToAluOp(isa::Opcode opcode) const {
    alu::AluOp op;
    switch (opcode){
        case isa::Opcode::kAdd:
        case isa::Opcode::kAddi:
            op = alu::AluOp::kAdd;
            break;
        case isa::Opcode::kAnd:
        case isa::Opcode::kAndi:
            op = alu::AluOp::kAnd;
            break;
        case isa::Opcode::kSub:
            op = alu::AluOp::kSub;
            break;
        case isa::Opcode::kOr:
        case isa::Opcode::kOri:
            op = alu::AluOp::kOr;
            break;
        case isa::Opcode::kXor:
        case isa::Opcode::kXori:
            op = alu::AluOp::kXor;
            break;
        case isa::Opcode::kSlt:
        case isa::Opcode::kSlti:
            op = alu::AluOp::kSlt;
            break;
        case isa::Opcode::kSltu:
        case isa::Opcode::kSltiu:
            op = alu::AluOp::kSltu;
            break;
        case isa::Opcode::kSll:
        case isa::Opcode::kSlli:
            op = alu::AluOp::kSll;
            break;
        case isa::Opcode::kSrl:
        case isa::Opcode::kSrli:
            op = alu::AluOp::kSrl;
            break;
        case isa::Opcode::kSra:
        case isa::Opcode::kSrai:
            op = alu::AluOp::kSra;
            break;
        case isa::Opcode::kMul:
            op = alu::AluOp::kMul;
            break;
        case isa::Opcode::kMulh:
            op = alu::AluOp::kMulh;
            break;
        case isa::Opcode::kMulhsu:
            op = alu::AluOp::kMulhsu;
            break;
        case isa::Opcode::kMulhu:
            op = alu::AluOp::kMulhu;
            break;
        case isa::Opcode::kDiv:
            op = alu::AluOp::kDiv;
            break;
        case isa::Opcode::kDivu:
            op = alu::AluOp::kDivu;
            break;
        case isa::Opcode::kRem:
            op = alu::AluOp::kRem;
            break;
        case isa::Opcode::kRemu:
            op = alu::AluOp::kRemu;
            break;
        case isa::Opcode::kUnknown:
        default:
            assert(false && "MapToAluOp: unmapped opcode reached the ALU dispatch layer");
            std::abort();
    }
    return op;
}

alu::AluOutput CPU::EffectiveAddress(Word base, int32_t offset) const {
    return alu_.Execute(base, static_cast<Word>(offset), alu::AluOp::kAdd); // compute effective address by adding base and offset
}

bool CPU::ExecuteRType(DecodedInstruction instr) {
    Word rs1 = ReadReg(static_cast<size_t>(instr.rs1)); // read the value of the first source register
    Word rs2 = ReadReg(static_cast<size_t>(instr.rs2)); // read the value of the second source register
    alu::AluOp alu_opcode = MapToAluOp(instr.opcode);
    alu::AluOutput alu_output = alu_.Execute(rs1,rs2,alu_opcode); // execute the ALU operation based on the opcode and source register values
    WriteReg(static_cast<size_t>(instr.rd), alu_output.result);  // write the result to the destination register, rd
    return false; // pc is unchanged
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
            Word rs1 = ReadReg(static_cast<size_t>(instr.rs1)); // read the value of the first source register
            Word rs2 = static_cast<Word>(instr.imm);  // use the immediate value as the second operand
            alu::AluOp alu_opcode = MapToAluOp(instr.opcode);
            alu::AluOutput alu_output = alu_.Execute(rs1, rs2, alu_opcode); // execute the ALU operation based on the opcode and operands
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
            alu::AluOutput addr = EffectiveAddress(base, instr.imm);
            switch (instr.opcode) {
                case isa::Opcode::kLb: {
                    Byte raw = ram_.ReadByte(addr.result);
                    WriteReg(static_cast<size_t>(instr.rd), static_cast<Word>(SignExtend(raw, 8))); // sign-extend the byte to a word and write to rd
                    break;
                }
                case isa::Opcode::kLbu: {
                    Byte raw = ram_.ReadByte(addr.result);
                    WriteReg(static_cast<size_t>(instr.rd), static_cast<Word>(raw)); // write the byte to rd with zero-extension
                    break;
                }
                case isa::Opcode::kLh: {
                    Half raw = ram_.ReadHalf(addr.result);
                    WriteReg(static_cast<size_t>(instr.rd), static_cast<Word>(SignExtend(raw, 16))); // sign-extend the halfword to a word and write to rd
                    break;
                }
                case isa::Opcode::kLhu: {
                    Half raw = ram_.ReadHalf(addr.result);
                    WriteReg(static_cast<size_t>(instr.rd), static_cast<Word>(raw)); // write the halfword to rd with zero-extension
                    break; 
                }
                case isa::Opcode::kLw: {
                    WriteReg(static_cast<size_t>(instr.rd), ram_.ReadWord(addr.result)); // read the word from memory and write to rd
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
            alu::AluOutput target_address = EffectiveAddress(base, instr.imm); // compute the target address by adding the base register value and the immediate offset
            target_address.result &= ~1u;  // clear LSB per spec
            if (target_address.result & 0x3) {
                throw std::runtime_error("JALR: misaligned target address"); // check for misalignment, throw an error if the target address is not aligned to 4 bytes
            }
            WriteReg(static_cast<size_t>(instr.rd), return_address); // write the return address to the destination register, rd
            pc_.value = target_address.result; // update the program counter to the target address
            return true;
        }

        case isa::Opcode::kFence:
            return false;  // nop for single core
        case isa::Opcode::kEcall:
            return false;  // reserved for future system call handling
        case isa::Opcode::kEbreak:
            std::abort();  // reserved for future debugging support
        default:
            assert(false); 
            return false;
    }
}

bool CPU::ExecuteSType(DecodedInstruction instr) {
    Word base = ReadReg(static_cast<size_t>(instr.rs1));
    Word value = ReadReg(static_cast<size_t>(instr.rs2));
    alu::AluOutput addr = EffectiveAddress(base, instr.imm);
    switch (instr.opcode){
        case isa::Opcode::kSb:
            ram_.WriteByte(static_cast<size_t>(addr.result), static_cast<Byte>(value & 0xFF)); // write the least significant byte of value to memory
            break;
        case isa::Opcode::kSh:
            ram_.WriteHalf(static_cast<size_t>(addr.result), static_cast<Half>(value & 0xFFFF)); // write the least significant halfword of value to memory
            break;
        case isa::Opcode::kSw:
            ram_.WriteWord(static_cast<size_t>(addr.result), value); // write the entire word value to memory
            break;
        default:
            assert(false);
    }
    return false;
}

bool CPU::ExecuteJType(DecodedInstruction instr) {
    Word return_address = pc_.value + 4; // address of the next instruction
    WriteReg(static_cast<size_t>(instr.rd), return_address); // write return address to rd
    alu::AluOutput target_address = EffectiveAddress(pc_.value, instr.imm);
    if (target_address.result & 0x3){  // check for misalignment, throw an error if the target address is not aligned to 4 bytes
        throw std::runtime_error("JAL: misaligned target address");    
    }
    else {
        pc_.value = target_address.result; // jump to the target address
    }
    return true; // indicate that the PC has been updated
}

bool CPU::ExecuteUType(DecodedInstruction instr) {
    switch (instr.opcode) {
        case isa::Opcode::kLui:
            WriteReg(static_cast<size_t>(instr.rd), static_cast<Word>(instr.imm)); 
            break;
        case isa::Opcode::kAuipc: {
            alu::AluOutput result = EffectiveAddress(pc_.value, instr.imm);
            WriteReg(static_cast<size_t>(instr.rd), result.result); 
            break;
        }
        default:
            assert(false && "ExecuteUType: unhandled opcode");
    }
    return false; // indicate that the PC has not been updated
}

bool CPU::ExecuteBType(DecodedInstruction instr) {
    Word rs1 = ReadReg(static_cast<size_t>(instr.rs1));
    Word rs2 = ReadReg(static_cast<size_t>(instr.rs2));
    alu::AluOutput target_address = EffectiveAddress(pc_.value, instr.imm);
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
            assert(false && "ExecuteBType: unhandled opcode");  
    }

    if(take_branch) {
        if (target_address.result & 0x3) {
            throw std::runtime_error("Branch: misaligned target address");
        } else {
            pc_.value = target_address.result; // branch taken
        }
    }
    return take_branch; // return whether pc has been updated (branch taken) or not (branch not taken)   
}

} // namespace cpu


