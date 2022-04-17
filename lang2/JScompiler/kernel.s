
.intel_syntax
.org 0x100
.global kernel_entry

_mathResult: .long 0

_tempReg: .long 0
_tempBase: .long 0

_tempReg_2: .long 0
_tempBase_2: .long 0 

_tempPointer: .long 0

.include "./data.s"

 .include "libs/stdio.s" 

 .include "libs/stdbool.s" 
i: .long 0


.section .text
kernel_entry:
    push %eax; push %edx
    mov %dx, 0x3D4
    mov %al, 0xA	 # disable cursor
    out %dx, %al
    inc %dx
    mov %al, 0x20 # disable cursor
    out %dx, %al
    pop %edx; pop %eax


push %ebx
mov %ebx, 0
mov i, %ebx
pop %ebx

_while_0:
push %eax
mov %eax, i
add %eax, 65
mov _mathResult, %eax
pop %eax
put_char _mathResult, i
incw i
push %eax; push %ebx
mov %eax, i
mov %ebx, 10
cmp %eax, %ebx
pop %ebx; pop %eax
jl _while_0
   ret
