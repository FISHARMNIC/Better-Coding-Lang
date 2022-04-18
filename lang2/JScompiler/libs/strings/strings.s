.macro _strcpy dest, source
    mov %eax, \dest
    mov %ebx, \source
    call _strcpy_loop
.endm

_strcpy_loop:
    mov %ecx, [%ebx]
    mov [%eax], %ecx
    inc %eax
    inc %ebx
    cmpb [%eax], 0
    jne _strcpy_loop
    ret

