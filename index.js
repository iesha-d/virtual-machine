
const canvas = document.getElementById("right-output");
const ctx = canvas.getContext("2d");
ctx.fillStyle = `rgb(${224}, ${224}, ${224})`;

OPCODES = ["mov", "set", "add", "sub", "mul", "div", "mod", "sto", "loa", 
"jmp", "je", "jne", "jle", "jge", "jl", "jg", "and", "or", "not", "halt", "col", "px"];

function onlyLettersAndNumbers(str) {
    return /^[a-z0-9]+$/.test(str);
}

function onlyLetters(str) {
    return /^[a-z]+$/.test(str);
}

function parseLine(line) {
    let newLine = line.toLowerCase();

    let result = {
        label: null,
        opcode: null,
        args: []
    };
    
    for (let i = 0; i < newLine.length; i++) {
        if (newLine[i] == ':') {
            label = newLine.substring(0, i); 
            label.trim();
            if (!onlyLettersAndNumbers(label)) {
                return null;
            }
            result.label = label;
            newLine = newLine.substring(i + 1, newLine.length);
            break;
        } 
    }

    newLine = newLine.trim();
    if (newLine === "" && result.label !== "") {
        return result; 
    }
    for (let i = 0; i <= newLine.length; i++) {
        if (i >= newLine.length || !onlyLetters(newLine[i])) {
            opcode = newLine.substring(0, i);
            if (i === 0 || !OPCODES.includes(opcode)) {
                return null;
            } else {
                result.opcode = opcode;
                newLine = newLine.substring(i, newLine.length);
                break;
            }
        }
    }

    newLine = newLine.trim();
    args = newLine.split(',');
    for (let i = 0; i < args.length; i++) {
        arg = args[i].trim();
        result.args.push(arg);
    }
    return result;
}

console.log(parseLine("label:"));
console.log(parseLine("set"));
console.log(parseLine("a:set"));
console.log(parseLine("a:mov r1,r2,r3"));


function parse(text) {
    let modifiedLines = [];
    let lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
        lines[i] = lines[i].trim();
        if (lines[i] !== "") {
            modifiedLines.push(lines[i]);
        }
    }
    let parsedLines = [];
    let onlyLabel = false;
    for (let i = 0; i < modifiedLines.length; i++) {
        onlyLabel = false;
        modifiedLines[i] = modifiedLines[i].trim();
        if (modifiedLines[i][modifiedLines[i].length - 1] == ':') {
            onlyLabel = true;
            modifiedLines[i] = modifiedLines[i] + modifiedLines[i + 1];
        }
        let parsed = parseLine(modifiedLines[i]);
        if (parsed !== null) {
            parsedLines.push(parsed);
        }
        if (onlyLabel) {
            i += 1;
        }
    }

    for (let i = 0; i < parsedLines.length; i++) {
        parsedLines[i] = postProcessCommand(parsedLines[i]);
    }

    return parsedLines;
}

function postProcessCommand(command) {
    let parsedCommand = command;
    for (let i = 0; i < parsedCommand.args.length; i++) {
        const arg = parsedCommand.args[i];
        if (arg[0] == 'r' && !isNaN(parseInt(arg.substring(1)))) {
            parsedCommand.args[i] = {type: "register", index: parseInt(arg.substring(1))};
        } else if (!isNaN(parseInt(arg))) {
            parsedCommand.args[i] = {type: "number", index: parseInt(arg)};
        } else {
            parsedCommand.args[i] = {type: "string", index: arg};
        }
    }
    return parsedCommand;
}

class VirtualMachine {
    constructor(parsedCode) {
        this.memory = new Array(1000).fill(0);
        this.registers = new Array(16).fill(0);
        this.ip = 0; // instruction pointer - index of instr we're about to run
        this.code = parsedCode;
        this.done = false;  // true if processor reaches end of code

        this.labels = new Map();
        for (let i = 0; i < this.code.length; i++) {
            if (this.code[i].label !== null) {
                this.labels.set(this.code[i].label, i);
            }
        }

        this.updateScreen();
    }

