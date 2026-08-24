export const EXAMPLES_DATA = [
  {
    id: "basic/add-two-integers",
    category: "Basic",
    title: "Add two integers",
    description: "Reads two integers from input and prints their sum",
    source: `.data
    prompt1: .asciiz "Enter first integer:\\n"
    prompt2: .asciiz "Enter second integer:\\n"
    res_msg: .asciiz "The sum is:\\n"

.text
main:
    li      a7, 4
    la      a0, prompt1
    ecall
    li      a7, 5
    ecall
    add     s0, a0, zero        # s0 = first number

    li      a7, 4
    la      a0, prompt2
    ecall
    li      a7, 5
    ecall
    add     s1, a0, zero        # s1 = second number

    add     s2, s0, s1          # s2 = sum

    li      a7, 4
    la      a0, res_msg
    ecall

    li      a7, 1
    add     a0, s2, zero
    ecall

    li      a7, 10
    ecall`
  },
  {
    id: "basic/even-odd-check",
    category: "Basic",
    title: "Even or odd check",
    description: "Checks whether an input integer is even or odd via its parity bit",
    source: `.data
    prompt:     .asciiz "Please enter an integer.\\n"
    even_msg:   .asciiz "The value is even.\\n"
    odd_msg:    .asciiz "The value is odd.\\n"

.text
main:
    li      a7, 4               # a7 = 4  -> select "print string" syscall
    la      a0, prompt          # a0 = address of prompt string (syscall arg)
    ecall                       # print the string at a0

    li      a7, 5               # a7 = 5  -> select "read int" syscall
    ecall                       # read an int from input, returned in a0
    add     s0, a0, zero        # s0 = input value

    andi    t0, s0, 1           # t0 = s0 & 1  (isolate parity bit)
    bne     t0, zero, is_odd    # if t0 != 0, LSB was 1 -> branch to is_odd

is_even:
    li      a7, 4               # a7 = 4  -> select "print string" syscall
    la      a0, even_msg        # a0 = address of "even" message
    ecall                       # print it
    j       done                # skip over is_odd, jump straight to done

is_odd:
    li      a7, 4               # a7 = 4  -> select "print string" syscall
    la      a0, odd_msg         # a0 = address of "odd" message
    ecall                       # print it
                                # (falls through into done, no jump needed)

done:
    li      a7, 10              # a7 = 10 -> select "exit" syscall
    ecall                       # terminate the program`
  },
  {
    id: "basic/string-input-output",
    category: "Basic",
    title: "String input and output",
    description: "Reads a line into a RAM buffer and echoes it back",
    source: `.data
prompt: .asciz "Enter a string: "
reply:  .asciz "You typed: "

.text
    li   a7, 4          # print prompt
    la   a0, prompt
    ecall

    li   a7, 8          # readstring: a0 = buffer, a1 = max length
    li   a0, 0x1000     # scratch buffer in free RAM (unified memory)
    li   a1, 64         # stores up to 63 chars + NUL terminator
    ecall               # suspends until you submit a line

    li   a7, 4          # print prefix
    la   a0, reply
    ecall

    li   a7, 4          # echo what was typed
    li   a0, 0x1000
    ecall

    li   a7, 10         # exit
    ecall`
  },
  {
    id: "basic/string-length",
    category: "Basic",
    title: "String Length",
    description: "Output the length of an inputted string with the null terminator",
    source: `# String length (strlen)
# Reads a string from stdin into a scratch buffer, then computes its
# length by walking the buffer byte-by-byte until the null terminator
.global _start
.data
    prompt_: .asciiz "enter a string: "
    res_msg: .asciiz "the length of the entered string is: "
.text
_start:
    li   a7, 4                  # write string ecall
    la   a0, prompt_            # load user prompt
    ecall
    li   a7, 8                  # read string syscall (adjust to your actual ecall enum)
    li   a0, 0x1000             # scratch buffer address, hardcoded into unused RAM
    li   a1, 64                 # max bytes to read (63 chars + NUL terminator)
    ecall

    li   t0, 0x1000             # t0 = pointer, starts at buffer[0]
    li   s0, 0                  # s0 = length counter

strlen_loop:
    lbu  t1, 0(t0)               # t1 = current byte (zero-extended)
    beq  t1, zero, strlen_done   # if byte == 0, end of string -> stop

    addi t0, t0, 1               # pointer++
    addi s0, s0, 1               # length++
    j    strlen_loop

strlen_done:
    li   a7, 4
    li   a0, res_msg
    ecall
    mv   a0, s0
    li   a7, 1                   # print int syscall (adjust to your actual ecall enum)
    ecall

    li   a7, 10
    ecall`
  },
  {
    id: "intermediate/array-maximum",
    category: "Intermediate",
    title: "Array maximum",
    description: "Scans a hardcoded array with a loop and prints the largest value",
    source: `.data
    array:      .word   3, 17, 9, 42, 8, 23, 4    # 7 hardcoded words, contiguous in memory
    arr_len:    .word   7                          # number of elements in array
    result_msg: .asciiz "The maximum value is:\\n"

.text
main:
    la      t0, array           # t0 = base address of array (pointer, not data)
    la      t3, arr_len         # t3 = address of arr_len
    lw      t1, 0(t3)           # t1 = *t3 = 7 (dereference to get the actual count)
    lw      s0, 0(t0)           # s0 = array[0], seed running max with first element
    li      t2, 1               # t2 = loop index i, start at 1 (index 0 already consumed)

while_loop:
    bge     t2, t1, loop_end    # while (i < len): if i >= len, branch out of loop
    slli    t4, t2, 2           # t4 = i * 4  (word index -> byte offset)
    add     t5, t0, t4          # t5 = &array[i]  (base + byte offset)
    lw      t6, 0(t5)           # t6 = array[i]  (dereference to get the value)
    ble     t6, s0, skip_update # if array[i] <= max, skip the update
    add     s0, t6, zero        # max = array[i]  (new max found)

skip_update:
    addi    t2, t2, 1           # i++
    j       while_loop          # jump back to re-check loop condition

loop_end:
    li      a7, 4               # a7 = 4  -> select "print string" syscall
    la      a0, result_msg      # a0 = address of result message
    ecall                       # print "The maximum value is:"

    li      a7, 1               # a7 = 1  -> select "print int" syscall
    add     a0, s0, zero        # a0 = s0 (move max value into arg register)
    ecall                       # print the max value

    li      a7, 10              # a7 = 10 -> select "exit" syscall
    ecall                       # terminate the program`
  },
  {
    id: "intermediate/fibonacci",
    category: "Intermediate",
    title: "Fibonacci",
    description: "Prints the Nth fibonacci number",
    source:`# Fibonacci (iterative)
# Computes fib(N) using two running registers, no recursion.
# fib(0)=0, fib(1)=1, fib(2)=1, fib(3)=2, ...
.global _start
.data
N: .word 10             # which fibonacci number to compute
.text
_start:
    la   t0, N
    lw   s0, 0(t0)        # s0 = n (loop count)

    li   s1, 0            # s1 = a = fib(i)
    li   s2, 1            # s2 = b = fib(i+1)
    li   s3, 0            # s3 = loop counter

fib_loop:
    beq  s3, s0, fib_done  # while (counter != n)

    add  s4, s1, s2        # s4 = a + b
    mv   s1, s2             # a = b
    mv   s2, s4              # b = a + b (old sum)

    addi s3, s3, 1
    j    fib_loop

fib_done:
    # s1 now holds fib(n)
    mv   a0, s1
    li   a7, 1              # print int syscall (adjust to your actual ecall enum)
    ecall

    li   a7, 10
    ecall`
  },
  {
    id: "intermediate/signed-mul-with-overflow",
    category: "Intermediate",
    title: "Signed multiplication with overflow detection",
    description: "Multiplies two inputs using mul/mulh and reports 32-bit overflow",
    source: `.data
    prompt1:      .asciiz "Enter first integer:\\n"
    prompt2:      .asciiz "Enter second integer:\\n"
    res_msg:      .asciiz "The product is:\\n"
    overflow_msg: .asciiz "Overflow detected! Result does not fit in 32 bits.\\n"

.text
main:
    li      a7, 4
    la      a0, prompt1
    ecall
    li      a7, 5
    ecall
    add     s0, a0, zero        # s0 = first operand (a)

    li      a7, 4
    la      a0, prompt2
    ecall
    li      a7, 5
    ecall
    add     s1, a0, zero        # s1 = second operand (b)

    mul     s2, s0, s1          # s2 = low 32 bits of (a * b)
    mulh    s3, s0, s1          # s3 = high 32 bits of signed (a * b)
                                 # together, (s3:s2) is the true 64-bit signed product

    # Overflow check: the 64-bit product fits in 32 bits (signed) if and only if
    # the high word is exactly the sign-extension of the low word.
    #   if s2's sign bit is 0, s3 must be 0x00000000
    #   if s2's sign bit is 1, s3 must be 0xFFFFFFFF
    # Equivalently: (s2 arithmetic-shifted right by 31) must equal s3.
    srai    t0, s2, 31           # t0 = sign-extension of s2 (all 0s or all 1s)
    bne     t0, s3, overflow    # if high word != sign-extension of low word -> overflow

no_overflow:
    li      a7, 4
    la      a0, res_msg
    ecall

    li      a7, 1
    add     a0, s2, zero        # safe to print the 32-bit result
    ecall
    j       done

overflow:
    li      a7, 4
    la      a0, overflow_msg
    ecall
    # s2 still holds the truncated (wrapped) low 32 bits, s3 holds the true
    # high bits, in case you want to print/inspect the full 64-bit result instead.

done:
    li      a7, 10              # a7 = 10 -> select "exit" syscall
    ecall                       # terminate the program`
  },
  {
    id: "intermediate/bubble-sort",
    category: "Intermediate",
    title: "Bubble Sort",
    description: "Sort a predefined list of integers using bubble sort",
    source: `# Bubble sort (small fixed array)
# Sorts an array of 10 signed 32-bit integers in ascending order using
# the bubble sort algorithm: repeatedly scan the array, swap adjacent
# out-of-order pairs, and stop when a full pass finds no swaps.
.global _start
.data
    array: .word 16, 6, 4, 1, 10, 9, 2, 18, 5, 22   # 10 unsorted integers
    space: .ascii " "
.text
_start:
    la   s0, array                # s0 = pointer to array start
    li   s1, 10                   # s1 = array length (constant)
    li   s2, 0                    # s2 = outer loop counter (pass number)

outer_loop:
    bge  s2, s1, sort_done        # if (pass >= len) done
    
    li   s3, 0                    # s3 = inner loop counter (current position)
    li   s4, 0                    # s4 = swap flag (1 if any swap occurred this pass, else 0)

inner_loop:
    addi t0, s1, -1               # t0 = len - 1 (last valid pair index)
    bge  s3, t0, inner_loop_end   # if (i >= len-1) end this pass
    
    slli t1, s3, 2                # t1 = i * 4 (convert array index to byte offset)
    add  t2, s0, t1               # t2 = address of array[i]
    
    lw   t3, 0(t2)                # t3 = array[i]
    lw   t4, 4(t2)                # t4 = array[i+1]
    
    ble  t3, t4, no_swap          # if (array[i] <= array[i+1]) no swap neededA
    
    sw   t4, 0(t2)                # array[i] = array[i+1]
    sw   t3, 4(t2)                # array[i+1] = array[i]  (swap complete)
    
    li   s4, 1                    # set swap flag to 1 (a swap occurred)

no_swap:
    addi s3, s3, 1                # i++ (move to next pair)
    j    inner_loop

inner_loop_end:
    beq  s4, zero, sort_done      # if (no swaps this pass) array is sorted, exit
    
    addi s2, s2, 1                # pass++ (do another pass)
    j    outer_loop

sort_done:
    # Array is now sorted in ascending order at the original address (s0)
    # Print each element
    li   s5, 0                    # s5 = print loop counter

print_loop:
    bge  s5, s1, print_done       # if (i >= len) done printing
    
    slli t0, s5, 2                # t0 = i * 4 (byte offset)
    add  t1, s0, t0               # t1 = address of array[i]
    lw   a0, 0(t1)                # a0 = array[i]
    
    li   a7, 1                    # print int syscall (adjust to your actual ecall enum)
    ecall

    li   a7, 4
    li   a0, space
    ecall
    
    addi s5, s5, 1                # i++ (next element)
    j    print_loop

print_done:
    li   a7, 10                   # exit
    ecall`
  },
  {
    id: "graphics/print-rect",
    category: "Graphics",
    title: "Print Rectangle",
    description: "Draws a rectangle on the screen",
    source: `# Draw rectangle
# Draws a filled white rectangle on a 128x96 framebuffer (stride 128,
# 1 byte/pixel). Rectangle defined by top-left corner (x0, y0) and
# dimensions (width, height)
.global _start
.data
X0:     .word 20             # left edge
Y0:     .word 15             # top edge
width:  .word 60             # rectangle width
height: .word 40             # rectangle height
.text
_start:
    li   s0, SCREEN          # s0 = framebuffer base
    la   t1, X0
    lw   s1, 0(t1)           # s1 = x0
    la   t1, Y0
    lw   s2, 0(t1)           # s2 = y0
    la   t1, width
    lw   s3, 0(t1)           # s3 = width
    la   t1, height
    lw   s4, 0(t1)           # s4 = height

    li   t0, 0               # t0 = row counter (0..height-1)

row_loop:
    bge  t0, s4, done        # while (row < height)

    add  t2, s2, t0          # t2 = y0 + row   (actual screen y)
    slli t2, t2, 7           # t2 = (y0 + row) * 128
    add  t2, t2, s0          # t2 = fb + (y0 + row)*128
    add  t2, t2, s1          # t2 = fb + (y0 + row)*128 + x0 (row start addr)

    li   t3, 0               # t3 = col counter (0..width-1)

col_loop:
    bge  t3, s3, col_loop_end # while (col < width)

    add  t4, t2, t3          # t4 = address of pixel at (x0 + col, y0 + row)
    li   t5, -1              # t5 = 0xFF (white pixel)
    sb   t5, 0(t4)           # write pixel

    addi t3, t3, 1           # col++
    j    col_loop

col_loop_end:
    addi t0, t0, 1           # row++
    j    row_loop

done:
    li   a7, 10              # exit
    ecall`
  },
  {
    id: "graphics/monoc-screen",
    category: "Graphics",
    title: "Print 'MonoC' to Screen",
    description: "Draws the word 'MonoC' on the framebuffer with a scaled bitmap font",
    source: `# MonoC screen
# Renders the text "MonoC" to a framebuffer using a hardcoded 5x7 bitmap font,
# with each font pixel scaled up 4x in both dimensions (so each glyph pixel
# becomes a 4x4 block of framebuffer pixels).

.global _start

.data
font_data:
    # Each letter is 7 bytes (rows), each byte's low 5 bits are the pixel
    # pattern for that row, bit c = column c (LSB = leftmost column, col 0).
    # A '1' bit means "draw a pixel here".

    # 'M' (5x7), 1 bit per pixel, bit c = column c (LSB = col 0)
    .byte 0x11, 0x1B, 0x15, 0x11, 0x11, 0x11, 0x11
    # 'o'
    .byte 0x0E, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0E
    # 'n'
    .byte 0x11, 0x13, 0x15, 0x19, 0x11, 0x11, 0x11
    # 'o'
    .byte 0x0E, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0E
    # 'C'
    .byte 0x1E, 0x01, 0x01, 0x01, 0x01, 0x01, 0x1E

.text
_start:
    li   s0, SCREEN         # s0 = framebuffer base address (predefined constant)
    li   t1, 4366           # t1 = pixel offset for start position:
                            #   y=34 -> row 34 * 128 bytes/row = 4352
                            #   x=14 -> +14 bytes into that row
                            #   4352 + 14 = 4366
    add  s0, s0, t1         # s0 = address of top-left pixel of "MonoC" text

    la   t0, font_data      # t0 = pointer into the font table, starts at 'M' row 0
    li   s1, 0              # s1 = letter index, 0..4 (one of M, o, n, o, C)

letter_loop:
    li   s2, 0              # s2 = row index within the glyph, 0..6 (7 rows tall)

row_loop:
    lbu  s3, 0(t0)          # s3 = this row's 5-bit pixel pattern (zero-extended byte load)
    li   s5, 0              # s5 = vertical scale repeat counter, 0..3
                             #      (each source row is drawn 4x to scale the glyph up)

yloop:
    # Compute rowbase = s0 + (row*4 + yrep) * 128
    # i.e. the address of the start of the scaled output row we're about to draw.
    slli t1, s2, 2          # t1 = row * 4        (each source row maps to 4 output rows)
    add  t1, t1, s5         # t1 = row*4 + yrep   (which of those 4 output rows we're on)
    slli t1, t1, 7          # t1 = (row*4 + yrep) * 128   (row index -> byte offset;
                             #      128 = framebuffer stride, bytes per row)
    add  t1, t1, s0         # t1 = rowbase = base address of this output row

    li   s4, 0              # s4 = column index within the glyph, 0..4 (5 columns wide)

cloop:
    srl  t2, s3, s4         # t2 = s3 >> s4   (shift the target column's bit down to LSB)
    andi t2, t2, 1          # t2 = that bit isolated (0 or 1)
    beq  t2, zero, skip     # if the bit is 0, no pixel to draw here -> skip

    li   t3, -1             # t3 = 0xFFFFFFFF (all bits set -> 4 consecutive white pixel bytes)
    slli t4, s4, 2          # t4 = col * 4     (each source column maps to 4 output columns,
                            #                   and we write all 4 in one word store)
    add  t4, t1, t4         # t4 = rowbase + (col*4) = address of this scaled pixel block
    sw   t3, 0(t4)          # write 4 white bytes at once (one store = one row of the 4x4 block)

skip:
    addi s4, s4, 1           # column++
    li   t5, 5
    blt  s4, t5, cloop       # while (col < 5): loop back for next column

    addi s5, s5, 1           # yrep++ (move to next of the 4 vertical-scale repeats)
    li   t5, 4
    blt  s5, t5, yloop       # while (yrep < 4): loop back and redraw this source row scaled

    addi t0, t0, 1           # advance font pointer to the next row byte
    addi s2, s2, 1           # row++
    li   t5, 7
    blt  s2, t5, row_loop    # while (row < 7): loop back for next row of this glyph

    addi s0, s0, 21          # advance draw position to next letter:
                             #   5 columns * 4x scale = 20 pixels, +1 pixel of spacing = 21
    addi s1, s1, 1           # letter index++
    li   t5, 5
    blt  s1, t5, letter_loop # while (letter < 5): loop back for next letter (M-o-n-o-C)

    li   a7, 10              # a7 = 10 -> select "exit" syscall
    ecall                    # terminate the program`
  },
  {
    id: "graphics/XOR / Sierpinski Triangle",
    category: "Graphics",
    title: "Sierpinski Triangle",
    description: "Draws Sierpinski Triangle fractal pattern to the screen",
    source:`# Sierpinski fractal (XOR/AND rule)
# For every pixel (x, y), plots it white if (x & y) == 0.
# This single bitwise test produces a Sierpinski gasket with no recursion,
# or stack, it falls directly out of how binary AND behaves
# across all (x, y) pairs, stride 128, 1 byte/pixel.
.global _start
.data
.text
_start:
    li   s0, SCREEN          # s0 = framebuffer base
    li   s1, 0               # s1 = y, 0..95
yloop:
    li   t5, 96
    bge  s1, t5, done        # while (y < 96)

    slli t0, s1, 7           # t0 = y * 128  (row base offset into framebuffer)
    add  t0, t0, s0          # t0 = fb + y*128 = address of (0, y)

    li   s2, 0               # s2 = x, 0..127
xloop:
    li   t5, 128
    bge  s2, t5, xloop_end    # while (x < 128)

    and  t1, s2, s1           # t1 = x & y
    bne  t1, zero, skip       # if (x & y) != 0, not part of the gasket -> skip

    add  t2, t0, s2           # t2 = address of (x, y)
    li   t3, -1               # t3 = 0xFF, white pixel
    sb   t3, 0(t2)

skip:
    addi s2, s2, 1            # x++
    j    xloop
xloop_end:
    addi s1, s1, 1            # y++
    j    yloop

done:
    li   a7, 10
    ecall`
  }
];
