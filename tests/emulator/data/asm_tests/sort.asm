# ============================================================
# Insertion Sort - RV32IM test program
# Sorts an array of 32-bit signed integers in ascending order.
#
# Register convention:
#   a0 = base address of array
#   a1 = number of elements (n)
#   t0 = i  (outer loop index, starts at 1)
#   t1 = j  (inner loop index)
#   t2 = key (element being inserted)
#   t3 = address of array[j]
#   t4 = value at array[j]
#   t5 = scratch
# ============================================================

    .data
array:  .word   5, 2, 9, 1, 5, 6, 3, 8, 7, 4
        .equ ARRAY_LEN, 10

    .text
    .globl _start

_start:
    la      a0, array           # a0 = &array[0]
    li      a1, 10              # a1 = n = 10

    li      t0, 1               # i = 1
outer_loop:
    bge     t0, a1, done        # if i >= n, exit outer loop

    slli    t5, t0, 2           # t5 = i * 4  (byte offset)
    add     t5, a0, t5          # t5 = &array[i]
    lw      t2, 0(t5)           # key = array[i]

    addi    t1, t0, -1          # j = i - 1

inner_loop:
    blt     t1, zero, insert    # if j < 0, insert key here

    slli    t5, t1, 2           # t5 = j * 4
    add     t3, a0, t5          # t3 = &array[j]
    lw      t4, 0(t3)           # t4 = array[j]

    ble     t4, t2, insert      # if array[j] <= key, stop shifting

    # shift array[j] to array[j+1]
    addi    t5, t1, 1           # t5 = j + 1
    slli    t5, t5, 2           # t5 = (j+1) * 4
    add     t5, a0, t5          # t5 = &array[j+1]
    sw      t4, 0(t5)           # array[j+1] = array[j]

    addi    t1, t1, -1          # j--
    j       inner_loop

insert:
    addi    t5, t1, 1           # t5 = j + 1
    slli    t5, t5, 2           # t5 = (j+1) * 4
    add     t5, a0, t5          # t5 = &array[j+1]
    sw      t2, 0(t5)           # array[j+1] = key

    addi    t0, t0, 1           # i++
    j       outer_loop

done:
    # Array is now sorted at 'array'. Halt.
    # (ecall/ebreak handling depends on your emulator's environment interface)
    ebreak