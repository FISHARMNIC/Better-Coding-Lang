
.intel_syntax
.org 0x100
.global kernel_entry

_lineNumber: .long 0
_mathResult: .long 0
_mathFloat: .float 0

_tempReg: .long 0
_tempBase: .long 0

_tempReg_2: .long 0
_tempBase_2: .long 0 

_tempPointer: .long 0

.include "./data.s"
vga_ram: .long 0
ttyPosition: .long 0
BGcolor: .long 0
FGcolor: .long 0
bgColor: .int 0 
fgColor: .int 0 
character: .int 0 
wholeColor: .long 0


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
mov %ebx, VGA_ADDR
mov vga_ram, %ebx
pop %ebx


push %ebx
mov %ebx, 0
mov ttyPosition, %ebx
pop %ebx


push %ebx
mov %ebx, BLACK
mov BGcolor, %ebx
pop %ebx


push %ebx
mov %ebx, WHITE
mov FGcolor, %ebx
pop %ebx

jmp main
formatVGA:
push %eax
mov %eax, bgColor
push %ecx
mov %cl, 4
shl %eax, %cl
pop %ecx
push %ebx
mov %ebx, fgColor
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
mov %ebx, character
or %eax, %ebx
pop %ebx
mov _mathResult, %eax
pop %eax
push %eax
mov %eax, _mathResult
mov _return_int, %eax
pop %eax
ret
main:
push %eax
mov %eax, BGcolor
mov bgColor, %eax
mov %eax, FGcolor
mov fgColor, %eax
mov %eax, 'A'
mov character, %eax
pop %eax
call formatVGA

pusha #TEST
mov %eax, 4
mov %ebx, ttyPosition
mul %ebx
mov %ebx, vga_ram
add %ebx, %eax
mov _tempBase, %ebx
mov %ebx, [%ebx]
mov _tempReg, %ebx
popa

push %eax
push %ebx
mov %eax, _return_int
mov %ebx, _tempBase
mov [%ebx], %eax
pop %ebx
pop %eax
   ret
