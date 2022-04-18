// ADD MULTIPLE POINTER PER LINE SUPPORT

const fs = require('fs')
const { exec } = require("child_process");

process.on('uncaughtException', err => {
    process.argv[3] = "debug"
    WriteFile()
    console.log("\ndumped current file into kernel.s\n", err)
})

var typedefs = { //CHECK
    char: [1], // SIZE, ALLIGNEMNT
    void: [1],
    func: [1],
    long: [8],
    int: [4],
    u16: [8],
    u32: [16]
}

var alltypes = [
    "char", "char*", "int", "int*", "void", "void*", "long", "long*", "func*"
]

var in_function_name = 0;
var in_function_parameters = [];

var asmTypedefs = {
    char: ".byte",
    "char*": ".int", //points to an int pos
    int: ".int",
    "int*": ".int",
    long: ".long",
    "long*": ".long",
    u16: ".long",
    "void*": ".long",
    "func*": ".long",
}

var opSuffix = {
    char: "b",
    int: "w",
}

var compares = {
    "==": "je",
    "<=": "jle",
    ">=": "jge",
    "<": "jl",
    ">": "jg",
    "!=": "jne",
}

var code

var outConts = {
    header: `
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
`,
    middle:
        `


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

`,
    footer:
        `
   ret
`
}

var data_section_data = [];
var main_kernel_data = [];
var variables = {}
var variexport;

var lineNumber;
var lineContents = [];
var wordNumber;
var wordContents = []
var nextWordContents = []

var addBuffer = ""

var endRepBind = [];

var tbinding;

var constants = {}
var TempRegUsed = false

var function_returnType
/* #region  AUTOLABEL */

var stringLabelCounter = 0
function dynaLabel(increment = 0) {
    stringLabelCounter += increment;
    return "_dyna_" + (stringLabelCounter - increment)
}

var stringLabelCounter2 = 0
function whileLabel(increment = 0) {
    stringLabelCounter2 += increment;
    return "_while_" + (stringLabelCounter2 - increment)
}

var stringLabelCounter3 = 0
function ifLabel(increment = 0) {
    stringLabelCounter3 += increment;
    return "_notsure_" + (stringLabelCounter3 - increment)
}

var stringLabelCounter4 = 0
function endifLabel(increment = 0) {
    stringLabelCounter4 += increment;
    return "_if_" + (stringLabelCounter4 - increment)
}

var stringLabelCounter5 = 0
function SingleUseLabel(increment = 1) {
    stringLabelCounter5 += increment;
    return "_tempLabel_" + (stringLabelCounter5 - increment)
}
var ifTermVar = 0
function ifTerm(am = 0) {
    ret = `_ifEscape_${ifTermVar}`
    ifTermVar += am
    return ret
}

/* #endregion */

