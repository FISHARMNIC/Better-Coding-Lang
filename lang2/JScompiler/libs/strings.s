.macro strcmp str1, str2, len
    pusha
    cld  # clear direction flag

    lea %eax, \str1
    lea %ebx, \str2
    mov %ecx, \len
    
    call _strcmp_loop   

   popa

.endm

_strcmp_loop:
    mov %edx, [%eax]
    mov %esi, [%ebx]
    cmp %esi, %edx
    jne _strcmp_not_equal # if any char is not equal, exit
    
    # next char
    inc %eax
    inc %ebx

    dec %ecx 
    cmp %ecx, 0
    jne _strcmp_loop # keep going
    movb _strcmp_result, 0 # all chars arethe same, the difference is 0
    ret

_strcmp_not_equal: 
    movb _strcmp_result, 1

.macro strlen arr
    push %esi
    mov %esi, 0  # string offset register
    mov %eax, \arr # move string address into eax
    call _strlen
    mov _function_return, %esi
    pop %esi
.endm

_strlen:  
    inc %esi # increment the string offset
    cmpb [%eax + %esi], 0 # compare the character with \0
    jne _strlen
    ret