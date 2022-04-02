
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

 .include "libs/stdio.s" 
_dyna_0: .fill 100, 1
malloc_memory: .long 0
_dyna_1: .fill 100, 4
malloc_start: .long 0
_dyna_2: .fill 100, 4
malloc_end: .long 0
malloc_index: .long 0
malloc_free_spot: .long 0
AI_param_value: .int 0 
AI_return: .long 0
AI_i: .long 0
M_param_size: .int 0 
M_position: .long 0
M_free_bytes_read: .long 0
F_parameter_ptr: .int 0 
F_baseAddress: .long 0
F_i: .long 0
F_endValue: .long 0
arr1: .long 0
arr2: .long 0
_dyna_3: 
.byte '-'
.byte '-'
.byte '-'
.byte 'F'
.byte 'r'
.byte 'e'
.byte 'e'
.byte 'd'
.byte '_'
.byte 'a'
.byte 'r'
.byte 'r'
.byte '1'
.byte '-'
.byte '-'
.byte '-'
.byte 0
arr3: .long 0
arr4: .long 0


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
mov malloc_memory, %ebx
pop %ebx

push %ebx
lea %ebx, _dyna_1
mov _tempPointer, %ebx
pop %ebx

push %ebx
mov %ebx, _tempPointer
mov malloc_start, %ebx
pop %ebx

push %ebx
lea %ebx, _dyna_2
mov _tempPointer, %ebx
pop %ebx

push %ebx
mov %ebx, _tempPointer
mov malloc_end, %ebx
pop %ebx


push %ebx
mov %ebx, 1
mov malloc_index, %ebx
pop %ebx


push %ebx
mov %ebx, 0
mov malloc_free_spot, %ebx
pop %ebx

jmp main
array_includes:

push %ebx
mov %ebx, 101
mov AI_return, %ebx
pop %ebx


push %ebx
mov %ebx, 0
mov AI_i, %ebx
pop %ebx

_while_0:

pusha #TEST
mov %eax, 4
mov %ebx, AI_i
mul %ebx
mov %ebx, malloc_start
add %ebx, %eax
mov _tempBase, %ebx
mov %ebx, [%ebx]
mov _tempReg, %ebx
popa

pusha
mov %eax, _tempReg
mov %ebx, AI_param_value
cmp %eax, %ebx
popa
je _if_0
jmp _if_1
_if_0:
push %eax
mov %eax, AI_i
mov AI_return, %eax
pop %eax
ret
_ifEscape_0:
_if_1:
incw AI_i
pusha
mov %eax, AI_i
mov %ebx, 100
cmp %eax, %ebx
popa
jl _while_0
ret
malloc:

push %ebx
mov %ebx, 0
mov M_position, %ebx
pop %ebx


push %ebx
mov %ebx, 0
mov M_free_bytes_read, %ebx
pop %ebx

_while_1:
push %eax
mov %eax, M_position
mov AI_param_value, %eax
pop %eax
call array_includes
pusha
mov %eax, AI_return
mov %ebx, 101
cmp %eax, %ebx
popa
jne _if_2
jmp _if_3
_if_2:

pusha #TEST
mov %eax, 4
mov %ebx, AI_return
mul %ebx
mov %ebx, malloc_end
add %ebx, %eax
mov _tempBase, %ebx
mov %ebx, [%ebx]
mov _tempReg, %ebx
popa

push %eax
mov %eax, _tempReg
mov M_position, %eax
pop %eax
push %eax
mov %eax, 0
mov M_free_bytes_read, %eax
pop %eax
jmp _ifEscape_1
_if_3:
pusha
mov %eax, M_free_bytes_read
mov %ebx, M_param_size
cmp %eax, %ebx
popa
je _if_4
jmp _if_5
_if_4:

pusha #TEST
mov %eax, 4
mov %ebx, malloc_index
mul %ebx
mov %ebx, malloc_end
add %ebx, %eax
mov _tempBase, %ebx
mov %ebx, [%ebx]
mov _tempReg, %ebx
popa

push %eax
push %ebx
mov %eax, M_position
mov %ebx, _tempBase
mov [%ebx], %eax
pop %ebx
pop %eax
push %eax
mov %eax, M_position
sub %eax, M_param_size
add %eax, 1
mov _mathResult, %eax
pop %eax

pusha #TEST
mov %eax, 4
mov %ebx, malloc_index
mul %ebx
mov %ebx, malloc_start
add %ebx, %eax
mov _tempBase, %ebx
mov %ebx, [%ebx]
mov _tempReg, %ebx
popa

