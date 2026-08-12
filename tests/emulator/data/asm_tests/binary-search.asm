# ============================================================
# Binary Search - RV32IM test program
# Searches sorted array for target = 23. Should find it at index 7.
#
#   a0 = base address of array
#   a1 = target value
#   t0 = lo
#   t1 = hi
#   t2 = mid
#   t3 = addr of array[mid]
#   t4 = array[mid]
#   a2 = result index (-1 if not found)
# ============================================================

    .data
array:  .word   1, 3, 5, 8, 12, 17, 19, 23, 29, 34   # 10 elements, sorted
result: .word   0

    .text
    .globl _start

_start:
    la      a0, array
    li      a1, 23              # target

    li      t0, 0               # lo = 0
    li      t1, 9               # hi = n - 1 = 9
    li      a2, -1              # result = -1 (not found, default)

search_loop:
    blt     t1, t0, search_done # if hi < lo, not found -> exit

    add     t2, t0, t1          # t2 = lo + hi
    srli    t2, t2, 1           # mid = (lo + hi) / 2  (unsigned shift, safe: no overflow here)

    slli    t3, t2, 2           # byte offset = mid * 4
    add     t3, a0, t3          # addr = &array[mid]
    lw      t4, 0(t3)           # t4 = array[mid]

    beq     t4, a1, found       # if array[mid] == target, done

    blt     t4, a1, go_right    # if array[mid] < target, search right half

    addi    t1, t2, -1          # hi = mid - 1
    j       search_loop

go_right:
    addi    t0, t2, 1           # lo = mid + 1
    j       search_loop

found:
    mv      a2, t2              # result = mid

search_done:
    la      t5, result
    sw      a2, 0(t5)           # store result index (7 if found, -1 if not)
    ebreak