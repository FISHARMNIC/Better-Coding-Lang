BLACK = 0 # vga color for black = 0
WHITE = 15 # vga color for white = 15
VGA_ADDR = = 0xB8000


KEYBOARD_PORT = = 0x60
 KEY_A = 0x1E
 KEY_B = 0x30
 KEY_C = 0x2E
 KEY_D = 0x20
 KEY_E = 0x12
 KEY_F = 0x21
 KEY_G = 0x22
 KEY_H = 0x23
 KEY_I = 0x17
 KEY_J = 0x24
 KEY_K = 0x25
 KEY_L = 0x26
 KEY_M = 0x32
 KEY_N = 0x31
 KEY_O = 0x18
 KEY_P = 0x19
 KEY_Q = 0x10
 KEY_R = 0x13
 KEY_S = 0x1F
 KEY_T = 0x14
 KEY_U = 0x16
 KEY_V = 0x2F
 KEY_W = 0x11
 KEY_X = 0x2D
 KEY_Y = 0x15
 KEY_Z = 0x2C
 KEY_1 = 0x02
 KEY_2 = 0x03
 KEY_3 = 0x04
 KEY_4 = 0x05
 KEY_5 = 0x06
 KEY_6 = 0x07
 KEY_7 = 0x08
 KEY_8 = 0x09
 KEY_9 = 0x0A
 KEY_0 = 0x0B
 KEY_MINUS = 0x0C
 KEY_EQUAL = 0x0D
 KEY_SQUARE_OPEN_BRACKET = 0x1A
 KEY_SQUARE_CLOSE_BRACKET = 0x1B
 KEY_SEMICOLON = 0x27
 KEY_BACKSLASH = 0x2B
 KEY_COMMA = 0x33
 KEY_DOT = 0x34
 KEY_FORESLHASH = 0x35
 KEY_F1 = 0x3B
 KEY_F2 = 0x3C
 KEY_F3 = 0x3D
 KEY_F4 = 0x3E
 KEY_F5 = 0x3F
 KEY_F6 = 0x40
 KEY_F7 = 0x41
 KEY_F8 = 0x42
 KEY_F9 = 0x43
 KEY_F10 = 0x44
 KEY_F11 = 0x85
 KEY_F12 = 0x86
 KEY_BACKSPACE = 0x0E
 KEY_DELETE = 0x53
 KEY_DOWN = 0x50
 KEY_END = 0x4F
 KEY_ENTER = 0x1C
 KEY_ESC = 0x01
 KEY_HOME = 0x47
 KEY_INSERT = 0x52
 KEY_KEYPAD_5 = 0x4C
 KEY_KEYPAD_MUL = 0x37
 KEY_KEYPAD_Minus = 0x4A
 KEY_KEYPAD_PLUS = 0x4E
 KEY_KEYPAD_DIV = 0x35
 KEY_LEFT = 0x4B
 KEY_PAGE_DOWN = 0x51
 KEY_PAGE_UP = 0x49
 KEY_PRINT_SCREEN = 0x37
 KEY_RIGHT = 0x4D
 KEY_SPACE = 0x39
 KEY_TAB = 0x0F
 KEY_UP = 0x48

_lineNumber: .long 0
_vga_entry:
    # uses cl as the char register
    # uses ebx as the location register
    shl %ebx, 1 # multiply by 2
    mov %ch, BLACK # 0 is black, the background
    shl %ch, 4
    or %ch, WHITE # 15 is white, the foreground
    movw [%ebx + VGA_ADDR], %cx # writes the 16bit data into the memory address
    ret

.macro put_char c, i = _lineNumber # character, index
    pusha # save the values
    mov %cl, \c # prepare the character register
    mov %ebx, \i # prepare the index register
    # call _vga_entry # call the display
    shl %ebx, 1 # multiply by 2
    mov %ch, BLACK # 0 is black, the background
    shl %ch, 4
    or %ch, WHITE # 15 is white, the foreground
    movw [%ebx + VGA_ADDR], %cx # writes the 16bit data into the memory address
    popa
    incw [_lineNumber]
.endm