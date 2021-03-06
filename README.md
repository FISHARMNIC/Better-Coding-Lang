# Better-Coding-Lang
to run:   
`cd lang2`
`./compile.sh example.txt`
Change `example.txt` to any file that you want to run from.  
Place the file inside the same folder as the `index.js` file

The code is compiled into GNU GAS assembly, and is ran standalone on a virtual machine.
requires:  
1. Grub CLI
2. Xorriso
3. GNU bintutils
4. Qemu
--- 
See [here](https://github.com/FISHARMNIC/Better-Coding-Lang/tree/main/lang2/programs) for quick Ex.

---
# Documentation:  
#### This language is rather similar to `C`. It features pointers, arrays, math, stdio, and more!

## Variables
* Variables are defined with labels like so: `name:`   
* After defining a variable, give it a type: `(type)`  
	* For now, you can use `int` or `char`
	* `Int` is a 32 bit number
* Give it a value (optional): `123`
* If you want to assign it to a string or array, allocate memory for it
	* This is done like so: `(type:size)`
		* Lengths can be auto-assigned with a `?`
	* It's value is then defined after it
	* Arrays are split by `|`
* Examples:
	* `jon: (int*) (int:5) 1|2|3|4|5`
		* `jon` is an array of 5
	* `foo: (char*) (char:?) "hello"`
		* `foo` is a string holding the address of `h`
		* Strings automatically contain the null character
	* `bob: (int) 123`
		* `bob` holds the value `123`

## Stdio
* The library for stdio must be imported like so
	* `#include libs/stdio.s`
* standard out
	* The print function is rather simple
		* `print(%type, value)`
		* `printLn(%type, value)`
	* Examples:
		* `print(%i, 123)`
		* `print(%c, 'A')`
		* `print(%s, foo)`
		* `print(%s, (char:?) "yo")`
* standard in
	* Getting the most recent KP
		* `getKeyboardInput()`
	* reading that value
		* `if(keyboard_out == KEY_A)`

## Control Flow
* loops
	* `repeat(variable, end)` ... `end @repeat`
		* Translates to `for(; variable < end;;) {...}`
* if/elif//else/endif
	* `if(a comp b)`
	* `elif( a comp b)`
	* `else`
	* `endif()`
		* Only should be used at the end of the entire conditional
		* Ex. `if`...`elif`...`else`...`endif()`

## Functions
* `function <name> <return type> (<parameter type> <parameter name>...)`
	* you can also return `void` if you wish
* `return <value>`
* `end @function`
* FUNCTION ARE AUTOEXECUTED
	* To avoid this add a `start main` before your function definitions
	* And then add a `main:` after your functions

## Pointers
* `++* <var>` 
	* Inc. value in pointer
* `* <var>`
	* Calls pointer
* `& <var>`
	* base address of a pointer
* `&<var>`
	* base address variable, function, label
	* note the lack of a space inbetween
* <pointer> *= <pointer>
	* pointer = pointer
	* *not* `x = x * y`
* `<var>[<addr>]`
	* index

## Math
* All statements to be evaluates must be
	* surrounded in `{...}`
	* or `evaluate(...)` DEPRECATED
* Supports: `+,-,x,/,>>,<<,|`
	* Note, the times symbol must be an `x`
* Important
	* The equation `x *= y` does *not* mean times-equal, instead it means `x = y`, where both varibales are pointers

