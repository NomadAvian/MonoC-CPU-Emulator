#include "memory.h"

#include <fstream>
#include <sstream>
#include <string>
#include <iostream>

#include "../common.h"


void Memory::LoadFile(const std::string& filename) {
    entry_ = 0;
    std::ifstream file(filename);
    if (!file)  {
        std::cerr << "Could not open file: " << filename << std::endl;
        return;
    }

    std::string line;
    Word addr = 0;
    Word word = 0;
    size_t pending = 0;

    auto FlushWord = [&]() {
        if (pending == 4) {
            WriteWord(addr, word);
            addr += 4;
            pending = 0;
            word = 0;
        }
    };

    while (std::getline(file, line)) {
        if (line.empty())
            continue;
        std::istringstream iss(line);
        std::string tok;
        if (!(iss >> tok))
            continue;
        if (tok == "E" || tok == "e" || tok == "entry" || tok == "ENTRY") {
            std::string addr_tok;
            if (iss >> addr_tok)
                entry_ = static_cast<Word>(std::stoul(addr_tok, nullptr, 16));
            continue;
        }
        do { // re-process first token after read, as it is a byte
            Word b = static_cast<Word>(std::stoul(tok, nullptr, 16));
            word |= (b & 0xFF) << (8 * pending);
            pending++;
            FlushWord();
        } while (iss >> tok);
    }
}

void Memory::Reset() {
	data_.clear();
	entry_ = 0;
}

Byte Memory::ReadByte(Word addr) const {
	auto it = data_.find(addr);
	return (it == data_.end()) ? Byte{0} : it->second;
}

Half Memory::ReadHalf(Word addr) const {
	Byte b0 = ReadByte(addr);
	Byte b1 = ReadByte(addr + 1);
	return (static_cast<Half>(b0)) |
		   (static_cast<Half>(b1) << 8);
}

Word Memory::ReadWord(Word addr) const {
	Byte b0 = ReadByte(addr);
	Byte b1 = ReadByte(addr + 1);
	Byte b2 = ReadByte(addr + 2);
	Byte b3 = ReadByte(addr + 3);
	return (static_cast<Word>(b0)) |
		   (static_cast<Word>(b1) << 8)  |
		   (static_cast<Word>(b2) << 16) |
		   (static_cast<Word>(b3) << 24);
}

void Memory::WriteByte(Word addr, Byte value) {
	if (read_only_) return;
	data_[addr] = value;
}

void Memory::WriteHalf(Word addr, Half value) {
	if (read_only_) return;
	Byte first  = static_cast<Byte>((value) & 0xFF);
	Byte second = static_cast<Byte>((value >> 8) & 0xFF);

	data_[addr]     = first;
	data_[addr + 1] = second;
}

void Memory::WriteWord(Word addr, Word value) {
	if (read_only_) return;
	Byte b0 = static_cast<Byte>((value)       & 0xFF);
	Byte b1 = static_cast<Byte>((value >> 8)  & 0xFF);
	Byte b2 = static_cast<Byte>((value >> 16) & 0xFF);
	Byte b3 = static_cast<Byte>((value >> 24) & 0xFF);

	data_[addr]     = b0;
	data_[addr + 1] = b1;
	data_[addr + 2] = b2;
	data_[addr + 3] = b3;
}
