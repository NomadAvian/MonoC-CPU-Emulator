# ============================================================
# Register Population - RV32IM test program
# Loads a distinct, recognizable value into every GPR (x1-x31).
# Pattern: register N gets value (N * 0x1000 + N), easy to
# spot-check in a register dump (e.g. x5 -> 0x00005005).
#
# x0 is hardwired zero - not writable, skipped.
# Uses li (pseudo-op) throughout: tests your lui+addi expansion
# for values that don't fit in a 12-bit immediate.
# ============================================================

    .text
    .globl _start

_start:
    li      ra,   0x1001     # x1
    li      sp,   0x2002     # x2
    li      gp,   0x3003     # x3
    li      tp,   0x4004     # x4
    li      t0,   0x5005     # x5
    li      t1,   0x6006     # x6
    li      t2,   0x7007     # x7
    li      s0,   0x8008     # x8
    li      s1,   0x9009     # x9
    li      a0,   0xA00A     # x10
    li      a1,   0xB00B     # x11
    li      a2,   0xC00C     # x12
    li      a3,   0xD00D     # x13
    li      a4,   0xE00E     # x14
    li      a5,   0xF00F     # x15
    li      a6,   0x10010    # x16
    li      a7,   0x11011    # x17
    li      s2,   0x12012    # x18
    li      s3,   0x13013    # x19
    li      s4,   0x14014    # x20
    li      s5,   0x15015    # x21
    li      s6,   0x16016    # x22
    li      s7,   0x17017    # x23
    li      s8,   0x18018    # x24
    li      s9,   0x19019    # x25
    li      s10,  0x1A01A    # x26
    li      s11,  0x1B01B    # x27
    li      t3,   0x1C01C    # x28
    li      t4,   0x1D01D    # x29
    li      t5,   0x1E01E    # x30
    li      t6,   0x1F01F    # x31

    ebreak