var formattedFunctions = {
    allocate: function (typeSize, value) {
        console.log("allocation:", typeSize, value)
        if (value == undefined) {
            value = '0'
        }
        typeSize = [typeSize.slice(0, typeSize.indexOf(":")), typeSize.slice(typeSize.indexOf(":") + 1)]
        var type = typeSize[0]
        var len = typeSize[1]
        //if (len <= 1) { //Just allocating one block
        // data_section_data.push(
        //     `.comm ${dynaLabel()}, ${typedefs[type][0]}, ${typedefs[type][1]}`
        // )
        //} else {
        if (value[0] == '"' && value.at(-1) == '"') {
            value = value.slice(1, -1).split("").map(x => `'${x}'`)
            value.push("0")
            if (len == "?") {
                len = value.length
            } else {
                len++;
            }
            //console.log(value,len,type)
            //process.exit(0)
        } else {
            value = value.split("|")
        }

        // string or buffer
        if (Number(value.join("")) == 0 && len > 10) {
            data_section_data.push(`${dynaLabel()}: .fill ${len}, ${typedefs[type][0]}`)
        } else {
            data_section_data.push(
                `${dynaLabel()}: `//${asmTypedefs[type]} ${value + "0".repeat(len - value.)}`
            )
            for (i = 0; i < len; i++) {
                data_section_data.push(`${asmTypedefs[type]} ${value[i] ? value[i] : 0}`)
            }
        }
        //}
        tbinding = dynaLabel(0)
        main_kernel_data.push(
            `push %ebx`,
            `lea %ebx, ${dynaLabel(1)}`,
            `mov _tempPointer, %ebx`,
            `pop %ebx`
        )
        lineContents[wordNumber] = '_tempPointer'
        lineContents.splice(wordNumber + 1, 1)
        //console.log("---", lineContents)
    },
    createLabel: function (name, type = "", value = "") {
        console.log("new label:", name, type, value)
        var isPointer = false
        if (type.includes("*")) {
            type = type.slice(0, -1)
            isPointer = true
            data_section_data.push(".section .bss")
        }
        if (type) {
            data_section_data.push(`${name}: .long 0`) //no matter what, we want to store the base pointer
            // if above breaks, replace .long with ${asmTypedefs[type]}
            if (value) {
                main_kernel_data.push(
                    `\npush %ebx`,
                    `mov %ebx, ${value}`,
                    `mov ${name}, %ebx`,
                    `pop %ebx\n`
                )
                //variables[name] = {type,value}
            } //else {
            variables[name] = { type, isPointer, binding: tbinding }
            //}
        } else {
            main_kernel_data.push(`${name}:`)
        }
        if (isPointer) { data_section_data.push(".section .text") }
    },
    "&": function (label) {
        main_kernel_data.push(
            `push %eax`,
            `mov %eax, ${label}`,
            `mov _tempReg, %eax`,
            `pop %eax`
        )
        lineContents[wordNumber] = "_tempReg"
        lineContents.splice(wordNumber + 1, 1)
    },
    "f&": function (label) {
        main_kernel_data.push(
            `push %eax`,
            `lea %eax, ${label}`,
            `mov _tempReg, %eax`,
            `pop %eax`
        )
        lineContents[wordNumber] = "_tempReg"
        lineContents.splice(wordNumber + 1, 1)
    },
    "*": function (label) {
        console.log(variables, label)
        var ist = false
        try {
            ist = variables[label].type == "func"
        } catch (e) { }

        if (ist) {
            lineContents[wordNumber] = `[${label}]`
        } else {
            main_kernel_data.push(
                `push %eax`,
                `mov %eax, ${label}`,
                `mov %eax, [%eax]`,
                `mov _tempReg, %eax`,
                `pop %eax`
            )
            lineContents[wordNumber] = "_tempReg"
        }
        lineContents.splice(wordNumber + 1, 1)
        //console.log("*", lineContents)
        //process.exit(0)
    },
    printNL() {
        main_kernel_data.push(`new_line`)
    },
    arrayIndex: function (base, index) {
        //console.log("aI")
        var tr = "_tempReg"
        var tb = "_tempBase"

        console.log("TR", TempRegUsed)
        if (TempRegUsed) {
            tr = "_tempReg_2"
            tb = "_tempBase_2"
        } else {
            TempRegUsed = true
        }
        console.log("$", base, variables)
        main_kernel_data.push(
            `\npush %eax; push %ebx`,
            `mov %eax, ${typedefs[variables[base].type][0]}`,
            `mov %ebx, ${index}`,
            `mul %ebx`,
            `mov %ebx, ${base}`,
            `add %ebx, %eax`,
            `mov ${tb}, %ebx`,
            `mov %ebx, [%ebx]`, // Remove to get base address
            `mov ${tr}, %ebx`,
            `pop %ebx; pop %eax\n`
        )
        lineContents[wordNumber] = tr
        arrayIndexOGbase = base + (index * typedefs[variables[base].type][0])
        //lineContents.splice(wordNumber + 1, 1)
        // NEED TO KNOW BLOCK SIZES
    },
    printf: function (type, value) {
        var pf = ""
        switch (type) {
            case "%s":
            case "s":
                pf = "put_string "
                break
            case "%c":
            case "c":
                pf = "put_char "
                break
            case "%i":
            case "i":
                pf = "put_int "
        }
        main_kernel_data.push(
            pf + value,
        )
    },
    printLn: function (type, value) {
        this.printf(type, value)
        main_kernel_data.push(
            "new_line"
        )
    },
    "++": function (variable) {
        if (variables[variable].isPointer) {
            main_kernel_data.push(
                `add${opSuffix[variables[variable].type]} ${variable}, ${typedefs[variables[variable].type][0]}`
            )
        } else {
            main_kernel_data.push(
                `inc${opSuffix[variables[variable].type]} ${variable}`,
            )
        }
        lineContents[wordNumber] = variable
        lineContents.splice(wordNumber + 1, 1)
    },
    "++*": function (variable) {
        main_kernel_data.push(
            `push %eax`,
            `mov %eax, ${variable}`,
            `mov %eax, [%eax]`,
            `inc %eax`,
            `mov ${variable}, %eax`,
            `pop %eax`
        )
        lineContents[wordNumber] = variable
        lineContents.splice(wordNumber + 1, 1)
    },
    "--": function (variable) {
        if (variables[variable].isPointer) {
            main_kernel_data.push(
                `sub${opSuffix[variables[variable].type]} ${variable}, ${typedefs[variables[variable].type][0]}`
            )
        } else {
            main_kernel_data.push(
                `dec${opSuffix[variables[variable].type]} ${variable}`,
            )
        }
        lineContents[wordNumber] = variable
        lineContents.splice(wordNumber + 1, 1)
    },
    "--*": function (variable) {
        main_kernel_data.push(
            `push %eax`,
            `mov %eax, ${variable}`,
            `mov %eax, [%eax]`,
            `inc %eax`,
            `mov ${variable}, %eax`,
            `pop %eax`
        )
        lineContents[wordNumber] = variable
        lineContents.splice(wordNumber + 1, 1)
    },
    setVar: function (vari, value) {
        if (addBuffer) {
            main_kernel_data.push(
                `push %eax`,
                `push %ebx`,
                `mov %eax, ${value}`,
                `mov %ebx, _tempBase`,
                `mov [%ebx], %eax`,
                `pop %ebx`,
                `pop %eax`
            )
            addBuffer = false
        } else {
            try {
                if (variables[vari].binding) {
                    vari = variables[vari].binding
                }
            } catch (e) {
                vari = `[${vari}]`
            }
            main_kernel_data.push(
                `push %eax`,
                `mov %eax, ${value}`,
                `mov ${vari}, %eax`,
                `pop %eax`
            )
        }
        lineContents[wordNumber] = vari
        lineContents.splice(wordNumber + 1, 2)
    },
    "=": function (value) {
        variexport = lineContents[wordNumber - 1]
        var vari = lineContents[wordNumber - 1]
        if (vari.includes("[") && vari.includes("]")) {
            addBuffer = true
        } else {
            addBuffer = false
        }
        lineContents[wordNumber - 1] = `setVar`
        lineContents[wordNumber] = vari
        lineContents[wordNumber + 1] = value
        wordContents = lineContents[wordNumber]
        nextWordContents = lineContents[wordNumber + 1]
        //console.log("***", wordContents)
        manipulateBrackets()
        //wordNumber += 1
        //console.log("))))", lineContents)
    },
    "*=": function (value) {
        this["="](value)
        variables[variexport].binding = false
    },
    if: function (v, cmp, v2) {
        main_kernel_data.push(
            `push %eax; push %ebx`,
            `mov %eax, ${v}`,
            `mov %ebx, ${v2}`,
            `cmp %eax, %ebx`,
            `pop %ebx; pop %eax`,
            `${compares[cmp]} ${endifLabel(1)}`, //1
            `jmp ${endifLabel(-1)}`, // 0
            `${endifLabel(1)}:`,//1
        )
    },
    elif: function (v, cmp, v2) {
        main_kernel_data.push(
            `jmp ${ifTerm()}`,
            `${endifLabel(1)}:`,
        )
        this.if(v, cmp, v2)
    },
    else: function () {
        main_kernel_data.push(
            `jmp ${ifTerm()}`,
            `${endifLabel(1)}:`,
        )
    },
    endif: function () {
        main_kernel_data.push(
            `${ifTerm(1)}:`,
            `${endifLabel(1)}:`
        )
    },
    symbol: function (name, value) {
        data_section_data.push(
            `${name} = ${value}`
        )
    },
    repeat: function (vari, end, label) {
        //console.log("%%%", label)
        if (label == undefined) {
            //console.log("***", label)
            endRepBind.push([vari, end])
            main_kernel_data.push(
                `${whileLabel()}:`
            )
        } else {
            //main_kernel_data.push(`${label}:`)
            endRepBind.push([vari, end, label])
        }
    },
    end: function (type) {
        //console.log("chode")
        type += "."
        var parsedType = type.slice(0, type.indexOf("."))
        type = type.split("")
        type.pop()
        type = type.join("")
        var parsedType2 = type.slice(type.indexOf(".") + 1)
        //console.log(":::", parsedType, ":", type)
        switch (parsedType) {
            case "@repeat":
                var tPull = endRepBind.pop()
                if (!type.includes(".")) {
                    //console.log("bye")
                    main_kernel_data.push(
                        `push %eax; push %ebx`,
                        `mov %eax, ${tPull[0]}`,
                        `mov %ebx, ${tPull[1]}`,
                        `cmp %eax, %ebx`,
                        `pop %ebx; pop %eax`,
                        `jl ${whileLabel(1)}`,
                    )
                } else {
                    //console.log("hi")
                    main_kernel_data.push(
                        `push %eax; push %ebx`,
                        `mov %eax, ${tPull[0]}`,
                        `mov %ebx, ${tPull[1]}`,
                        `cmp %eax, %ebx`,
                        `pop %ebx; pop %eax`,
                        `jl ${parsedType2}`,
                    )
                }
                break
            case "@function":
                main_kernel_data.push(
                    `ret`
                )
                in_function_name = 0;
                break
        }
    },
    goto: function (loc) {
        main_kernel_data.push(`jmp ${loc}`)
    },
    mem_dump: function (a, m, l) {
        main_kernel_data.push(`_mem_dump_print ${a}, ${m}, ${l}`)
    },
    sleep: function (amount) {
        amount = Math.round(amount * 2 * 67108863)
        var label = SingleUseLabel()
        main_kernel_data.push(
            `push %eax`,
            `mov %eax, ${amount}`,
            `${label}:`,
            `nop`,
            `sub %eax, 1`,
            `cmp %eax, 0`,
            `jge ${label}`,
            `pop %eax`
        )
    },
    getKeyboardInput: function () {
        main_kernel_data.push(`call read_keyboard`)
        lineContents[wordNumber] = 'keyboard_out'
    },
    arrcpy: function () {
        main_kernel_data.push(
            `push %eax`,
            `push %ebx`,
            `mov %eax, _tempBase_2`,
            `mov %ebx, _tempReg`,
            `mov [%eax], %ebx`,
            `pop %ebx`,
            `pop %eax`,
        )
    },
    return: function (stuff) {
        if (typeof stuff != "undefined") {
            main_kernel_data.push(
                `push %eax`,
                `mov %eax, ${stuff}`,
                `mov _return_${function_returnType}, %eax`,
                `pop %eax`
            )
        }
        main_kernel_data.push(`ret`)
    },
    "#define": function (name, value) {
        constants[name] = value
    },
    sizeof: function (type) {
        lineContents[wordNumber] = typedefs[type][0]
        lineContents.splice(wordNumber + 1, 1)
    },
    "#include": function (file) {
        //console.log(file)
        if (file[0] == "<" && file.at(-1) == ">") {
            file = file.slice(1, -1)
            file = "libs/" + file + `/${file}.txt`
        }
        console.log(file)
        if (file.at(-1) == "s") {
            outConts.header += `\n .include "${file}" \n`
            //global_include_data += String(fs.readFileSync(`${file}`))
        } else {
            code.splice(lineNumber + 1, 0, ...String(fs.readFileSync(`${file}`)).split("\n"))
        }
        //console.log(code)
        //process.exit(0)
    },
    "!!": function (vari) {
        main_kernel_data.push(`not${opSuffix[variables[vari].type]} ${vari}`)
    },
    "clearVGA": function () {
        main_kernel_data.push(`call _clearVGA`)
    },
    "call": function (label) {
        main_kernel_data.push(`call ${label}`)
    },
    "printAddr": function (type, value, index) {
        if (type == "s" || type == "%s") {
            main_kernel_data.push(`put_string ${value}, ${index}`)
        } else if (type == "i" || type == "%i") {
            main_kernel_data.push(`put_int ${value}, ${index}`)
        } else if (type == "c" || type == "%c") {
            main_kernel_data.push(`put_char ${value}, ${index}`)
        } else {
            console.error("Error: Unkown type", type)
        }
    },
    start: function (init) {
        main_kernel_data.push(`jmp ${init}`)
    }
    // END HERE !@#123 FIND SEARCH KEYWORD YUH
    // IF FUNCTIONS BROKEN BECAUSE I MOVED TO UNFORMATTED
}

