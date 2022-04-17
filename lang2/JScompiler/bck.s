
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
__printWcallbackcb__: .long 0 
_dyna_0: 
.byte 'h'
.byte 'e'
.byte 'l'
.byte 'l'
.byte 'o'
.byte 0
_dyna_1: 
.byte 'd'
.byte 'o'
.byte 'n'
.byte 'e'
.byte 0


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

jmp main
printWcallback:
push %ebx
lea %ebx, _dyna_0
mov _tempPointer, %ebx
pop %ebx
put_string _tempPointer
new_line
call [__printWcallbackcb__]
ret
myCallback:
push %ebx
lea %ebx, _dyna_1
mov _tempPointer, %ebx
pop %ebx
put_string _tempPointer
new_line
ret
main:
push %eax
lea %eax, myCallback
mov __printWcallbackcb__, %eax
pop %eax
call printWcallback
   ret