    runOneInstruction() {
        if (this.ip >= this.code.length) {
            throw "ip is out of range";
        }

        let parsedCode = this.code[this.ip];

        
        switch(parsedCode.opcode) {
            case "halt":
                break;

            case "mov":
                this.registers[parsedCode.args[0].index] = this.registers[parsedCode.args[1].index];
                this.ip++;
                break;

            case "set":
                this.registers[parsedCode.args[0].index] = parsedCode.args[1].index;
                this.ip++;
                break;

            case "add":
                this.registers[parsedCode.args[0].index] += this.registers[parsedCode.args[1].index];
                this.ip++;
                break;

            case "sub":
                this.registers[parsedCode.args[0].index] -= this.registers[parsedCode.args[1].index];
                this.ip++;
                break;

            case "mul":
                this.registers[parsedCode.args[0].index] *= this.registers[parsedCode.args[1].index];
                this.ip++;
                break;

            case "div":
                this.registers[parsedCode.args[0].index] /= this.registers[parsedCode.args[1].index];
                this.ip++;
                break;

            case "mod":
                this.registers[parsedCode.args[0].index] %= this.registers[parsedCode.args[1].index];
                this.ip++;
                break;

            case "sto":
                const addr = this.registers[parsedCode.args[0].index];
                const toStore = this.registers[parsedCode.args[1].index];
                if (addr < 1000) {
                    this.memory[addr] = toStore;
                } else if (addr === 1000) {
                    String.fromCharCode(toStore) + document.querySelector("#console-output").value;
 
                } else if (addr === 1001) {
                    addr + document.querySelector("#console-output").value;
                } else if (addr >= 10000) {
                    break;
                }
                this.ip++;
                break;
            
            case "loa":
                this.registers[parsedCode.args[0].index] = this.memory[
                    this.registers[parsedCode.args[0].index]
                ];
                this.ip++;
                break;

            case "jmp":
                let newIP = this.labels.get(parsedCode.args[0].index);
                if (newIP === undefined) {
                    throw "invalid label"
                } else {
                    this.ip = newIP;
                }
                break;

            case "je":
                if (this.registers[parsedCode.args[0].index] == this.registers[parsedCode.args[1].index]) {
                    let newIP = this.labels.get(parsedCode.args[2].index);
                    if (newIP === undefined) {
                        throw "invalid label"
                    } else {
                        this.ip = newIP;
                    }
                } else {
                    this.ip++;
                }
                break;

            case "jne":
                if (this.registers[parsedCode.args[0].index] !== this.registers[parsedCode.args[1].index]) {
                    let newIP = this.labels.get(parsedCode.args[2].index);
                    if (newIP === undefined) {
                        throw "invalid label"
                    } else {
                        this.ip = newIP;
                    }
                } else {
                    this.ip++;
                }
                break;
            
            case "jle":
                if (this.registers[parsedCode.args[0].index] <= this.registers[parsedCode.args[1].index]) {
                    let newIP = this.labels.get(parsedCode.args[2].index);
                    if (newIP === undefined) {
                        throw "invalid label"
                    } else {
                        this.ip = newIP;
                    }
                } else {
                    this.ip++;
                }
                break;

            case "jge":
                if (this.registers[parsedCode.args[0].index] >= this.registers[parsedCode.args[1].index]) {
                    let newIP = this.labels.get(parsedCode.args[2].index);
                    if (newIP === undefined) {
                        throw "invalid label"
                    } else {
                        this.ip = newIP;
                    }
                } else {
                    this.ip++;
                }
                break;

            case "jg":
                if (this.registers[parsedCode.args[0].index] > this.registers[parsedCode.args[1].index]) {
                    let newIP = this.labels.get(parsedCode.args[2].index);
                    if (newIP === undefined) {
                        throw "invalid label"
                    } else {
                        this.ip = newIP;
                    }
                } else {
                    this.ip++;
                }
                break;

            case "jl":
                if (this.registers[parsedCode.args[0].index] < this.registers[parsedCode.args[1].index]) {
                    let newIP = this.labels.get(parsedCode.args[2].index);
                    if (newIP === undefined) {
                        throw "invalid label"
                    } else {
                        this.ip = newIP;
                    }
                } else {
                    this.ip++;
                }
                break;

            case "and":
                this.registers[parsedCode.args[0].index] &= this.registers[parsedCode.args[1].index];
                break;

            case "or":
                this.registers[parsedCode.args[0].index] |= this.registers[parsedCode.args[1].index];
                break;
            
            case "not":
                this.registers[parsedCode.args[0].index] = ~this.registers[parsedCode.args[1].index];
                break;

            case "col":
                let r = this.registers[parsedCode.args[0].index];
                let g = this.registers[parsedCode.args[1].index];
                let b = this.registers[parsedCode.args[2].index];
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                this.ip++;
                break;

            case "px":  
                ctx.fillRect(
                    4*this.registers[parsedCode.args[1].index],
                    4*this.registers[parsedCode.args[0].index], 
                    4, 4);
                this.ip++;
                break;
        }
    }

    updateScreen() {
        this.updateRegisterDisplay();
    }

    updateRegisterDisplay() {
        let str = "";
        for (let line = 0; line < 8; line++) {
            for (let x = line; x <= line + 8; x += 8) {
                let item = (x < 10 ? " R" : "R");
                item += x;
                item += ": ";
                item += this.registers[x];
                while (item.length < 15) item += " ";
                str += item;
            }
            if (line < 7) str += "\n";
        }
        str += "\n IP: ";
        str += this.ip;
        
        document.querySelector("#registers").innerHTML = `<pre>${str}</pre>`;
    }
} 


let VM = null;
document.querySelector("#compiler-button").addEventListener("click", () => {
    const text = document.querySelector("#main-code").value;
    code = parse(text);
    console.log(code);

    if (!Array.isArray(code)) {
        console.log("exception");
    } else {
        VM = new VirtualMachine(code);
        console.log(VM.parsedCode);
    }
});


document.querySelector("#run-button").addEventListener("click", () => {
    if (VM !== null) {
        VM.runOneInstruction();
        VM.updateScreen();
        console.log("Ran one instruction!");        
    }
});


let started = false;
requestAnimationFrame(onTimerTick);

function onTimerTick() {
    console.log(`tick started=${started} VM null? ${VM === null}`);
    if (started && VM !== null) {
        for (let i = 0; i < 50; i++) {
            VM.runOneInstruction();
        }
        VM.updateScreen();        
    }
    requestAnimationFrame(onTimerTick);
}

document.querySelector("#start-stop-button").addEventListener("click", () => {
    started = !started;
    if (started) {
        document.querySelector("#start-stop-button").innerText = "Stop";
    } else {
        document.querySelector("#start-stop-button").innerText = "Start";
    }
})