var unformattedFunctions = {
    evaluate: function (code) {
        main_kernel_data.push(`push %eax`, `mov %eax, ${code[0]}`)// //${parseInt(code[0]) ? code[0] : code[0].includes("[") ? code[0] : `[${code[0]}]`}`) // init in eax
        var evlen = code.findIndex((element, index) => element == "__END_EVALUATE__")
        var absFin = evlen + wordNumber
        var absStart = wordNumber
        var ac = [...lineContents]
        ac.splice(absStart, absFin, "_mathResult")
        //console.log("ends", lineContents, absStart, absFin, ac)
        code.splice(evlen, 1)
        //console.log("LEN:", evlen, code)
        for (var itemNum = 1; itemNum < code.length - 1; itemNum += 2) { //go by ops
            var item = {
                current: code[itemNum],
                previous: code[itemNum - 1],//parseInt(code[itemNum - 1]) ? code[itemNum - 1] : `[${code[itemNum - 1]}]`,
                next: code[itemNum + 1]//parseInt(code[itemNum + 1]) ? code[itemNum + 1] : `[${code[itemNum + 1]}]`
            }
            //console.log("#", item)
            main_kernel_data.push(...((inD) => {
                switch (inD.current) {
                    case "+":
                        return [`add %eax, ${inD.next}`]
                    case "-":
                        return [`sub %eax, ${inD.next}`]
                    case "x":
                        return [
                            `push %ebx`,
                            `mov %ebx, ${inD.next}`,
                            `mul %ebx`,
                            `pop %ebx`
                        ]
                    case "/":
                        return [
                            `push %ebx`,
                            `mov %ebx, ${inD.next}`,
                            `div %ebx`,
                            `pop %ebx`
                        ]
                    case "%":
                        return [
                            `push %ebx`,
                            `push %edx`,
                            `mov %ebx, ${inD.next}`,
                            `div %ebx`,
                            `mov %eax, %edx`,
                            `pop %edx`,
                            `pop %ebx`
                        ]
                    case "|":
                        return [
                            `push %ebx`,
                            `mov %ebx, ${inD.next}`,
                            `or %eax, %ebx`,
                            `pop %ebx`,
                        ]
                    case "<<":
                        return [
                            `push %ecx`,
                            `mov %cl, ${inD.next}`,
                            `shl %eax, %cl`,
                            `pop %ecx`,
                        ]
                    case ">>":
                        return [
                            `push %ecx`,
                            `mov %cl, ${inD.next}`,
                            `shr %eax, %cl`,
                            `pop %ecx`,
                        ]
                }
            })(item))

        }

        main_kernel_data.push(`mov _mathResult, %eax`, `pop %eax`)

        lineContents = [...ac]
        //lineContents.splice(wordNumber + 1, evlen)
        //console.log("------", lineContents)
    },
    "function": function (code) {
        var name = code[0]
        var type = code[1]
        var parameters = code.slice(2).filter(x => !alltypes.includes(x))
        var parameterTypes = code.slice(2).filter(x => alltypes.includes(x))
        in_function_name = name;
        in_function_parameters = parameters.map(x => `__${x}__`);
        parameters.forEach((x, i) => {
            var t_Name = `__${in_function_name}${x}__`
            if (!Object.keys(variables).includes(x)) {
                data_section_data.push(`__${in_function_name}${x}__: ${asmTypedefs[parameterTypes[i]]} 0 `)
            }
            var isPointer = false;
            console.log(code, parameters, code.slice(1))
            if (parameterTypes[i].includes("*")) {
                isPointer = true;
                parameterTypes[i] = parameterTypes[i].slice(0, -1)
            }
            variables[t_Name] = { type: parameterTypes[i], isPointer, binding: tbinding }
        })

        //console.log("###---##", type, parameters)
        main_kernel_data.push(
            `${name}:`
        )

        if (parameters.length > 0) { //params?
            if (String(type) != "undefined") { //return type
                function_returnType = type
                eval(`
            this[name] = function (${parameters.join(",")}) {
                var infname = "${in_function_name}"
                //console.log("123123", arguments)
                var pNames = ${"['" + parameters.join("','") + "']"}

                main_kernel_data.push('push %eax')
                pNames.forEach((x,ind) => {
                    if(variables[\`__\${infname}\${x}__\`].type == "func") {
                        main_kernel_data.push(
                            \`lea %eax, \${arguments[0][ind]}\`,
                            \`mov __\${infname}\${x}__, %eax\` 
                        )
                    } else {
                        main_kernel_data.push(
                            \`mov %eax, \${arguments[0][ind]}\`,
                            \`mov __\${infname}\${x}__, %eax\`
                        )
                    }
                })

                main_kernel_data.push('pop %eax')
                main_kernel_data.push(\`call \${name}\`)
                lineContents[wordNumber] = \`_return_${type}\`
                lineContents.splice(wordNumber + 1, ${parameters.length})
                //console.log("@@@", lineContents)
            }`)
            } else {
                eval(`
            this[name] = function () {
                main_kernel_data.push(\`call \${name}\`)
            }
            `)
            }
        } else {
            if (String(type) != "undefined") { //return type
                function_returnType = type
                eval(`
            this[name] = function (${parameters.join(",")}) {
                main_kernel_data.push(\`call \${name}\`)
                lineContents[wordNumber] = \`_return_${type}\`
            }`)
            } else {
                eval(`
        this[name] = function () {
            main_kernel_data.push(\`call \${name}\`)
        }
        `)
            }
        }
    },
    "sysMac": function (code) {
        var name = code[0]
        var rest = code.slice(1)
        main_kernel_data.push(`${name} ${rest.join(",")}`)
    },
    "sysmac": function (code) {
        this.sysMac(code)
    }
}
    ; (function main() {
        code = String(fs.readFileSync(String(process.argv[2]))).split("\n")
        for (lineNumber = 0; lineNumber < code.length; lineNumber++) {
            tbinding = undefined
            lineContents = manipulateLine(code[lineNumber])
            TempRegUsed = false

            if (lineContents[0] == "for") {
                formattedFunctions.forLoop(...lineContents.slice(1))
                //console.log("________", lineContents)
            } else {

                for (wordNumber = lineContents.length - 1; wordNumber >= 0; wordNumber--) {
                    wordContents = lineContents[wordNumber]
                    nextWordContents = lineContents[wordNumber + 1]

                    manipulateBrackets()

                    //console.log(Object.values(formattedFunctions))

                    if (wordContents.includes(":")) {
                        //IF IS VARIABLE?

                        if (Object.keys(asmTypedefs).includes(wordContents.slice(0, wordContents.indexOf(":")))) {
                            formattedFunctions.allocate(wordContents, nextWordContents)
                        } else {
                            formattedFunctions.createLabel(wordContents.slice(0, -1), nextWordContents, lineContents[wordNumber + 2])
                        }
                    }

                    else if (Object.keys(formattedFunctions).includes(wordContents)) {
                        var pArr = lineContents.slice(wordNumber + 1, wordNumber + 1 + formattedFunctions[wordContents].length)
                        console.log("exec:", `FUNCTION \x1b[32m${wordContents}\x1b[0m :: ARGS \x1b[34m${pArr}\x1b[0m `)

                        formattedFunctions[wordContents](...pArr)
                    } else if (Object.keys(unformattedFunctions).includes(wordContents)) {
                        //console.log("$$$", lineContents.slice(wordNumber + 1))
                        unformattedFunctions[wordContents](lineContents.slice(wordNumber + 1))
                    }

                    if (wordContents[0] == "&") {
                        //console.log(wordContents)
                        lineContents[wordNumber] = wordContents.substring(1)
                    }

                    // var t_gid = global_include_data.indexOf(`.macro ${lineContents[wordNumber]}`)
                    // if(t_gid != -1) {
                    //     main_kernel_data.push()
                    // }
                    // if (wordContents[0] == "*" && wordContents.length != 0) {
                    //     console.log(wordContents)
                    //     lineContents[wordNumber] = "*"
                    //     lineContents.splice(wordNumber + 1, 0, wordContents.substring(1))
                    //     console.log("out", lineContents)
                    //     wordNumber += 2;
                    // }
                }
            }
        }

        WriteFile()
    })()

