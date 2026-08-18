    .text
    .globl _start
_start:
    li   a0, 0x07FFD000    # framebuffer base
    li   t0, 3072          # 12288 bytes / 4 = number of words
    li   t1, 0xFFFFFFFF    # all four bytes nonzero = all white
loop:
    sw   t1, 0(a0)
    addi a0, a0, 4
    addi t0, t0, -1
    bne  t0, x0, loop
    ebreaka