// ADD MULTIPLE POINTER PER LINE SUPPORT

const fs = require('fs')
const { exec } = require("child_process");

var typedefs = { //CHECK
    char: [1], // SIZE, ALLIGNEMNT
    void: [1],
    long: [8],
    int: [4],
    u16: [8],
    u32: [16]
}

var asmTypedefs = {
    char: ".byte",
    int: ".int",
    long: ".long",
    u16: ".long"
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

_lineNumber: .long 0
_mathResult: .long 0
_mathFloat: .float 0

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
    pusha
    mov %dx, 0x3D4
    mov %al, 0xA	 # disable cursor
    out %dx, %al
    inc %dx
    mov %al, 0x20 # disable cursor
    out %dx, %al
    popa

`,
    footer:
        `
   ret
`
}

var data_section_data = [];
var main_kernel_data = [];
var init_section_data = []
var variables = {}

var lineNumber;
var lineContents = [];
var wordNumber;
var wordContents = []
var nextWordContents = []

var addBuffer = ""

var endRepBind = [];

var tbinding;
var arrayIndexOGbase;

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

        if (Number(value.join("")) == 0 && len > 10) {
            data_section_data.push(`${dynaLabel()}: .fill ${len}, ${typedefs[type][0]}`)
        } else {
            //console.log(!value[0], value[0])
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
        //console.log("$$$$", lineContents)
        var isPointer = false
        if (type.includes("*")) {
            type = type.slice(0, -1)
            isPointer = true
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
    "*": function (label) {
        main_kernel_data.push(
            `push %eax`,
            `mov %eax, ${label}`,
            `mov %eax, [%eax]`,
            `mov _tempReg, %eax`,
            `pop %eax`
        )
        lineContents[wordNumber] = "_tempReg"
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

        if (TempRegUsed) {
            tr = "_tempReg_2"
            tb = "_tempBase_2"
        } else {
            TempRegUsed = true
        }
        //console.log(base, variables)
        main_kernel_data.push(
            `\npusha #TEST`,
            `mov %eax, ${typedefs[variables[base].type][0]}`,
            `mov %ebx, ${index}`,
            `mul %ebx`,
            `mov %ebx, ${base}`,
            `add %ebx, %eax`,
            `mov ${tb}, %ebx`,
            `mov %ebx, [%ebx]`, // Remove to get base address
            `mov ${tr}, %ebx`,
            `popa\n`
        )
        lineContents[wordNumber] = `_tempReg`
        arrayIndexOGbase = base + (index * typedefs[variables[base].type][0])
        //lineContents.splice(wordNumber + 1, 1)
        // NEED TO KNOW BLOCK SIZES
    },
    print: function (type, value) {
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
        this.print(type, value)
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
    },
    "++*": function (variable) {
        main_kernel_data.push(
            `pusha`,
            `mov %eax, ${variable}`,
            `mov %eax, [%eax]`,
            `inc %eax`,
            `mov ${variable}, %eax`,
            `popa`
        )
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
    },
    "--*": function (variable) {
        main_kernel_data.push(
            `pusha`,
            `mov %eax, ${variable}`,
            `mov %eax, [%eax]`,
            `inc %eax`,
            `mov ${variable}, %eax`,
            `popa`
        )
    },
    setVar: function (vari, value) {
        //console.log("cock", vari, value, addBuffer, variables)

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
    },
    "=": function (value) {
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
    if: function (v, cmp, v2) {
        main_kernel_data.push(
            `pusha`,
            `mov %eax, ${v}`,
            `mov %ebx, ${v2}`,
            `cmp %eax, %ebx`,
            `popa`,
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
    endif: function () {
        main_kernel_data.push(
            `${ifTerm(1)}:`,
            `${endifLabel(1)}:`
        )
    },
    strlen: function (base) {
        main_kernel_data.push(
            `strlen ${base}`
        )
        lineContents[wordNumber] = "_function_return"
        lineContents.splice(wordNumber + 1, 1)
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
                        `pusha`,
                        `mov %eax, ${tPull[0]}`,
                        `mov %ebx, ${tPull[1]}`,
                        `cmp %eax, %ebx`,
                        `popa`,
                        `jl ${whileLabel(1)}`,
                    )
                } else {
                    //console.log("hi")
                    main_kernel_data.push(
                        `pusha`,
                        `mov %eax, ${tPull[0]}`,
                        `mov %ebx, ${tPull[1]}`,
                        `cmp %eax, %ebx`,
                        `pushf`,
                        // `inc${opSuffix[variables[endRepBind[0]].type]} ${endRepBind[0]}`,
                        `popf`,
                        `popa`,
                        `jl ${parsedType2}`,
                    )
                }
                break
            case "@function":
                main_kernel_data.push(
                    `ret`
                )
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
        if (file.at(-1) == "s") {
            outConts.header += `\n .include "${file}" \n`
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
    }
    // END HERE !@#123 FIND SEARCH KEYWORD YUH
    // IF FUNCTIONS BROKEN BECAUSE I MOVED TO UNFORMATTED
}

var unformattedFunctions = {
    evaluate: function (code) {
        main_kernel_data.push(`push %eax`, `mov %eax, ${code[0]}`)// //${parseInt(code[0]) ? code[0] : code[0].includes("[") ? code[0] : `[${code[0]}]`}`) // init in eax
        var evlen = code.findIndex((element, index) => element == "__END_EVALUATE__" && index > wordNumber)
        
        //lineContents.splice(wordNumber + evlen, 1)
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

        lineContents[wordNumber] = '_mathResult'
        //lineContents.splice(wordNumber + 1, evlen)
        //console.log("------", lineContents)
    },
    "function": function (code) {
        var name = code[0]
        var type = code[1]
        var parameters = code.slice(2).filter(x => !Object.keys(typedefs).includes(x))
        var parameterTypes = code.slice(2).filter(x => Object.keys(typedefs).includes(x))

        parameters.forEach((x, i) => {
            if (!Object.keys(variables).includes(x)) {
                data_section_data.push(`${x}: .${parameterTypes[i]} 0 `)
            }
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
                //console.log("123123", arguments)
                var pNames = ${"['" + parameters.join("','") + "']"}

                main_kernel_data.push('push %eax')
                pNames.forEach((x,ind) => {
                    main_kernel_data.push(
                        \`mov %eax, \${arguments[0][ind]}\`,
                        \`mov \${x}, %eax\`
                    )
                })

                main_kernel_data.push('pop %eax')
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
    //console.log("AM", contents)
    if (contents[0] == "#") { contents = [] }
    //manipulate the line here
    return contents
}

function manipulateBrackets() {
    if (wordContents.includes("[") && wordContents.includes("]")) {
        var arr = wordContents.slice(0, wordContents.indexOf("["))
        var index = wordContents.slice(wordContents.indexOf("[") + 1, wordContents.indexOf("]"))
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