# ============================================================
# String Length (strlen) - RV32IM test program
# Computes the length of a null-terminated ASCII string.
#
# Tests:
#   - .ascii / .asciz directive handling in your assembler
#   - lb (load byte, sign-extending) for byte-granular reads
#   - data-driven loop bound (unknown until null terminator hit)
#   - byte comparison against zero
#
# Register convention:
#   a0 = base address of string
#   t0 = current byte pointer (advances)
#   t1 = current byte value
#   a1 = result: string length
# ============================================================

    .data
msg:    .asciz  "Hello, RISC-V!"    # .asciz = null-terminated,

result: .word   0

    .text
    .globl _start

_start:
    la      a0, msg             # a0 = &msg[0]
    mv      t0, a0              # t0 = walking pointer, starts at string base
    li      a1, 0               # a1 = length counter = 0

strlen_loop:
    lb      t1, 0(t0)           # t1 = *t0  (sign-extended byte load)
    beq     t1, zero, strlen_done   # if *t0 == '\0', stop

    addi    a1, a1, 1           # length++
    addi    t0, t0, 1           # pointer++
    j       strlen_loop

strlen_done:
    la      t2, result
    sw      a1, 0(t2)           # store result: length = 14

    ebreak