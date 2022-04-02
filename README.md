# Better-Coding-Lang
to run:  
`cd JScompiler`  
`node index program.txt`
Change `program.txt` to any file that you want to run from.  
Place the file inside the same folder as the `index.js` file

The code is compiled into GNU GAS assembly, and is ran standalone on a virtual machine.
requires:  
1. Grub CLI
2. Xorriso
3. GNU bintutils
4. Qemu

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
* if/elif/endif
	* `if(a comp b)`
	* `elif( a comp b)`
	* `endif()`

## Functions
* `function <name> <return type> (<parameter type> <parameter name>...)`
	* you can also return `void` if you wish
* `return <value>`
* `end @function`
* FUNCTION ARE AUTOEXECUTED
	* To avoid this add a `goto main` before your functions
	* And then add a `main:` after your functions

## Pointers
* `++* <var>` 
	* Inc. value in pointer
* `*`
	* Calls pointer
* `&`
	* base address of a variable
* `<var>[<addr>]`
	* index

## Math
* All statements to be evaluates must be
	* surrounded in `{...}`
	* or `evaluate(...)`
* Supports: `+,-,x,/,>>,<<,|`
	* Note, the times symbol must be an `x`
