# Virtual Machine

This project implements a super-simple virtual machine for a hypothetical hardware architecture with:

- 16 32-bit integer registers R0..R15
- 1000 32-bit words of RAM, addressed by word index
- A set of very basic instructions as below

The goal was to learn basic assembly programming by building a VM from scratch. There is a user interface which displays the running code and which shows registers as the VM executes.

Memory-mapped IO is used for text and pixel buffer output. In specific, there are address above 1000 where writing and reading correspond to input and output of text or pixel data. The source code goes into more detail.

## Instruction Set

op    | arguments     | action                   |description
----- | ------------- | -------------------------|------------
MOV   | `Rd`, `Rs`        | `Rd` = `Rs`          |Move the value of the second register (`Rs`) into the first register (`Rd`)
SET   | `Rd`, `val`       | `Rd` = `val`         |Set the value of the first register (`Rd`) to a constant value (`val`)
ADD   | `Rd`, `Rs`        | `Rd` += `Rs`         |Add the value of the second register (`Rs`) to the first register (`Rd`)
SUB   |  `Rd`, `Rs`       |   `Rd` -= `Rs`       |Subtract the value of the second register (`Rs`) from the first register (`Rd`)
MUL   |  `Rd`, `Rs`       |   `Rd` *= `Rs`       |Multiply the value of the first register (`Rd`) by the value of the second register (`Rs`)
DIV   |  `Rd`, `Rs`       |   `Rd` /= `Rs`       |Divide the value of the first register (`Rd`) by the value of the second register (`Rs`)
MOD   |  `Rd`, `Rs`       |   `Rd` %= `Rs`       |Compute the modulo of the value of the first register (`Rd`) by the value of the second register (`Rs`)
STO   |  `Rs`, `Rm`       |   RAM[`Rm`] = `Rs`   |Store the value of the second register (`Rs`) in memory at the address given by the first register (`Rm`)
LOA   |  `Rd`, `Rm`       |   `Rd` = RAM[`Rm`]   |Load the value from memory at the address given by the second register (`Rm`) into the first register (`Rd`)
JMP   |  `Rm`           |   IP = `Rm`            |Jump to the instruction at the address given by the first register (`Rm`)
JE    |  `Ra`, `Rb`, `Rm`   |   If `Ra` == `Rb`, IP = `Rm` |Jump to the instruction at the address given by the third register (`Rm`) if the values in the first and second registers (`Ra` and `Rb`, respectively) are equal
JNE   |  `Ra`, `Rb`, `Rm`   |   If `Ra` != `Rb`, IP = `Rm`  |Jump to the instruction at the address given by the third register (`Rm`) if the values in the first and second registers (`Ra` and `Rb`, respectively) are not equal
JLE   |  `Ra`, `Rb`, `Rm`   |   If `Ra` <= `Rb`, IP = `Rm`  |Jump to the instruction at the address given by the third register (`Rm`) if the value in the first register (`Ra`) is less than or equal to the value in the second register (`Rb`)
JGE   |  `Ra`, `Rb`, `Rm`   |   If `Ra` >= `Rb`, IP = `Rm`  |Jump to the instruction at the address given by the third register (`Rm`) if the value in the first register (`Ra`) is greater than or equal to the value in the second register (`Rb`)
JL    |  `Ra`, `Rb`, `Rm`   |   If `Ra` < `Rb`, IP = `Rm`  |Jump to the instruction at the address given by the third register (`Rm`) if the value in the first register (`Ra`) is less than the value in the second register (`Rb`)
JG    |  `Ra`, `Rb`, `Rm`   |   If `Ra` > `Rb`, IP = `Rm`  |Jump to the instruction at the address given by the third register (`Rm`) if the value in the first register (`Ra`) is greater than the value in the second register (`Rb`)
AND   |  `Ra`, `Rb`       |   `Ra` &= `Rb`  (bitwise and)  |Perform a bitwise AND operation between the values in the first and second registers (`Ra` and `Rb`, respectively) and store the result in the first register (`Ra`)
OR    |  `Ra`, `Rb`       |   `Ra` l= `Rb`  (bitwise or)   |Perform a bitwise OR operation between the values in the first and second registers (`Ra` and `Rb`, respectively) and store the result in the first register (`Ra`) 
NOT   |  `Ra`           |   `Ra` = ~`Ra`  (bitwise not)    |Perform a bitwise NOT operation on the value in the first register (`Ra`) and store the result in the first register (`Ra`)

