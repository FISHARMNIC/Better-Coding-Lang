
.intel_syntax
.org 0x100
.global kernel_entry

_lineNumber: .long 0
_mathResult: .long 0
_mathFloat: .float 0
_tempReg: .long 0
_tempPointer: .long 0
.include "./data.s"
L_bozo0: 
.int 123
foo: .long 0
L_bozo1: 
.int 1
.int 2
.int 3
.int 4
.int 5
bob: .long 0
L_bozo2: 
.byte 'A'
.byte 'B'
.byte 'C'
jon: .long 0
L_bozo3: 
.byte 'h'
.byte 'e'
.byte 'l'
.byte 'l'
.byte 'o'
.byte '_'
.byte 'w'
.byte 'o'
.byte 'r'
.byte 'l'
.byte 'd'
.byte 0
nico: .long 0
L_bozo4: 
.byte 't'
.byte 'e'
.byte 's'
.byte 't'
.byte 'i'
.byte 'n'
.byte 'g'
.byte '1'
.byte '2'
.byte '3'
.byte 0


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
lea %ebx, L_bozo0
mov _tempPointer, %ebx
pop %ebx
push %eax
mov %eax, _tempPointer
mov %eax, [%eax]
mov _tempReg, %eax
pop %eax

push %ebx
mov %ebx, _tempReg
mov foo, %ebx
pop %ebx

push %ebx
lea %ebx, L_bozo1
mov _tempPointer, %ebx
pop %ebx

push %ebx
mov %ebx, _tempPointer
mov bob, %ebx
pop %ebx

push %ebx
lea %ebx, L_bozo2
mov _tempPointer, %ebx
pop %ebx

push %ebx
mov %ebx, _tempPointer
mov jon, %ebx
pop %ebx

push %ebx
lea %ebx, L_bozo3
mov _tempPointer, %ebx
pop %ebx

push %ebx
mov %ebx, _tempPointer
mov nico, %ebx
pop %ebx

put_int foo
new_line
push %eax
mov %eax, bob
mov %eax, [%eax]
mov _tempReg, %eax
pop %eax
put_int _tempReg
new_line

pusha
mov %eax, 4
mov %ebx, 2
mul %ebx
mov %ebx, bob
add %ebx, %eax
mov %ebx, [%ebx]
mov _tempReg, %ebx
popa

put_int _tempReg
new_line

pusha
mov %eax, 1
mov %ebx, 1
mul %ebx
mov %ebx, jon
add %ebx, %eax
mov %ebx, [%ebx]
mov _tempReg, %ebx
popa

put_char _tempReg
new_line
put_string nico
new_line
push %ebx
lea %ebx, L_bozo4
mov _tempPointer, %ebx
pop %ebx
put_string _tempPointer
new_line
   ret
