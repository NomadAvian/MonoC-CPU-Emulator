examples = [
    ("basic/integer-input-output", 
     "Basic", 
     "integer input and output", 
     "Simple integer input and output with prompt message", 
     """.data 
     prompt: .asciiz "Please enter an integer.\n"
     res: .asciiz "The value you have entered is:\n"
     
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
            ecall"""
),

(   "basic/integer-even/odd",
    "Basic",
    "Integer even or odd",
    "Code for checking whether an input integer is even or odd",
    """.data 
     prompt: .asciiz "Please enter an integer.\n"
     oddm: .asciiz "\nThe given number is odd."
     evenm: .asciiz "\nThe given number is even."


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
            ecall"""     
),

(   "intermediate/array-initialization-traversal",
    "Intermediate",
    "Array initialization and traversal",
    """An array save[4] = {2,2,2,3} is initialized and the values are traveled and printed in the terminal. While check with array value performed by the below logic:
    int save[4] = {2,2,2,3};
    i=0, k = 2;
    while (save[i] == k){
    i++;
    } """,
    """.data 
        save: .word 2,2,2,3
        msg: .asciiz "The array is: \n"
        msg2: .asciiz "\nWhile check save[i]=2 begins:\n"
        
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
        ecall"""   
),

(   "basic/while-loop",
    "Basic",
    "While loop",
    """Code for "While loop" with message 
    Problem : 
        int i = 0
        while (i<=5){
            i++;
        }""",
    """.data
    msg1: .asciiz "While loop begins"
    msg2: .asciiz "While loop ends"
    nl: .asciiz "\n"


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
            ecall """ 
),

(   "basic/32-bit multiplication",
    "Basic",
    "32-bit multiplication",
    """32 bit multiplication of integer number 4 and 5 using "mul" instruction""",
    """.data 
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
                    jalr zero, ra, 0"""    
)
,
(   "intermediate/signed-addition-with-overflow",
    "Intermediate",
    "Safe signed addition with overflow detection",
    """Safe signed add: returns result or prints "OVERFLOW""",
    """.data
        overflow_msg: .asciiz "OVERFLOW\n"
        ok_msg:       .asciiz "OK\n"


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
            ecall"""  
) ,

(   "basic/sum-of-array",
    "Basic",
    "Sum of Array values",
    """Question is the conversion of the below C code to assembly
    #include <stdio.h>
    int sumArray(int *arr, int n) {
    int sum = 0;
    for (int i = 0; i < n; i++) {
    sum = sum + arr[i];
    }
    return sum;
    }
    int main() {
    int array[5] = {1, 2, 3, 4, 5};
    int result = sumArray(array, 5);
    printf("The sum is: %d", result);
    return 0;
    }""",
    """.data 
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
            ecall      # ecall to perform the operation""" 
)

]