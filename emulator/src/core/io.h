#ifndef IO_CPU_IO_H_
#define IO_CPU_IO_H_

#include <cstddef>
#include <string>
#include <mutex>


namespace cpu {

// cpu input/output abstraction
class Io {
public:
    void WriteInput(const std::string& data);
    std::string Output() const;
    void Clear();

    // ecalls
    void Emit(const std::string& data);
    bool HasInput() const;
    bool HasLine() const;   // pipe contains at least one complete line

    // pops one byte; '\0' when the pipe is empty
    char ReadByte();

    // consumes up to max bytes from the front
    // stops at '\n' or a set limit
    std::string ReadLine(size_t max);

private:
    mutable std::mutex mtx_;
    std::string in_;
    std::string out_;
};

} // namespace cpu

#endif // IO_CPU_IO_H_
