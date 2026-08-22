# MonoC Emulator UI Guide

The MonoC CPU Emulator features a web interface with the following panels.

## 1. Left Sidebar : State Panel
*   **Reg Tab**: Displays all 32 virtual CPU registers (x0 to x31) and the Program Counter (PC). Values can be formatted in Hex or Unsigned integer via settings.
*   **Mem Tab**: Provides a hex-editor style view of the CPU's RAM (Memory).

## 2. Center Area : Editor & Screen
*   **Editor**: A Monaco-based code editor where users can write MonoC assembly or standard C code.
*   **Screen Panel**: A 128x96 (default) pixel framebuffer display where graphical output from the emulator is rendered. The size can be increased or decreased using the draggable dividers.

## 3. Bottom Panel : Output
*   **Console Tab**: Shows standard output (stdout) from the running program.
*   **Disassembler Tab**: Displays the disassembled machine code after compilation, useful for debugging how code translates to raw instructions.

## 4. Right Sidebar : Tools
*   **Chat Tab**: The AI assistant interface (where you are currently operating).
*   **Docs Tab**: Built-in documentation for the MonoC Instruction Set Architecture (ISA).

## 5. Top Bar : Controls
*   Contains playback controls (**Run, Step, Reset**) to control the CPU execution.
*   **Settings gear** opens a modal to configure Theme, Number Format (Hex/Unsigned), Font Style, and Font Size.

**Note to AI**: You can freely advise the user on how to use these panels. Remind them that all panels are resizable using the draggable dividers.
