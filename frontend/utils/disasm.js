// disasm.js — RV32I(+M) word disassembler for the Disassembler panel.

const REGS = [
  'zero', 'ra', 'sp', 'gp', 'tp', 't0', 't1', 't2',
  's0', 's1', 'a0', 'a1', 'a2', 'a3', 'a4', 'a5',
  'a6', 'a7', 's2', 's3', 's4', 's5', 's6', 's7',
  's8', 's9', 's10', 's11', 't3', 't4', 't5', 't6',
]

const reg = (n) => REGS[n & 0x1F]
const hex = (v) => `0x${(v >>> 0).toString(16).padStart(8, '0')}`

const R_OPS = {
  0x00: { 0x00: 'add', 0x01: 'mul', 0x20: 'sub' },
  0x01: { 0x00: 'sll', 0x01: 'mulh' },
  0x02: { 0x00: 'slt', 0x01: 'mulhsu' },
  0x03: { 0x00: 'sltu', 0x01: 'mulhu' },
  0x04: { 0x00: 'xor' },
  0x05: { 0x00: 'srl', 0x01: 'divu', 0x20: 'sra' },
  0x06: { 0x00: 'or', 0x01: 'rem' },
  0x07: { 0x00: 'and', 0x01: 'remu' },
}

const I_ARITH_OPS = {
  0x0: 'addi', 0x2: 'slti', 0x3: 'sltiu',
  0x4: 'xori', 0x6: 'ori', 0x7: 'andi',
}

const LOAD_OPS = { 0x0: 'lb', 0x1: 'lh', 0x2: 'lw', 0x4: 'lbu', 0x5: 'lhu' }
const STORE_OPS = { 0x0: 'sb', 0x1: 'sh', 0x2: 'sw' }
const BRANCH_OPS = { 0x0: 'beq', 0x1: 'bne', 0x4: 'blt', 0x5: 'bge', 0x6: 'bltu', 0x7: 'bgeu' }

// sign-extend an n-bit field held in `v`
function sext(v, bits) {
  const shift = 32 - bits
  return (v << shift) >> shift
}

function decode(word) {
  const opcode = word & 0x7F
  const rd = (word >>> 7) & 0x1F
  const f3 = (word >>> 12) & 0x7
  const rs1 = (word >>> 15) & 0x1F
  const rs2 = (word >>> 20) & 0x1F
  const f7 = (word >>> 25) & 0x7F

  const iImm = () => sext(word >>> 20, 12)
  const sImm = () => sext(((word >>> 25) << 5) | ((word >>> 7) & 0x1F), 12)
  const bImm = () =>
    sext(
      ((word >>> 31) << 12) | (((word >>> 7) & 0x1) << 11) |
      (((word >>> 25) & 0x3F) << 5) | (((word >>> 8) & 0xF) << 1),
      13
    )
  const uImm = () => word & 0xFFFFF000
  const jImm = () =>
    sext(
      ((word >>> 31) << 20) | (((word >>> 12) & 0xFF) << 12) |
      (((word >>> 20) & 0x1) << 11) | (((word >>> 21) & 0x3FF) << 1),
      21
    )

  switch (opcode) {
    case 0x33: {
      // R-type (funct7=1 selects the M extension)
      const mnem = R_OPS[f3]?.[f7]
      if (!mnem) break
      return `${mnem} ${reg(rd)}, ${reg(rs1)}, ${reg(rs2)}`
    }

    case 0x13: {
      if (f3 === 0x1) return `slli ${reg(rd)}, ${reg(rs1)}, ${rs2}`
      if (f3 === 0x5) return `${f7 & 0x20 ? 'srai' : 'srli'} ${reg(rd)}, ${reg(rs1)}, ${rs2}`
      const mnem = I_ARITH_OPS[f3]
      if (mnem) return `${mnem} ${reg(rd)}, ${reg(rs1)}, ${iImm()}`
      break
    }

    case 0x03: {
      const mnem = LOAD_OPS[f3]
      if (mnem) return `${mnem} ${reg(rd)}, ${iImm()}(${reg(rs1)})`
      break
    }

    case 0x23: {
      const mnem = STORE_OPS[f3]
      if (mnem) return `${mnem} ${reg(rs2)}, ${sImm()}(${reg(rs1)})`
      break
    }

    case 0x63: {
      const mnem = BRANCH_OPS[f3]
      if (mnem) return { branch: `${mnem} ${reg(rs1)}, ${reg(rs2)}`, offset: bImm() }
      break
    }

    case 0x37:
      return `lui ${reg(rd)}, ${(uImm() >>> 12).toString(16)}`

    case 0x17:
      return `auipc ${reg(rd)}, ${(uImm() >>> 12).toString(16)}`

    case 0x6F:
      return { branch: `jal ${reg(rd)}`, offset: jImm() }

    case 0x67:
      return `jalr ${reg(rd)}, ${iImm()}(${reg(rs1)})`

    case 0x73:
      return iImm() === 1 ? 'ebreak' : 'ecall'

    case 0x0F:
      return 'fence'
  }
  return null
}

export function disassembleWords(words, entry) {
  const dataEnd = Math.floor(entry / 4)

  return words.map((raw, i) => {
    const word = raw >>> 0
    const address = i * 4

    if (i < dataEnd) {
      return { address, hex: hex(word), text: `.word ${hex(word)}` }
    }

    const decoded = decode(word)
    if (decoded === null) {
      return { address, hex: hex(word), text: `.word ${hex(word)}` }
    }
    // branches/jal resolve to absolute targets so they match the Address column
    if (typeof decoded === 'object') {
      return { address, hex: hex(word), text: `${decoded.branch}, ${hex(address + decoded.offset)}` }
    }
    return { address, hex: hex(word), text: decoded }
  })
}
