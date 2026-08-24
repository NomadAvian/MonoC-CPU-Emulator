# MonoC Emulator UI Guide

The MonoC CPU Emulator features a web interface with the following panels.

## 1. Left Sidebar : Registers
*   **Reg Tab**: Displays all 32 virtual CPU registers (x0 to x31, ABI names shown) plus SP and the Program Counter (PC). Values can be formatted in Hex or Unsigned integer via settings; recently changed values are highlighted while stepping.

## 2. Center Area : Editor, Controls & Screen
*   **Editor**: A CodeMirror-based code editor where users write RISC-V (RV32IM) assembly.
*   **Control Bar**: Sits above/below the editor and holds the execution controls:
    *   **Compile**: assembles the source into the session's ROM and loads it into the CPU.
    *   **Run / Stop**: continuous execution at the speed chosen by the slider (Trace = 1 instruction/sec, up to Full speed).
    *   **Step**: executes exactly one instruction.
    *   **Reset**: clears registers/PC/console; the program must be recompiled afterwards.
    *   The status text shows the live state: `Compiled`, `Running`, `Waiting for Input` (a read ecall is paused until the user submits a console line), or `Halted`.
*   **Screen Panel**: A 128x96 pixel framebuffer display where graphical output is rendered. It is toggled with the screen icon in the top bar.

## 3. Bottom Panel : Output
*   **Console Tab**: The program's terminal - shows stdout from print ecalls, `[SYSTEM]` status lines, and an input line that feeds read ecalls (5, 8, 12) line by line.
*   **Disassembler Tab**: After compilation it lists every ROM word as Address / Hex / decoded Instruction. The row at the current PC is highlighted and auto-scrolled during execution, which makes control flow visible while stepping.

## 4. Right Sidebar : Tools
*   **Docs Tab**: Built-in documentation with two sections - "RISC-V Assembly" (ISA reference: instructions, syntax, patterns) and "MonoC" (user manual: running programs, console, disassembler, framebuffer).
*   **MonoC AI Tab**: The AI assistant interface (where you are currently operating).
*   **Examples Tab**: A library of example programs that can be loaded into the editor.

## 5. Top Bar : Global Actions
*   **Learn icon** (graduation cap): opens/closes the right AI panel.
*   **Display icon** (screen): toggles the framebuffer screen panel.
*   **Settings gear**: modal to configure Theme, Number Format (Hex/Unsigned), Font Style, Font Size, and Tab Size.
*   **Profile icon**: login/register, or the user profile when logged in.
*   **More Options menu** (three dots): Cloud Save, Import File, Export File, Reset Editor, About, and a GitHub link.

**Note to AI**: You can freely advise the user on how to use these panels. Remind them that all panels are resizable using the draggable dividers.
