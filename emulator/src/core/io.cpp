#include "io.h"

#include <algorithm>
#include <mutex>

namespace cpu {

void Io::WriteInput(const std::string& data) {
    std::lock_guard<std::mutex> lock(mtx_);
    in_ += data;
}

std::string Io::Output() const {
    std::lock_guard<std::mutex> lock(mtx_);
    return out_;
}

void Io::Clear() {
    std::lock_guard<std::mutex> lock(mtx_);
    in_.clear();
    out_.clear();
}

void Io::Emit(const std::string& data) {
    std::lock_guard<std::mutex> lock(mtx_);
    out_ += data;
}

bool Io::HasInput() const {
    std::lock_guard<std::mutex> lock(mtx_);
    return !in_.empty();
}

bool Io::HasLine() const {
    std::lock_guard<std::mutex> lock(mtx_);
    return in_.find('\n') != std::string::npos;
}

char Io::ReadByte() {
    std::lock_guard<std::mutex> lock(mtx_);
    if (in_.empty()) return '\0';
    const char c = in_.front();
    in_.erase(0, 1);
    return c;
}

std::string Io::ReadLine(size_t max) {
    std::lock_guard<std::mutex> lock(mtx_);
    const size_t n = std::min(max, in_.size());
    size_t cut = n;
    for (size_t i = 0; i < n; ++i) {
        if (in_[i] == '\n') {
            cut = i + 1;
            break;
        }
    }
    std::string line = in_.substr(0, cut);
    in_.erase(0, cut);
    return line;
}

} // namespace cpu
