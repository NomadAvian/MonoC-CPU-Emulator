export const DOCS_DATA = [
  {
    category: 'Registers',
    items: [
      {
        title: 'General-purpose registers (x0–x31)',
        desc: 'RISC-V has 32 integer registers (x0–x31), each 32 bits wide. x0 is hardwired to 0 (reads as zero, writes are ignored). The rest are general-purpose but follow a calling convention.',
        example: '# x0  = zero (always 0)\n# x1  = ra   (return address)\n# x2  = sp   (stack pointer)\n# x3  = gp   (global pointer)\n# x4  = tp   (thread pointer)\n# x5–7 = t0–2 (temporaries)\n# x8–9 = s0–1 (saved registers)\n# x10–11 = a0–1 (arguments/return values)\n# x12–17 = a2–7 (arguments)\n# x18–27 = s2–11 (saved registers)\n# x28–31 = t3–6 (temporaries)'
      },
      {
        title: 'Register naming (ABI names)',
        desc: 'Registers have conventional names per the RISC-V ABI. Use these names in code for readability (e.g., `a0` instead of `x10`). The assembler accepts both.',
        example: 'add a0, a1, a2    # same as: add x10, x11, x12\nmv sp, x2        # sp is x2'
      }
    ]
  },
  {
    category: 'Basic Syntax',
    items: [
      {
        title: 'Comments',
        desc: 'Comment lines start with a hash',
        example: '# this is a comment'
      }
    ]
  },
  {
    category: 'Memory Access',
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
    category: 'Loading Values',
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
        title: 'or rd, rs1, rs2',
        desc: 'Bitwise OR of rs1 and rs2. Stores the result in rd.',
        example: 'or x3, x1, x2     # x3 = x1 | x2'
      },
      {
        title: 'xor rd, rs1, rs2',
        desc: 'Bitwise XOR of rs1 and rs2. Stores the result in rd.',
        example: 'xor x3, x1, x2    # x3 = x1 ^ x2'
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
    category: 'Section Headers',
    items: [
      {
        title: 'Label definitions',
        desc: 'Labels mark memory addresses. Use them for jumps, branches, and data access. A label followed by a colon defines a code label.',
        example: 'loop:\n    addi x1, x1, 1\n    blt x1, x10, loop'
      },
      {
        title: 'Comments',
        desc: 'Comments start with # and extend to end of line. Use them to document your code.',
        example: '# This is a comment\nadd x1, x2, x3  # This is also a comment'
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
    category: 'Looping',
    items: [
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
    category: 'Syscalls',
    items: [
      {
        title: '10 - Exit',
        desc: 'Terminates the program execution.',
        example: 'li a7, 10\necall'
      },
      {
        title: 'ebreak - Exit',
        desc: 'Shorthand for the previous.',
        example: 'li a7, 10\nebreak'
      }
    ]
  }
]