push %eax
push %ebx
mov %eax, _mathResult
mov %ebx, _tempBase
mov [%ebx], %eax
pop %ebx
pop %eax
incw malloc_index
push %eax
mov %eax, malloc_memory
add %eax, M_position
sub %eax, M_param_size
mov _mathResult, %eax
pop %eax
push %eax
mov %eax, _mathResult
mov _return_int, %eax
pop %eax
ret
_ifEscape_1:
_if_5:
incw M_free_bytes_read
incw M_position
pusha
mov %eax, M_position
mov %ebx, 100
cmp %eax, %ebx
popa
jl _while_1
incw malloc_index
ret
free:
push %eax
mov %eax, F_parameter_ptr
sub %eax, malloc_memory
add %eax, 1
mov _mathResult, %eax
pop %eax

push %ebx
mov %ebx, _mathResult
mov F_baseAddress, %ebx
pop %ebx

push %eax
mov %eax, F_baseAddress
mov AI_param_value, %eax
pop %eax
call array_includes

pusha #TEST
mov %eax, 4
mov %ebx, AI_return
mul %ebx
mov %ebx, malloc_start
add %ebx, %eax
mov _tempBase, %ebx
mov %ebx, [%ebx]
mov _tempReg, %ebx
popa


push %ebx
mov %ebx, _tempReg
mov F_i, %ebx
pop %ebx


pusha #TEST
mov %eax, 4
mov %ebx, AI_return
mul %ebx
mov %ebx, malloc_end
add %ebx, %eax
mov _tempBase, %ebx
mov %ebx, [%ebx]
mov _tempReg, %ebx
popa


push %ebx
mov %ebx, _tempReg
mov F_endValue, %ebx
pop %ebx

_while_2:

pusha #TEST
mov %eax, 1
mov %ebx, F_i
mul %ebx
mov %ebx, malloc_memory
add %ebx, %eax
mov _tempBase, %ebx
mov %ebx, [%ebx]
mov _tempReg, %ebx
popa

push %eax
push %ebx
mov %eax, 0
mov %ebx, _tempBase
mov [%ebx], %eax
pop %ebx
pop %eax
incw F_i
pusha
mov %eax, F_i
mov %ebx, F_endValue
cmp %eax, %ebx
popa
jl _while_2

pusha #TEST
mov %eax, 4
mov %ebx, AI_return
mul %ebx
mov %ebx, malloc_start
add %ebx, %eax
mov _tempBase, %ebx
mov %ebx, [%ebx]
mov _tempReg, %ebx
popa

push %eax
push %ebx
mov %eax, 0
mov %ebx, _tempBase
mov [%ebx], %eax
pop %ebx
pop %eax

pusha #TEST
mov %eax, 4
mov %ebx, AI_return
mul %ebx
mov %ebx, malloc_end
add %ebx, %eax
mov _tempBase, %ebx
mov %ebx, [%ebx]
mov _tempReg, %ebx
popa

push %eax
push %ebx
mov %eax, 0
mov %ebx, _tempBase
mov [%ebx], %eax
pop %ebx
pop %eax
ret
main:
push %eax
mov %eax, 4
push %ebx
mov %ebx, 4
mul %ebx
pop %ebx
mov _mathResult, %eax
pop %eax
push %eax
mov %eax, _mathResult
mov M_param_size, %eax
pop %eax
call malloc

push %ebx
mov %ebx, _return_int
mov arr1, %ebx
pop %ebx

push %eax
mov %eax, 2
push %ebx
mov %ebx, 4
mul %ebx
pop %ebx
mov _mathResult, %eax
pop %eax
push %eax
mov %eax, _mathResult
mov M_param_size, %eax
pop %eax
call malloc

push %ebx
mov %ebx, _return_int
mov arr2, %ebx
pop %ebx

put_int arr1
new_line
put_int arr2
new_line
push %eax
mov %eax, arr1
mov F_parameter_ptr, %eax
pop %eax
call free
push %ebx
lea %ebx, _dyna_3
mov _tempPointer, %ebx
pop %ebx
put_string _tempPointer
new_line
push %eax
mov %eax, 2
push %ebx
mov %ebx, 4
mul %ebx
pop %ebx
mov _mathResult, %eax
pop %eax
push %eax
mov %eax, _mathResult
mov M_param_size, %eax
pop %eax
call malloc

push %ebx
mov %ebx, _return_int
mov arr3, %ebx
pop %ebx

push %eax
mov %eax, 2
push %ebx
mov %ebx, 4
mul %ebx
pop %ebx
mov _mathResult, %eax
pop %eax
push %eax
mov %eax, _mathResult
mov M_param_size, %eax
pop %eax
call malloc

push %ebx
mov %ebx, _return_int
mov arr4, %ebx
pop %ebx

put_int arr3
new_line
put_int arr4
new_line
   ret
