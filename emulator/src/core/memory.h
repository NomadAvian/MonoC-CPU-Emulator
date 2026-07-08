#ifndef MEMORY_MEMORY_H_
#define MEMORY_MEMORY_H_

#include <string.h>
#include <vector>

#include "../common.h"

// Memory accesses wrap around the address space as per the specs
// The wrapping is implemented via bit operations so the size_
// should always be a power of 2
class Memory {
public:
    Memory(size_t size = 128 * 1024 * 1024,
		   bool read_only = false)
        : size_(size),
		  read_only_(read_only),
		  data_(size) {}

    Byte ReadByte(Word addr) const;
    Half ReadHalf(Word addr) const;
	Word ReadWord(Word addr) const;

	void WriteByte(Word addr, Byte value);
	void WriteHalf(Word addr, Half value);
	void WriteWord(Word addr, Word value);

	size_t size() const { return size_; }

    ~Memory() = default;

private:
	size_t size_;
	bool   read_only_;
	std::vector<Byte> data_;

    Word WrapAddr(Word addr) const;
};

#endif // MEMORY_MEMORY_H_
