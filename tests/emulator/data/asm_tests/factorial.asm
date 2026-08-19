# ============================================================
# Factorial (iterative) - RV32IM test program
# Computes 13! iteratively. 13! = 6,227,020,800 which overflows
# 32-bit unsigned (wraps). Tests mul + intentional overflow.
#
#   a0 = n (input)
#   t0 = result (accumulator)
#   t1 = loop counter i
# ============================================================

    .data
result: .word   0

    .text
    .globl _start

_start:
    li      a0, 10              # n = 10

    li      t0, 1               # result = 1
    li      t1, 1               # i = 1

fact_loop:
    bgt     t1, a0, fact_done   # if i > n, done
    mul     t0, t0, t1          # result *= i
    addi    t1, t1, 1           # i++
    j       fact_loop

fact_done:
    la      t2, result
    sw      t0, 0(t2)           # store result (wrapped 32-bit value)
    ebreak