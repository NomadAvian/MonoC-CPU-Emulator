// MonoC user manual — emulator-specific features: running programs,
// console, disassembler panel and framebuffer. The ISA/assembly
// reference lives in asmDocs.js.

export const MONOC_DOCS = [
  {
    category: 'Running Programs',
    items: [
      {
        title: 'Compile',
        desc: 'Assembles the editor source into your session\'s ROM and loads it into the CPU. A successful compile clears the console, rewinds the PC to the entry point and refreshes the disassembler listing.',
        example: ''
      },
      {
        title: 'Run / Stop',
        desc: 'Run executes continuously until the program halts or you press Stop. The speed slider picks the pace: from Trace (one instruction per second) up to Full speed.',
        example: ''
      },
      {
        title: 'Step',
        desc: 'Executes exactly one instruction per click - handy paired with the Disassembler tab to watch registers, memory and control flow change one step at a time.',
        example: ''
      },
      {
        title: 'Reset',
        desc: 'Clears all registers, rewinds the PC and empties the console. The loaded program is wiped from the CPU, so recompile before running again.',
        example: ''
      },
      {
        title: 'Execution status',
        desc: 'The status text left of the controls reflects the live CPU state: Compiled, Running, Waiting for Input (a read ecall is paused until you submit a console line), or Halted when execution reached the end.',
        example: ''
      }
    ]
  },
  {
    category: 'Console',
    items: [
      {
        title: 'What the panel shows',
        desc: 'The Console tab in the bottom panel is your program\'s terminal. Output printed via print ecalls appears as it is produced, your typed input is echoed back with a > prompt, and [SYSTEM] lines report emulator events such as compilation status and execution completion.',
        example: '# typical session\n[SYSTEM] Compiling...\n[SYSTEM] Compilation successful\n42\nHello\n> 7              <- you typed this\n[SYSTEM] Execution completed'
      },
      {
        title: 'Providing input',
        desc: 'Type in the input line at the bottom of the panel and press Enter to feed the running program\'s standard input. Each submission delivers one line, which read ecalls (Read Integer 5, Read String 8, Read Char 12) consume. If a read ecall executes before any line is available, the CPU pauses mid-program and resumes the moment input arrives - no need to time your typing.',
        example: 'li a0, buffer\nli a1, 64\nli a7, 8\necall             # blocks until you press Enter in the console'
      },
      {
        title: 'Clearing the console',
        desc: 'The Clear button wipes both the visible transcript and the server-side buffer. Recompiling or resetting the CPU also starts a fresh console, so output from a previous run never bleeds into the next.',
        example: ''
      }
    ]
  },
  {
    category: 'Disassembler',
    items: [
      {
        title: 'What the panel shows',
        desc: 'After compiling, open the Disassembler tab in the bottom panel to see your program as the CPU sees it: one row per ROM word with its byte address, raw hex encoding, and decoded instruction. Words produced by data directives (.word/.byte/.asciiz) sit before the entry point and are shown as `.word 0x...` since they are not executable.',
        example: '# columns\n# Address     Hex        Instruction\n# 0x00000000  0x0000002a .word 0x0000002a   <- data\n# 0x00000004  0x00400513 addi a0, zero, 4   <- entry point'
      },
      {
        title: 'Reading disassembled output',
        desc: 'Instructions are shown exactly as encoded: registers use ABI names, pseudo-instructions appear expanded into their real instructions (li becomes addi/lui, mv becomes add), so what is written may differ from what executes. Branch and jump targets are printed as absolute addresses matching the Address column.',
        example: 'jal ra, fib          # assembles to:\n# jal ra, 0x00000020 # target = absolute byte address'
      },
      {
        title: 'Following execution',
        desc: 'While stepping or running, the row at the current PC is highlighted and the list auto-scrolls to keep it in view, use Trace speed to walk one instruction at a time. If the listing looks out of date, recompile to regenerate it.',
        example: ''
      }
    ]
  },
  {
    category: 'Screen',
    items: [
      {
        title: 'Opening the display',
        desc: 'Pressing the screen icon in the top bar toggles the framebuffer display panel open or closed. Writes to video memory appear on it live while your program runs.',
        example: ''
      },
              {
        title: 'SCREEN keyword',
        desc: 'SCREEN is a predefined constant in the assembler that resolves to the base address of the framebuffer in memory. Use it to initialize a register pointing to the start of video memory, e.g. li s0, SCREEN. The actual address value is 0x07FFD000.',
        example: 'li   s0, SCREEN         # s0 = framebuffer base address'
      },
      {
        title: 'Framebuffer basics',
        desc: 'The framebuffer is a 128×96 pixel display mapped directly into memory starting at the SCREEN address. Each pixel occupies 1 byte. The framebuffer uses row-major layout with a stride of 128 bytes per row: pixels in row y occupy bytes [SCREEN + y*128, SCREEN + y*128 + 127], and pixel (x, y) is at byte offset SCREEN + y*128 + x.',
        example: '# Pixel (0, 0) is at SCREEN + 0*128 + 0 = SCREEN\n# Pixel (127, 0) is at SCREEN + 0*128 + 127\n# Pixel (0, 1) is at SCREEN + 1*128 + 0\n# Pixel (64, 48) is at SCREEN + 48*128 + 64'
      },
      {
        title: 'Pixel format and color',
        desc: 'Each pixel is a single unsigned byte. Value 0 represents black (no output); value 0xFF (255, or -1 in two\'s complement) represents white (full intensity). Intermediate values are treated as shades of gray (0x80 ≈ 50% gray). Writes to the framebuffer take effect immediately.',
        example: 'li   t0, SCREEN\nli   t1, 0              # black pixel\nsb   t1, 0(t0)\nli   t1, -1             # white pixel (0xFF)\nsb   t1, 4(t0)'
      },
      {
        title: '2D addressing in row-major layout',
        desc: 'To compute the address of pixel (x, y): multiply y by the stride (128) to get the row base, then add x to get the final byte offset. Formula: addr = SCREEN + y*128 + x. Since 128 = 2^7, you can use slli (shift left immediate) by 7 to multiply by 128 efficiently. For multiple pixels in the same row, compute the row base once and reuse it.',
        example: '# Plot pixel at (x, y):\nslli t0, y, 7           # t0 = y * 128  (row base offset)\nadd  t0, t0, x          # t0 += x       (add column)\nadd  t0, t0, SCREEN     # t0 = SCREEN + y*128 + x (final address)\nsb   value, 0(t0)       # write pixel\n\n# Plot row of pixels at y:\nslli t0, y, 7           # t0 = y * 128  (compute once)\nadd  t0, t0, SCREEN\nli   x, 0\nloop:\n    add  t1, t0, x      # address of (x, y)\n    sb   value, 0(t1)\n    addi x, x, 1\n    blt  x, 128, loop'
      },
    ]
  }
]
