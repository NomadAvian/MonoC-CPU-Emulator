#include "cpu.h"

namespace cpu {

    int32_t CPU::SignExtend(uint32_t value, uint32_t bits) const {
        uint32_t shift = 32 - bits;
        return static_cast<int32_t>(value << shift) >> shift;
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
        instr.rs1 = (instruction >> 15) & 0x1F; // extract rs1 (5 bits) [19:15]
        instr.rs2 = (instruction >> 20) & 0x1F; // extract rs2 (5 bits) [24:20]
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
        instr.rs1 = (instruction >> 15) & 0x1F; // extract rs1 (5 bits) [19:15]
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
        instr.rs1 = (instruction >> 15) & 0x1F; // extract rs1 (5 bits) [19:15]
        instr.rs2 = (instruction >> 20) & 0x1F; // extract rs2 (5 bits) [24:20]
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
        instr.rs1 = (instruction >> 15) & 0x1F; // extract rs1 (5 bits) [19:15]
        instr.rs2 = (instruction >> 20) & 0x1F; // extract rs2 (5 bits) [24:20]
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
        if (index < 0 || index > 31)
            return 0;
        return x[index].value;
    }

} // namespace cpu


