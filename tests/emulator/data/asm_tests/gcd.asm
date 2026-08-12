# ============================================================
# GCD (Euclidean algorithm) - RV32IM test program
# Computes gcd(1071, 462) = 21
#
#   a0 = a
#   a1 = b
#   t0 = temp (a % b)
# ============================================================

    .data
result: .word   0

    .text
    .globl _start

_start:
    li      a0, 1071            # a = 1071
    li      a1, 462             # b = 462

gcd_loop:
    beq     a1, zero, gcd_done  # if b == 0, a is the answer

    rem     t0, a0, a1          # t0 = a % b
    mv      a0, a1              # a = b
    mv      a1, t0              # b = t0
    j       gcd_loop

gcd_done:
    la      t1, result
    sw      a0, 0(t1)           # store gcd = 21
    ebreak