# ============================================================
# Recursive Fibonacci - RV32IM test program
# Computes fib(30) recursively.
#
# Calling convention (standard RISC-V):
#   a0      = argument n / return value
#   ra      = return address
#   sp      = stack pointer (grows downward)
#   s0, s1  = callee-saved, used to hold n and fib(n-1) across
#             the second recursive call
#
# Stack frame per call (16 bytes, keeps sp 16-byte aligned):
#   sp+12 : ra
#   sp+8  : s0  (saved n)
#   sp+4  : s1  (saved fib(n-1) result)
#   sp+0  : (padding)
# ============================================================

    .data
result: .word   0

    .text
    .globl _start

_start:
    li      a0, 30              # a0 = n = 30
    jal     ra, fib             # call fib(30)

    la      t0, result
    sw      a0, 0(t0)           # store result

    ebreak                      # halt

# ------------------------------------------------------------
# fib(n): a0 = n on entry, a0 = fib(n) on return
# ------------------------------------------------------------
fib:
    addi    sp, sp, -16         # allocate stack frame
    sw      ra, 12(sp)          # save return address
    sw      s0, 8(sp)           # save s0 (caller's, callee-saved)
    sw      s1, 4(sp)           # save s1 (caller's, callee-saved)

    li      t0, 1
    ble     a0, t0, base_case   # if n <= 1, return n directly

    mv      s0, a0              # s0 = n  (preserve across calls)

    addi    a0, s0, -1          # a0 = n - 1
    jal     ra, fib             # a0 = fib(n-1)
    mv      s1, a0              # s1 = fib(n-1)

    addi    a0, s0, -2          # a0 = n - 2
    jal     ra, fib             # a0 = fib(n-2)

    add     a0, a0, s1          # a0 = fib(n-1) + fib(n-2)
    j       fib_return

base_case:
    # a0 already holds n (0 or 1), which is fib(n) by definition
    j       fib_return

fib_return:
    lw      ra, 12(sp)          # restore return address
    lw      s0, 8(sp)           # restore s0
    lw      s1, 4(sp)           # restore s1
    addi    sp, sp, 16          # deallocate stack frame
    jalr    zero, ra, 0         # return (ret pseudo-op)