#ifndef CPU_H_INCLUDE
#define CPU_H_INCLUDE

#include "../common.h"
#include "memory.h"
#include "../isa/isa.h"

struct Reg {
    Word value;
};

class CPU {
public:
    CPU() : ram(), rom() {
        // initialize registers
        for (int i = 0; i < 32; i++) {
            x[i].value = 0;
        }
        // initialize program counter
        pc.value = 0;
    }

private:
    Reg        x[32];
    Reg        pc;
    Memory     ram;
    Memory     rom;
    ISA        isa;
};

#endif // !CPU_H_INCLUDE
