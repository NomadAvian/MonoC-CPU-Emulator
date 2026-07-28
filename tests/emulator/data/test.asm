# RISC-V Assembly Test File (RV32IM)
.section .text
.globl main

main:
    # Initialize registers using integer constants (decimal, hex, binary, negative)
    addi    x1, x0, 10           # Canonical register names
    addi    t0, zero, -42        # Signed decimal constant and ABI register names
    lui     a0, 0x12345          # Hexadecimal literal
    addi    t1, zero, 0b101010   # Binary literal (42)

    # Arithmetic & Logic (RV32I)
    add     s0, a0, t0
    sub     s1, s0, t1
    slli    t2, t1, 2
    andi    t3, t2, 0xFF

    # Multiplication & Division (RV32M Extension)
    mul     t4, s0, s1
    div     t5, t4, t0
    rem     t6, t4, t0

    # Memory Load/Store with offsets
    lw      t0, 0(sp)
    sw      t0, 4(sp)

    # Branch and Call
    beq     t0, zero, done
    jal     ra, compute_sum

done:
    ebreak

compute_sum:
    ret

.section .rodata
msg:
    .asciz  "Hello, RISC-V World!\n"
    .word   100, 200, 300