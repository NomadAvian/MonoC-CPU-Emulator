export const DOCS_DATA = [
  {
    category: 'Instructions',
    items: [
      {
        title: 'addi rd, rs1, imm',
        desc: 'Adds the sign-extended 12-bit immediate to register rs1. Stores the result in rd.',
        example: 'addi x1, x2, 5    # x1 = x2 + 5'
      },
      {
        title: 'add rd, rs1, rs2',
        desc: 'Adds the values in registers rs1 and rs2. Stores the result in rd.',
        example: 'add x3, x1, x2    # x3 = x1 + x2'
      }
    ]
  },
  {
    category: 'Syscalls',
    items: [
      {
        title: '10 - Exit',
        desc: 'Terminates the program execution.',
        example: 'li a7, 10\necall             # exits program'
      }
    ]
  }
]
