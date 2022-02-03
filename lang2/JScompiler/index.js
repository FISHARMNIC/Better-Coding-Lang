const fs = require('fs')
const { exec } = require("child_process");

var typedefs = { //CHECK
    char: [1, 0], // SIZE, ALLIGNEMNT
    //int8: [1, 0],
    int: [4, 1],
    //int16: [2, 1],
    int32: [4, 1]
}

var asmTypedefs = {
    char: ".byte",
    //int8: ".byte",
    int: ".int",
    //int16: ".short",
    int32: ".long"
}

var outConts = {
    header: `
.intel_syntax
.org 0x100
.global kernel_entry

_lineNumber: .long 0
_mathResult: .long 0
_mathFloat: .float 0
_tempReg: .long 0
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
var variables = {}

var lineNumber;
var lineContents = [];
var wordNumber;
var wordContents = []
var nextWordContents = []

var stringLabelCounter = 0
function dynaLabel(increment = 0) {
    stringLabelCounter += increment;
    return "L_bozo" + (stringLabelCounter - increment)
}

var formattedFunctions = {
    allocate: function (typeSize, value) {
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
            if(len == "?") {
                len = value.length
            } else {
                len++;
            }
            //console.log(value,len,type)
            //process.exit(0)
        } else {
            value = value.split("|")
        }
        data_section_data.push(
            `${dynaLabel()}: `//${asmTypedefs[type]} ${value + "0".repeat(len - value.)}`
        )
        for (i = 0; i < len; i++) {
            data_section_data.push(`${asmTypedefs[type]} ${value[i] ? value[i] : 0}`)
        }
        //}
        main_kernel_data.push(
            `push %ebx`,
            `lea %ebx, ${dynaLabel(1)}`,
            `mov _tempPointer, %ebx`,
            `pop %ebx`
        )
        lineContents[wordNumber] = '_tempPointer'
        lineContents.splice(wordNumber + 1, 1)
        console.log("---", lineContents)
    },
    createLabel: function (name, type = "", value = "") {
        //console.log("$$$$", lineContents)
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
            }
            variables[name] = { type: type, value: value }
        } else {
            main_kernel_data.push(`${name}:`)
        }
    },
    "&": function (label) {
        main_kernel_data.push(
            `push %eax`,
            `lea %eax, ${label}`,
            `mov _tempReg, %eax`,
            `pop %eax`
        )
        lineContents[wordNumber] = "_tempReg"
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
    },
    put_int: function (stuff) {
        main_kernel_data.push(`put_int ${stuff}`)
    },
    put_char: function (stuff) {
        main_kernel_data.push(`put_char ${stuff}`)
    },
    arrayIndex: function (base, index) {
        console.log("aI")
        main_kernel_data.push(
            `\npusha`,
            `mov %eax, ${typedefs[variables[base].type][0]}`,
            `mov %ebx, ${index}`,
            `mul %ebx`,
            `mov %ebx, ${base}`,
            `add %ebx, %eax`,
            `mov %ebx, [%ebx]`, // Remove to get base address
            `mov _tempReg, %ebx`,
            `popa\n`
        )
        lineContents[wordNumber] = `_tempReg`
        lineContents.splice(wordNumber + 1, 1)
        // NEED TO KNOW BLOCK SIZES
    },
    printLn: function (type, value) {
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
            "new_line"
        )
    }
}

var unformattedFunctions = {

}
    ; (function main() {
        var code = String(fs.readFileSync(String(process.argv[2]))).split("\n")
        for (lineNumber = 0; lineNumber < code.length; lineNumber++) {
            lineContents = manipulateLine(code[lineNumber])

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
                    //console.log("huevos", pArr)
                    formattedFunctions[wordContents](...pArr)
                }
            }
        }

        WriteFile()
    })()

function manipulateLine(contents) {
    //contents = contents.replace(/\(|\,|\:|\)/g, " ").split(" ").filter(x => x)
    console.log("BF:" + contents + ":")
    // if (contents != "" ) {
    // contents = contents.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
    // }
    contents = contents.replace(/,/g, ' ')
    contents = contents.replace(/[\(\)]/g, ' ').split(" ").filter(x => x)//.join(" ");
    console.log("AM", contents)
    if (contents[0] == "#") { contents = [] }
    //manipulate the line here
    return contents
}

function manipulateBrackets() {
    if (wordContents.includes("[") && wordContents.includes("]")) {
        var arr = wordContents.slice(0, wordContents.indexOf("["))
        var index = wordContents.slice(wordContents.indexOf("[") + 1, wordContents.indexOf("]"))
        lineContents[wordNumber] = `arrayIndex ${arr} ${index}`
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