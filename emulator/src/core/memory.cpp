#include "memory.h"

#include "../common.h"

Word Memory::WrapAddr(Word addr) const {
	// fast modulo with powers of 2
    return addr & static_cast<Word>(size_ - 1);
}

Byte Memory::ReadByte(Word addr) const {
	return data_[WrapAddr(addr)];
}

Half Memory::ReadHalf(Word addr) const {
	Byte b0 = data_[WrapAddr(addr)];
	Byte b1 = data_[WrapAddr(addr + 1)];
	return (static_cast<Half>(b0)) |
		   (static_cast<Half>(b1) << 8);
}

Word Memory::ReadWord(Word addr) const {
	Byte b0 = data_[WrapAddr(addr)];
	Byte b1 = data_[WrapAddr(addr + 1)];
	Byte b2 = data_[WrapAddr(addr + 2)];
	Byte b3 = data_[WrapAddr(addr + 3)];
	return (static_cast<Word>(b0)) |
		   (static_cast<Word>(b1) << 8)  |
		   (static_cast<Word>(b2) << 16) |
		   (static_cast<Word>(b3) << 24);
}

void Memory::WriteByte(Word addr, Byte value) {
	if (read_only_) return;
	data_[WrapAddr(addr)] = value;
}

void Memory::WriteHalf(Word addr, Half value) {
	if (read_only_) return;
	Byte first  = static_cast<Byte>((value) & 0xFF);
	Byte second = static_cast<Byte>((value >> 8) & 0xFF);

	data_[WrapAddr(addr)]     = first;
	data_[WrapAddr(addr + 1)] = second;
}

void Memory::WriteWord(Word addr, Word value) {
	if (read_only_) return;
	Byte b0 = static_cast<Byte>((value)       & 0xFF);
	Byte b1 = static_cast<Byte>((value >> 8)  & 0xFF);
	Byte b2 = static_cast<Byte>((value >> 16) & 0xFF);
	Byte b3 = static_cast<Byte>((value >> 24) & 0xFF);

	data_[WrapAddr(addr)]     = b0;
	data_[WrapAddr(addr + 1)] = b1;
	data_[WrapAddr(addr + 2)] = b2;
	data_[WrapAddr(addr + 3)] = b3;
}
