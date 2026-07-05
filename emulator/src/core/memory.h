#ifndef MEMORY_H_INCLUDE
#define MEMORY_H_INCLUDE

#include <string.h>

#include "../common.h"

class Memory {
public:
    Memory(size_t size = 128 * 1024 * 1024) :
        size_(size), data_(new Byte[size]()) {}

    bool CheckBound(Word addr, size_t sz) const;

    Byte ReadByte(Word addr)  const;
    Half ReadHalf(Word addr)  const;
	Word ReadWord(Word addr)  const;

	void WriteByte(Word addr, Byte value);
	void WriteHalf(Word addr, Half value);
	void WriteWord(Word addr, Word value);

    ~Memory() {
        delete [] data_;
    }

    // disable copying memory instances
    Memory(const Memory&) = delete;
    Memory& operator=(const Memory&) = delete;
private:
    size_t size_;
    Byte*  data_;
};

#endif // !MEMORY_H_INCLUDE
