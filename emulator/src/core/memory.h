#ifndef MEMORY_MEMORY_H_
#define MEMORY_MEMORY_H_

#include <bit>
#include <cassert>
#include <string>
#include <unordered_map>

#include "framebuffer.h"
#include "../common.h"

// Memory accesses wrap around the address space as per the specs
// The memory space covers the span of uint32_t / Word
// so no manual wrapping is needed
class Memory {
public:
    Memory(bool read_only = false)
        : read_only_(read_only) {}

    void LoadFile(const std::string &filename);

    void Reset();

    // Program entry point parsed from the ROM header (0 if the file had none).
    Word entry() const { return entry_; }

    Byte ReadByte(Word addr) const;
    Half ReadHalf(Word addr) const;
    Word ReadWord(Word addr) const;

    void WriteByte(Word addr, Byte value);
    void WriteHalf(Word addr, Half value);
    void WriteWord(Word addr, Word value);

    size_t size() const { return data_.size(); }

    ~Memory() = default;

private:
    bool read_only_;
    std::unordered_map<Word, Byte> data_;
    Word entry_ = 0;
};

#endif // MEMORY_MEMORY_H_
