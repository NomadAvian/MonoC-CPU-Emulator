// RISC-V assembly reference — ISA syntax, instructions and programming patterns.
// UI-facing MonoC features live in monocDocs.js.

export const ASM_DOCS = [
  {
    category: 'Introduction',
    items: [
      {
        title: 'What is RISC-V',
        desc: 'RISC-V (pronounced "risk five") is an open, free instruction set architecture (ISA) designed for simplicity and modularity. Unlike x86 or ARM, RISC-V has no proprietary licensing, anyone can build hardware or software around it. The ISA is modular: a minimal base set (RV32I for 32-bit, RV64I for 64-bit) can be extended with optional modules (M for multiply/divide, F/D for floating-point, etc.).\nThis emulator implements RV32I + M, a powerful subset for education and embedded systems that can be a target for programming languages and operating systems.',
        example: ''
      },
      {
        title: 'Endianness',
        desc: 'All registers and memory words are 32 bits. Memory is byte-addressable and little-endian: the least significant byte is stored at the lowest address.',
        example: ''
      }
    ]
  },
  {
    category: 'Registers',
    items: [
      {
        title: 'General-purpose registers (x0–x31)',
        desc: 'RISC-V has 32 integer registers (x0–x31), each 32 bits wide. x0 is hardwired to 0 (reads as zero, writes are ignored). The rest are general-purpose but follow a calling convention.',
        example: '# x0  = zero     (always 0)\n# x1  = ra       (return address)\n# x2  = sp       (stack pointer)\n# x3  = gp       (global pointer)\n# x4  = tp       (thread pointer)\n# x5–7 = t0–2    (temporaries)\n# x8–9 = s0–1    (saved registers)\n# x10–11 = a0–1  (arguments/return values)\n# x12–17 = a2–7  (arguments)\n# x18–27 = s2–11 (saved registers)\n# x28–31 = t3–6  (temporaries)'
      },
      {
        title: 'Register naming (ABI names)',
        desc: 'Registers have conventional names per the RISC-V ABI. Use these names in code for readability (e.g., `a0` instead of `x10`). The assembler accepts both.',
        example: 'add a0, a1, a2    # same as: add x10, x11, x12\nmv sp, x2         # sp is x2'
      }
    ]
  },
  {
    category: 'Basic Syntax',
    items: [
      {
        title: 'Comments',
        desc: 'Comment lines start with a hash.',
        example: '# continues until the end of this line'
      },
      {
        title: 'Labels',
        desc: 'Labels mark memory addresses. Use them for jumps, branches, and data access. A label followed by a colon defines a code label.',
        example: 'loop:\n    addi x1, x1, 1\n    blt x1, x10, loop'
      },
      {
        title: 'Value formats',
        desc: 'Immediates can be written in decimal (42), hexadecimal (0xFF), or as labels for the assembler to resolve. For large constants that don\'t fit in 12 bits, use lui (load upper immediate) followed by addi, or use the li pseudo-instruction which expands automatically.',
        example: 'li   x1, 42               # decimal\nli   x2, 0xFF             # hex\nla   x3, my_label         # label address (resolved by assembler)\nlui  x4, 0x12345          # load upper 20 bits, lower 12 bits = 0'
      },
    ]
  },
  {
    category: 'Loading Values To Registers',
    items: [
      {
        title: 'li rd, imm',
        desc: 'Load immediate - loads a 32-bit immediate value into register rd. This is a pseudo-instruction that expands to one or more actual instructions.',
        example: 'li x1, 42         # x1 = 42\nli x2, 0xFF       # x2 = 255'
      },
      {
        title: 'lui rd, imm',
        desc: 'Load upper immediate - loads a 20-bit immediate into the upper 20 bits of rd, zeroing the lower 12 bits. Used for loading large constants.',
        example: 'lui x1, 0xABCDE   # x1 = 0xABCDE000'
      },
      {
        title: 'la rd, label',
        desc: 'Load address - loads the address of a label into rd. Used to get addresses of data or code labels.',
        example: 'la x1, my_data    # x1 = address of my_data'
      }
    ]
  },
  {
    category: 'Accessing Memory',
    items: [
      {
        title: 'lw rd, offset(rs1)',
        desc: 'Load word - loads a 32-bit value from memory at address rs1 + offset into rd. Offset is a signed 12-bit immediate.',
        example: 'lw x1, 0(x2)      # load word from address in x2\nlw x3, 8(sp)      # load from stack offset 8'
      },
      {
        title: 'sw rs2, offset(rs1)',
        desc: 'Store word - stores the 32-bit value from rs2 into memory at address rs1 + offset.',
        example: 'sw x1, 0(x2)      # store x1 to address in x2\nsw ra, -4(sp)     # save ra on stack'
      },
      {
        title: 'lb / lbu / lh / lhu',
        desc: 'Load byte/halfword (8/16 bits): lb/lh sign-extend, lbu/lhu zero-extend. Use for smaller data types.',
        example: 'lb x1, 0(x2)      # load signed byte\nlbu x1, 0(x2)     # load unsigned byte\nlh x1, 0(x2)      # load signed halfword\nlhu x1, 0(x2)     # load unsigned halfword'
      },
      {
        title: 'sb / sh',
        desc: 'Store byte/halfword - stores lower 8/16 bits of rs2 to memory.',
        example: 'sb x1, 0(x2)      # store byte\nsh x1, 0(x2)      # store halfword'
      },
      {
        title: 'Memory addressing pattern',
        desc: 'Common pattern: use a base register (often sp, gp, or a pointer in a temporary) plus an offset. For large offsets, use lui/addi to construct the address first.',
        example: '# Access global variable\nlui x1, %hi(my_var)\naddi x1, x1, %lo(my_var)\nlw x2, 0(x1)\n\n# Stack allocation\naddi sp, sp, -16\nsw ra, 12(sp)\nsw s0, 8(sp)'
      }
    ]
  },
  {
    category: 'Basic Operations',
    items: [
      {
        title: 'add rd, rs1, rs2',
        desc: 'Adds the values in registers rs1 and rs2. Stores the result in rd.',
        example: 'add x3, x1, x2    # x3 = x1 + x2'
      },
      {
        title: 'addi rd, rs1, imm',
        desc: 'Adds the sign-extended 12-bit immediate to register rs1. Stores the result in rd.',
        example: 'addi x1, x2, 5    # x1 = x2 + 5'
      },
      {
        title: 'sub rd, rs1, rs2',
        desc: 'Subtracts rs2 from rs1. Stores the result in rd.',
        example: 'sub x3, x1, x2    # x3 = x1 - x2'
      },
      {
        title: 'and rd, rs1, rs2',
        desc: 'Bitwise AND of rs1 and rs2. Stores the result in rd.',
        example: 'and x3, x1, x2    # x3 = x1 & x2'
      },
      {
        title: 'or / ori rd, rs1, rs2',
        desc: 'Bitwise OR of rs1 and rs2. Stores the result in rd. Use ori for immediate values',
        example: 'or x3, x1, x2     # x3 = x1 | x2\nori  x1, x2, 0xFF       # x1 = x2 | 0xFF'
      },
      {
        title: 'xor /xori rd, rs1, rs2',
        desc: 'Bitwise XOR of rs1 and rs2. Stores the result in rd. Use xori for immediate values',
        example: 'xor x3, x1, x2    # x3 = x1 ^ x2\nxori x1, x2, -1         # x1 = x2 ^ 0xFFFFFFFF  (bitwise NOT)'
      },
      {
        title: 'mul rd, rs1, rs2',
        desc: 'M extension. Multiplies rs1 by rs2 (32x32-bit) and stores the lower 32 bits of the product in rd. Same result bits regardless of signedness \u2014 low bits of a two\u2019s-complement product don\u2019t depend on interpretation.',
        example: 'mul x3, x1, x2    # x3 = (x1 * x2) & 0xFFFFFFFF'
      },
      {
        title: 'mulh / mulhu / mulhsu rd, rs1, rs2',
        desc: 'M extension. Compute the same 32x32-bit multiply as mul but return the upper 32 bits of the full 64-bit product. mulh treats both operands as signed, mulhu treats both as unsigned, mulhsu treats rs1 as signed and rs2 as unsigned. To get a full 64-bit result, the spec\u2019s recommended sequence is mulh[u|su] rdh, rs1, rs2 followed by mul rdl, rs1, rs2 (rdh must differ from rs1/rs2).',
        example: 'mulh   x3, x1, x2  # x3 = upper32(signed(x1)   * signed(x2))\nmulhu  x3, x1, x2  # x3 = upper32(unsigned(x1) * unsigned(x2))\nmulhsu x3, x1, x2  # x3 = upper32(signed(x1)   * unsigned(x2))'
      },
      {
        title: 'div / divu rd, rs1, rs2',
        desc: 'M extension. Signed (div) or unsigned (divu) integer division of rs1 by rs2, rounding toward zero. Per the spec, division by zero returns all bits set (rd = -1 for div, rd = 0xFFFFFFFF for divu) rather than trapping. Signed overflow (INT32_MIN / -1) returns the dividend unchanged.',
        example: 'div  x3, x1, x2   # x3 = x1 / x2 (signed, round toward zero)\ndivu x3, x1, x2   # x3 = x1 / x2 (unsigned)'
      },
      {
        title: 'rem / remu rd, rs1, rs2',
        desc: 'M extension. Remainder of the corresponding div/divu operation, satisfying (rs1 / rs2) * rs2 + (rs1 % rs2) == rs1 outside overflow. The sign of a nonzero rem result matches the sign of the dividend. Division by zero returns the dividend unchanged (rd = rs1); signed overflow (INT32_MIN % -1) returns 0.',
        example: 'rem  x3, x1, x2   # x3 = x1 % x2 (signed)\nremu x3, x1, x2   # x3 = x1 % x2 (unsigned)'
      }
    ]
  },
  {
    category: '.data Section',
    items: [
      {
        title: '.data directive',
        desc: 'Defines the data section where static variables and initialized data are stored. All variables defined here are allocated at assembly time.',
        example: '.data\nmy_var: .word 42\nmy_str: .asciiz "Hello"\nmy_arr: .word 1, 2, 3, 4, 5'
      },
      {
        title: 'Data directives',
        desc: 'Common directives for defining data: .word (32-bit int), .half (16-bit), .byte (8-bit), .asciiz (null-terminated string), .ascii (string), .float, .double, .space (uninitialized bytes).',
        example: '.data\ncount:  .word 10\nname:   .asciiz "RISC-V"\nbuffer: .space 64'
      }
    ]
  },
  {
    category: '.text Section',
    items: [
      {
        title: '.text directive',
        desc: 'Defines the text (code) section where executable instructions are placed. The program starts executing at the first instruction after .text.',
        example: '.text\nmain:\n    li a0, 42\n    li a7, 10\n    ecall'
      },
      {
        title: '.globl directive',
        desc: 'Makes a label globally visible so the linker can find it. Required for the main entry point.',
        example: '.globl main\n.text\nmain:\n    # program code here'
      }
    ]
  },
  {
    category: 'Jump Instructions',
    items: [
      {
        title: 'j label',
        desc: 'Unconditional jump to label. Sets PC to the target address.',
        example: 'j loop    # jump to loop label'
      },
      {
        title: 'jal rd, label',
        desc: 'Jump and link - jumps to label and stores return address (PC+4) in rd. Used for function calls.',
        example: 'jal ra, my_func  # call my_func, return addr in ra'
      },
      {
        title: 'jalr rd, rs1, imm',
        desc: 'Jump and link register - jumps to address in rs1 + imm, stores return address in rd. Used for indirect calls and returns.',
        example: 'jalr ra, x1, 0   # jump to address in x1'
      }
    ]
  },
  {
    category: 'Control Flow',
    items: [
      {
        title: 'slt / slti / sltu / sltiu',
        desc: 'Set less than: compares two registers (or register and immediate) and sets rd to 1 if the first operand is less than the second, 0 otherwise. slt/slti are signed comparison; sltu/sltiu are unsigned. Useful for building custom conditionals.',
        example: 'slt  x1, x2, x3         # x1 = (x2 < x3) ? 1 : 0  (signed)\nslti x1, x2, 10         # x1 = (x2 < 10) ? 1 : 0  (signed)\nsltu x1, x2, x3         # x1 = (x2 < x3) ? 1 : 0  (unsigned)'
      },
      {
        title: 'If-else pattern',
        desc: 'To conditionally execute one of two code paths: branch over the first path if the condition is false, execute it, then jump over the second path. Alternatively, branch to the second path if the condition is true.',
        example: '# if (x1 == 0) { x2 = 1 } else { x2 = 2 }\n    bne  x1, zero, else_path  # if x1 != 0, skip to else\n    li   x2, 1                 # x1 == 0: set x2 = 1\n    j    if_end                # jump to end\nelse_path:\n    li   x2, 2                 # x1 != 0: set x2 = 2\nif_end:\n    # continue after if-else'
      },
      {
        title: 'Conditional branches',
        desc: 'Branch instructions compare registers and jump if condition is true: beq (equal), bne (not equal), blt (less than), bge (greater or equal), bltu, bgeu (unsigned variants).',
        example: 'loop:\n    addi x1, x1, 1\n    blt x1, x10, loop  # if x1 < x10, jump to loop'
      },
      {
        title: 'Loop counter pattern',
        desc: 'Common pattern: initialize counter, check condition at top/bottom, increment/decrement, branch back.',
        example: '# Count from 0 to 9\nli x1, 0       # counter\nli x10, 10     # limit\nloop:\n    # loop body\n    addi x1, x1, 1\n    blt x1, x10, loop'
      },
      {
        title: 'Loop with array access',
        desc: 'Use a pointer register to iterate through array elements. Increment pointer by 4 (word size) each iteration.',
        example: '.data\narr: .word 1, 2, 3, 4, 5\n.text\nla x1, arr     # load array address\nli x2, 5       # length\nloop:\n    lw x3, 0(x1) # load element\n    addi x1, x1, 4\n    addi x2, x2, -1\n    bnez x2, loop'
      }
    ]
  },

  {
    category: 'Other Keywords',
    items: [
      {
        title: 'Shift instructions: sll / srl / sra / slli / srli / srai',
        desc: 'Shift left logical (sll/slli), shift right logical (srl/srli), and shift right arithmetic (sra/srai). Register versions (sll, srl, sra) use the low 5 bits of rs2 as the shift amount; immediate versions (slli, srli, srai) use a 5-bit immediate. sra and srai preserve the sign bit when shifting right; srl and srli zero-fill.',
        example: 'slli x1, x2, 3          # x1 = x2 << 3\nsrli x1, x2, 2          # x1 = x2 >> 2  (logical, zero-fill)\nsrai x1, x2, 2          # x1 = x2 >> 2  (arithmetic, sign-extend)\nsll  x1, x2, x3         # x1 = x2 << (x3 & 0x1F)'
      },
      {
        title: 'auipc',
        desc: 'Add upper immediate to PC: loads a 20-bit immediate into the upper 20 bits, zeros the lower 12, and adds the result to the current program counter. Primarily used for position-independent code and PC-relative addressing in linker-heavy scenarios; rarely needed in hand-written assembly.',
        example: 'auipc x1, 0             # x1 = PC + 0  (no-op in most cases)'
      }
    ]
    },
  {
    category: 'Syscalls',
    items: [
      {
        title: 'ecall convention (RARS-style)',
        desc: 'a7 selects the syscall (see the ecall enum). Arguments are passed in a0 (and a1 where noted); results, if any, are returned in a0. This mirrors the Venus/RARS/SPIM convention.',
        example: 'li a7, <syscall_number>\n# set up a0 / a1 as needed\necall'
      },
      {
        title: 'Print Integer (1)',
        desc: 'Prints the value in a0 as a signed 32-bit decimal integer.',
        example: 'li a0, -42\nli a7, 1\necall'
      },
      {
        title: 'Print String (4)',
        desc: 'Prints the null-terminated string at the address in a0. Scanning is capped at 4096 bytes; a string without a terminator within that range will be truncated rather than reading past it.',
        example: 'la a0, my_str\nli a7, 4\necall'
      },
      {
        title: 'Print Char (11)',
        desc: 'Prints the low byte of a0 as a single character.',
        example: "li a0, 'A'\nli a7, 11\necall"
      },
      {
        title: 'Read Integer (5)',
        desc: 'Reads a line of input and parses it as a decimal integer into a0. If no input line is available yet, the CPU enters kWaiting state instead of blocking; the ecall re-executes once input arrives (the instruction does not advance past ecall until it succeeds). With no IO handler attached, a0 is set to 0.',
        example: 'li a7, 5\necall\n# a0 = parsed integer'
      },
      {
        title: 'Read String (8)',
        desc: 'Reads a line into the buffer at a0, writing at most a1-1 bytes and always NUL-terminating (fgets-style). a1 must be nonzero. Blocks (kWaiting) if no input line is available yet.',
        example: 'la a0, buffer\nli a1, 64        # buffer size\nli a7, 8\necall'
      },
      {
        title: 'Read Char (12)',
        desc: 'Reads a single byte of input into a0, zero-extended. Blocks (kWaiting) if no input is available yet. With no IO handler attached, a0 is set to 0.',
        example: 'li a7, 12\necall\n# a0 = character read'
      },
      {
        title: 'Exit (10) / Exit (93)',
        desc: 'Terminates the program: sets CPU state to kHalted. Two syscall numbers both map to the same behavior. Exit2 signals exiting with error.',
        example: 'li a7, 10\necall'
      },
      {
        title: 'ebreak',
        desc: 'Note: unlike some educational simulators (e.g. RARS), ebreak in this emulator is not currently wired to the same halt path as the exit ecalls in the code shown \u2014 only kExit / kExit2 set kHalted. Confirm this is the intended behavior before documenting ebreak as an exit alias.',
        example: 'ebreak'
      },
      {
        title: 'Unknown ecall codes',
        desc: 'An unrecognized value in a7 falls through the default case silently (the error log is currently commented out) \u2014 execution continues with no visible effect. Worth flagging in docs since it can mask a wrong syscall number during debugging.',
        example: 'li a7, 9999   # not a defined ecall \u2014 no-op, no error reported\necall'
      }
    ]
  },
]
