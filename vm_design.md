# Virtual Machine Design

16 registers R0..R15 (32-bit integers)
16 floating point registers F0..F15 (but deferring impl on this)
1000 words (32-bit integers) of RAM, addressed RAM[0]...RAM[999]

## Instruction Set

op      arguments       description

MOV     Rd, Rs          Rd = Rs
SET     Rd, val         Rd = val
ADD     Rd, Rs          Rd += Rs
SUB     Rd, Rs          Rd -= Rs
MUL     Rd, Rs          Rd *= Rs
DIV     Rd, Rs          Rd /= Rs
MOD     Rd, Rs          Rd %= Rs
STO     Rs, Rm          RAM[Rm] = Rs
LOA     Rd, Rm          Rd = RAM[Rm]
JMP     Rm              IP = Rm
JE      Ra, Rb, Rm      If Ra == Rb, IP = Rm
JNE     Ra, Rb, Rm      If Ra != Rb, IP = Rm
JLE     Ra, Rb, Rm      If Ra <= Rb, IP = Rm
JGE     Ra, Rb, Rm      If Ra >= Rb, IP = Rm
JL      Ra, Rb, Rm      If Ra < Rb, IP = Rm
JG      Ra, Rb, Rm      If Ra > Rb, IP = Rm
AND     Ra, Rb          Ra &= Rb  (bitwise and)
OR      Ra, Rb          Ra |= Rb  (bitwise or)
NOT     Ra              Ra = ~Ra  (bitwise not)