function manipulateLine(contents) {
    //contents = contents.replace(/\(|\,|\:|\)/g, " ").split(" ").filter(x => x)
    //console.log("BF:" + contents + ":")
    // if (contents != "" ) {
    // contents = contents.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
    // }
    contents = contents.replace(/,/g, ' ')
    contents = contents.replace(/{/g, 'evaluate ')
    contents = contents.replace(/}/g, '(__END_EVALUATE__)')
    contents = contents.replace(/[\(\)]/g, ' ').split(" ").filter(x => x)//.join(" ");
    contents = contents.map(x => Object.keys(constants).includes(x) ? constants[x] : x)
    if (in_function_name != 0) { contents = contents.map(x => in_function_parameters.includes(`__${x}__`) ? `__${in_function_name}${x}__` : x) }
    //console.log("AM", contents)
    if (contents[0] == "#") { contents = [] }
    //manipulate the line here
    return contents
}

function manipulateBrackets() {
    if (wordContents.includes("[") && wordContents.includes("]")) {
        var arr = wordContents.slice(0, wordContents.indexOf("["))
        var index = wordContents.slice(wordContents.indexOf("[") + 1, wordContents.indexOf("]"))
        if (in_function_name != 0 && in_function_parameters.includes(`__${arr}__`)) {
            arr = `__${in_function_name}${arr}__`
        }
        lineContents[wordNumber] = `arrayIndex ${arr} ${index}`
        //console.log("@@@@", `arrayIndex ${arr} ${index}`)
        formattedFunctions.arrayIndex(arr, index)
    }
}

function shellExec() {
    console.log("running")
    exec("./shellExec.sh", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    })
}



function WriteFile() {
    //console.log("---exec---")
    fs.writeFileSync('kernel.s', outConts.header + data_section_data.join("\n") + outConts.middle + main_kernel_data.join("\n") + outConts.footer)
    if (process.argv[3] != "debug") {
        shellExec()
    } else {
        //console.log("debug mode on")
    }

}