export const EXAMPLES_DATA = [
  {
    id: "basic/integer-input-output",
    category: "Basic",
    title: "integer input and output",
    description: "Simple integer input and output with prompt message",
    source: `.data 
     prompt: .asciiz "Please enter an integer.\\n"
     res: .asciiz "The value you have entered is:\\n"
     
    .text
        main: 
            li a7,4
            la a0,prompt
            ecall
            
            li a7,5
            ecall 
            add s0,a7,zero
            
            li a7,4
            la a0,res
            ecall
            
            li a7,1
            add a0,s0,zero
            ecall
            
            li a7,10
            ecall`
  },
  {
    id: "basic/integer-even/odd",
    category: "Basic",
    title: "Integer even or odd",
    description: "Code for checking whether an input integer is even or odd",
    source: `.data 
     prompt: .asciiz "Please enter an integer.\\n"
     oddm: .asciiz "\\nThe given number is odd."
     evenm: .asciiz "\\nThe given number is even."


    .text


        main: 
            li a7,4
            la a0,prompt
            ecall
            
            li a7,5
            ecall 
            add s0,a0,zero
            
            li t0,2
            rem t1,s0,t0
            
            li a7,4
            bne t1,zero,odd
            j even
            
        odd: 
        
            la a0,oddm
            j exit
            
        even: 
        
            la a0,evenm
            
        exit: 
            
            ecall
            li a7,10
            ecall`
  },
  {
    id: "intermediate/array-initialization-traversal",
    category: "Intermediate",
    title: "Array initialization and traversal",
    description: "Array initialization and traversal loop",
    source: `# An array save[4] = {2,2,2,3} is initialized and the values are traveled and printed in the terminal.
# While check with array value performed by the below logic:
# int save[4] = {2,2,2,3};
# i = 0, k = 2;
# while (save[i] == k){
#     i++;
# }

.data 
        save: .word 2,2,2,3
        msg: .asciiz "The array is: \\n"
        msg2: .asciiz "\\nWhile check save[i]=2 begins:\\n"
        
    .text
        main:
            la t0,save
            lw t1,0(t0)
            li a7,4
            la a0,msg
            ecall
            li a7,1
            add a0,t1,zero
            ecall
            
            addi t0,t0,4
            lw t1,0(t0)
            li a7,1
            add a0,t1,zero
            ecall
            
            addi t0,t0,4
            lw t1,0(t0)
            li a7,1
            add a0,t1,zero
            ecall
            
            addi t0,t0,4
            lw t1,0(t0)
            li a7,1
            add a0,t1,zero
            ecall
            
            li s0,0
            li s1,2
            la s3,save
            li a7,4

    la a0,msg2
            ecall


    while:
        sll t0,s0,2
        add t0,t0,s3
        lw t1,0(t0)
        bne t1,s1,exit
        addi s0,s0,1
        li a7,1
        add a0,t1,zero
        ecall
        j while 
        
    exit: 
        li a7,10
        ecall`
  },
  {
    id: "basic/while-loop",
    category: "Basic",
    title: "While loop",
    description: "Simple while loop example",
    source: `# Problem : 
# int i = 0;
# while (i <= 5){
#     i++;
# }

.data
    msg1: .asciiz "While loop begins"
    msg2: .asciiz "While loop ends"
    nl: .asciiz "\\n"


        .text


        main:
            li t0,0
            li t1,5
            li a7,4
            la a0,msg1
            ecall
            li a7,4
            la a0,nl
            ecall
            
        while: 
            slt t2,t1,t0
            bne t2,zero,exit
            jal print
            addi t0,t0,1
            j while
            
        print: 
            li a7,1
            add a0,t0,zero
            ecall
            li a7,4
            la a0,nl
            ecall
            jalr zero, ra, 0
            
        exit:  
            li a7,4
            la a0,msg2
            ecall
            li a7,10
            ecall `
  },
  {
    id: "basic/32-bit multiplication",
    category: "Basic",
    title: "32-bit multiplication",
    description: "32 bit multiplication of integer number 4 and 5 using \"mul\" instruction",
    source: `.data 
    msg: .asciiz "The product is: "
        
    .text
        main: 
            li a0,30
            li a1,5
            
            jal ra multiplication 
            add s0,a0,zero
            
            li a7,4
            la a0, msg
            ecall
            
            add a0,s0,zero
            li a7,1
            ecall
            li a7,10 
            ecall
            
            
            
    multiplication: 
                    mul a7,a0,a1
                    jalr zero, ra, 0`
  },
  {
    id: "intermediate/signed-addition-with-overflow",
    category: "Intermediate",
    title: "Safe signed addition with overflow detection",
    description: "Safe signed add: returns result or prints \"OVERFLOW\"",
    source: `.data
        overflow_msg: .asciiz "OVERFLOW\\n"
        ok_msg:       .asciiz "OK\\n"


        .text
        main:
            li s0, 2000000000
            li s1, 2000000000


            # manual overflow check before adding
            # rule: overflow iff same sign and result has opposite sign
            # check signs
            slt  t0, s0, zero    # t0 = 1 if s0 < 0
            slt  t1, s1, zero    # t1 = 1 if s1 < 0
            bne  t0, t1, no_overflow   # different signs = safe


            # Same sign: do the add and check result sign
            add t2, s0, s1      
            slt  t3, t2, zero    # t3 = 1 if result < 0
            beq  t0, t3, no_overflow   # same sign as operands = no overflow


            # overflow!
            la   a0, overflow_msg
            li   a7, 4
            ecall
            j    done


        no_overflow:
            la   a0, ok_msg
            li   a7, 4
            ecall


        done:
            li a7, 10
            ecall`
  },
  {
    id: "basic/sum-of-array",
    category: "Basic",
    title: "Sum of Array values",
    description: "Calculate the sum of an array using a loop",
    source: `# Question: Conversion of the below C code to assembly
# 
# #include <stdio.h>
# int sumArray(int *arr, int n) {
#     int sum = 0;
#     for (int i = 0; i < n; i++) {
#         sum = sum + arr[i];
#     }
#     return sum;
# }
# int main() {
#     int array[5] = {1, 2, 3, 4, 5};
#     int result = sumArray(array, 5);
#     printf("The sum is: %d", result);
#     return 0;
# }

.data 
        array: .word 1,2,3,4,5
        msg: .asciiz "The sum is: "
        
    .text


        main: 
            
            la s0,array  # base address of array 
            li t0,0      # array index i, initialized with 0
            li t1,5      # array size, n = t1
            jal sumarray  # call sumarray function
            
            li a7,4      # code for printing string
            la a0,msg    # load the message in ao register
            ecall       # ecall to perform the operation
            
            li a7,1      # code for printing integer
            add a0,s1,zero     # the sum saved from s1 to a0 for printing 
            ecall        # ecall to perform the operation
            
            j exit        # jump to exit to terminate the program 
            
            
            
        sumarray:          # helper function to calculate the sum
                
                li s1,0  # sum initialized with 0
                
                while: 
                        slt t2,t0,t1             # t2 = 1 while t0(i)<5
                        beq t2,zero,return       # branch when i=5 or t2=0
                        sll t3,t0,2              # shifting t0 2 unit to get 4*i
                        addu t2,s0,t3            # t2 = base address(s0) + 4i
                        lw t4,0(t2)              # load value from t2 register 
                        add s1,s1,t4             # add the array index value to sum
                        addi t0,t0,1             # increment i value by 1
                        j while                  # continue the while loop
                return: 
                    jalr zero, ra, 0             # use the ra register value to jump and link back to main
                    
        exit:
            
            li a7,10     # code for exiting the program 
            ecall      # ecall to perform the operation`
  },
  {
    id: "basic/add-two-numbers",
    category: "Basic",
    title: "Add Two Numbers",
    description: "Simple addition of two immediate values into registers",
    source: `# Program: Simple Addition Example
# Goal: Calculate 10 + 25

.global _start
_start:
    li a0, 10       # Load immediate value 10 into register a0
    li a1, 25       # Load immediate value 25 into register a1
    add t0, a0, a1  # Add values in a0 and a1 into t0`
  },
  {
    id: "graphics/monoc-screen",
    category: "Graphics",
    title: "Print 'MonoC' to Screen",
    description: "Draws the word 'MonoC' on the emulator screen",
    source: `# MonoC screen

.global _start

.data
font_data:
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
    li   s0, 0x07FFD000     # framebuffer base address
    li   t1, 4366           # y=34 -> 34*128=4352, x=14 -> +14
    add  s0, s0, t1         # s0 = top-left of "MonoC"

    la   t0, font_data      # t0 = pointer into the font table

    li   s1, 0              # letter index 0..4
letter_loop:
    li   s2, 0              # row index 0..6
row_loop:
    lbu  s3, 0(t0)          # load this row's 5-bit pixel pattern
    li   s5, 0              # vertical scale repeat 0..3
yloop:
    # rowbase = s0 + (row*4 + yrep) * 128
    slli t1, s2, 2          # row*4
    add  t1, t1, s5         # row*4 + yrep
    slli t1, t1, 7          # *128
    add  t1, t1, s0         # rowbase

    li   s4, 0              # column index 0..4
cloop:
    srl  t2, s3, s4         # shift bit into LSB
    andi t2, t2, 1
    beq  t2, zero, skip
    li   t3, -1             # 0xFFFFFFFF -> four white pixels
    slli t4, s4, 2          # col*4
    add  t4, t1, t4
    sw   t3, 0(t4)          # write 4 white bytes
skip:
    addi s4, s4, 1
    li   t5, 5
    blt  s4, t5, cloop

    addi s5, s5, 1
    li   t5, 4
    blt  s5, t5, yloop

    addi t0, t0, 1          # advance to the next font byte
    addi s2, s2, 1
    li   t5, 7
    blt  s2, t5, row_loop

    addi s0, s0, 21         # next letter: 5 columns * scale 4
    addi s1, s1, 1
    li   t5, 5
    blt  s1, t5, letter_loop

    li   a7, 10             # exit
    ecall`
  }
];
