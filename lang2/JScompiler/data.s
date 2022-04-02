.section .data

_macro_reserved_backup0: .long 0
_macro_reserved_backup1: .long 0
_macro_reserved_backup2: .long 0
_macro_reserved_backup3: .long 0
_macro_reserved_backup4: .long 0
_macro_reserved_backup5: .long 0

_function_return: .long 0

_internalRegCpy: .long 0

_strcmp_result: .byte 1 # 0 means true

_return_int: .int
_return_char: .byte


.macro inc_var addr
    incw [\addr]
.endm

.macro dec_var addr
    decw [\addr]
.endm
    
