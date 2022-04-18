
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

 .include "libs/strings/strings.s" 

 .include "libs/stdio/stdio.s" 
_strings_iterator_: .long 0
_strings_iterator_2: .long 0
__strcmpstr1__: .int 0 
__strcmpstr2__: .int 0 
__strlenstring1__: .int 0 
__strcpystring1__: .int 0 
__strcpystring2__: .int 0 
__strcatstring1__: .int 0 
__strcatstring2__: .int 0 
__strcatamt__: .int 0 
_dyna_0: 
.byte 'h'
.byte 'e'
.byte 'l'
.byte 'l'
.byte 'o'
.byte 0
.section .bss
string1: .long 0
.section .text
_dyna_1: 
.byte 'h'
.byte 'e'
.byte 'l'
.byte 'l'
.byte 'o'
.byte 0
.section .bss
string2: .long 0
.section .text
_dyna_2: 
.byte 'a'
.byte 'b'
.byte 'c'
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.byte 0
.section .bss
longstring: .long 0
.section .text


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
mov _strings_iterator_, %ebx
pop %ebx


push %ebx
mov %ebx, 0
mov _strings_iterator_2, %ebx
pop %ebx

jmp _strings_s_main_
strcmp:
push %eax
mov %eax, 0
mov _strings_iterator_, %eax
pop %eax
_while_0:

push %eax; push %ebx
mov %eax, 1
mov %ebx, _strings_iterator_
mul %ebx
mov %ebx, __strcmpstr2__
add %ebx, %eax
mov _tempBase, %ebx
mov %ebx, [%ebx]
mov _tempReg, %ebx
pop %ebx; pop %eax


push %eax; push %ebx
mov %eax, 1
mov %ebx, _strings_iterator_
mul %ebx
mov %ebx, __strcmpstr1__
add %ebx, %eax
mov _tempBase_2, %ebx
mov %ebx, [%ebx]
mov _tempReg_2, %ebx
pop %ebx; pop %eax

push %eax; push %ebx
mov %eax, _tempReg_2
mov %ebx, _tempReg
cmp %eax, %ebx
pop %ebx; pop %eax
jne _if_0
jmp _if_1
_if_0:
push %eax
mov %eax, 1
mov _return_int, %eax
pop %eax
ret
_ifEscape_0:
_if_1:

push %eax; push %ebx
mov %eax, 1
mov %ebx, _strings_iterator_
mul %ebx
mov %ebx, __strcmpstr1__
add %ebx, %eax
mov _tempBase, %ebx
mov %ebx, [%ebx]
mov _tempReg, %ebx
pop %ebx; pop %eax

push %eax; push %ebx
mov %eax, _tempReg
mov %ebx, 0
cmp %eax, %ebx
pop %ebx; pop %eax
jne _if_2
jmp _if_3
_if_2:

push %eax; push %ebx
mov %eax, 1
mov %ebx, _strings_iterator_
mul %ebx
mov %ebx, __strcmpstr2__
add %ebx, %eax
mov _tempBase, %ebx
mov %ebx, [%ebx]
mov _tempReg, %ebx
pop %ebx; pop %eax

jmp _ifEscape_1
_if_3:
push %eax; push %ebx
mov %eax, _tempReg
mov %ebx, 0
cmp %eax, %ebx
pop %ebx; pop %eax
je _if_4
jmp _if_5
_if_4:
push %eax
mov %eax, 1
mov _return_int, %eax
pop %eax
ret
jmp _ifEscape_1
_if_5:
push %eax
mov %eax, 1
mov _return_int, %eax
pop %eax
ret
_ifEscape_1:
_if_6:
push %eax; push %ebx
mov %eax, _strings_iterator_
mov %ebx, -1
cmp %eax, %ebx
pop %ebx; pop %eax
jl _while_0
push %eax
mov %eax, 0
mov _return_int, %eax
pop %eax
ret
ret
strlen:
push %eax
mov %eax, 0
mov _strings_iterator_, %eax
pop %eax
_while_1:

push %eax; push %ebx
mov %eax, 1
mov %ebx, _strings_iterator_
mul %ebx
mov %ebx, __strlenstring1__
add %ebx, %eax
mov _tempBase, %ebx
mov %ebx, [%ebx]
mov _tempReg, %ebx
pop %ebx; pop %eax

push %eax; push %ebx
mov %eax, _tempReg
mov %ebx, 0
cmp %eax, %ebx
pop %ebx; pop %eax
je _if_7
jmp _if_8
_if_7:
push %eax
mov %eax, _strings_iterator_
mov _return_int, %eax
pop %eax
ret
_ifEscape_2:
_if_8:
incw _strings_iterator_
push %eax; push %ebx
mov %eax, 0
mov %ebx, 1
cmp %eax, %ebx
pop %ebx; pop %eax
jl _while_1
ret
strcpy:
_strcpy __strcpystring1__,__strcpystring2__
ret
strcat:
push %eax
mov %eax, __strcatstring1__
mov __strlenstring1__, %eax
pop %eax
call strlen
push %eax
mov %eax, _return_int
sub %eax, 2
mov _mathResult, %eax
pop %eax
push %eax
mov %eax, _mathResult
mov _strings_iterator_, %eax
pop %eax

push %eax; push %ebx
mov %eax, 1
mov %ebx, _strings_iterator_2
mul %ebx
mov %ebx, __strcatstring2__
add %ebx, %eax
mov _tempBase, %ebx
mov %ebx, [%ebx]
mov _tempReg, %ebx
pop %ebx; pop %eax

push %eax
mov %eax, _tempReg
mov __strcatstring1__, %eax
pop %eax
incw _strings_iterator_2
ret
_strings_s_main_:
push %ebx
lea %ebx, _dyna_0
mov _tempPointer, %ebx
pop %ebx

push %ebx
mov %ebx, _tempPointer
mov string1, %ebx
pop %ebx

push %ebx
lea %ebx, _dyna_1
mov _tempPointer, %ebx
pop %ebx

push %ebx
mov %ebx, _tempPointer
mov string2, %ebx
pop %ebx

push %ebx
lea %ebx, _dyna_2
mov _tempPointer, %ebx
pop %ebx

push %ebx
mov %ebx, _tempPointer
mov longstring, %ebx
pop %ebx

push %eax
mov %eax, string1
mov __strcmpstr1__, %eax
mov %eax, string2
mov __strcmpstr2__, %eax
pop %eax
call strcmp
put_int _return_int
new_line
push %eax
mov %eax, string1
mov __strlenstring1__, %eax
pop %eax
call strlen
put_int _return_int
new_line
push %eax
mov %eax, longstring
mov __strcatstring1__, %eax
mov %eax, string1
mov __strcatstring2__, %eax
mov %eax, 4
mov __strcatamt__, %eax
pop %eax
call strcat
put_string longstring
new_line
   ret
