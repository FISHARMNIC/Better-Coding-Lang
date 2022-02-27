
.intel_syntax
.org 0x100
.global kernel_entry

_lineNumber: .long 0
_mathResult: .long 0
_mathFloat: .float 0
_tempReg: .long 0
_tempBase: .long 0
_tempPointer: .long 0

.include "./data.s"
_dyna_0: 
.byte 0
baseAddress: .long 0
i: .long 0


.section .text
kernel_entry:
    pusha
    mov %dx, 0x3D4
    mov %al, 0xA	 # disable cursor
    out %dx, %al
    inc %dx
    mov %al, 0x20 # disable cursor
    out %dx, %al
    popa

push %ebx
lea %ebx, _dyna_0
mov _tempPointer, %ebx
pop %ebx

push %ebx
mov %ebx, _tempPointer
mov baseAddress, %ebx
pop %ebx

push %eax
mov %eax, 'H'
mov [1054564], %eax
pop %eax

push %ebx
mov %ebx, 0
mov i, %ebx
pop %ebx

line:
push %eax
mov %eax, 'N'
mov [line], %eax
pop %eax
_while_0:

pusha #TEST
mov %eax, 1
mov %ebx, i
mul %ebx
mov %ebx, baseAddress
add %ebx, %eax
mov _tempBase, %ebx
mov %ebx, [%ebx]
mov _tempReg, %ebx
popa

put_char _tempReg
incw i
pusha
mov %eax, i
mov %ebx, 2000
cmp %eax, %ebx
pushf
popf
popa
jl _while_0
   ret
