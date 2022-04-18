
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
.section .bss
vga_ram: .long 0
.section .text
ttyPosition: .long 0
BGcolor: .long 0
FGcolor: .long 0
__formatVGAbgColor__: .int 0 
__formatVGAfgColor__: .int 0 
__formatVGAcharacter__: .int 0 
wholeColor: .long 0
__put_charcharacter__: .int 0 


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
mov %ebx, 0xB8000
mov vga_ram, %ebx
pop %ebx


push %ebx
mov %ebx, 0
mov ttyPosition, %ebx
pop %ebx


push %ebx
mov %ebx, 0
mov BGcolor, %ebx
pop %ebx


push %ebx
mov %ebx, 15
mov FGcolor, %ebx
pop %ebx

jmp main
formatVGA:
push %eax
mov %eax, __formatVGAbgColor__
push %ecx
mov %cl, 4
shl %eax, %cl
pop %ecx
push %ebx
mov %ebx, __formatVGAfgColor__
or %eax, %ebx
pop %ebx
mov _mathResult, %eax
pop %eax

push %ebx
mov %ebx, _mathResult
mov wholeColor, %ebx
pop %ebx

push %eax
mov %eax, wholeColor
push %ecx
mov %cl, 8
shl %eax, %cl
pop %ecx
push %ebx
mov %ebx, __formatVGAcharacter__
or %eax, %ebx
pop %ebx
mov _mathResult, %eax
pop %eax
push %eax
mov %eax, _mathResult
mov _return_int, %eax
pop %eax
ret
ret
put_char:
push %eax
mov %eax, BGcolor
mov __formatVGAbgColor__, %eax
mov %eax, FGcolor
mov __formatVGAfgColor__, %eax
mov %eax, 'A'
mov __formatVGAcharacter__, %eax
pop %eax
call formatVGA

push %eax; push %ebx
mov %eax, 4
mov %ebx, ttyPosition
mul %ebx
mov %ebx, vga_ram
add %ebx, %eax
mov _tempBase, %ebx
mov %ebx, [%ebx]
mov _tempReg, %ebx
pop %ebx; pop %eax

push %eax
push %ebx
mov %eax, _return_int
mov %ebx, _tempBase
mov [%ebx], %eax
pop %ebx
pop %eax
incw ttyPosition
ret
main:
push %eax
mov %eax, 'A'
mov __put_charcharacter__, %eax
pop %eax
call put_char
   ret
