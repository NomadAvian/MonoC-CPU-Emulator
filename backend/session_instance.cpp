// Per-user session state — foundation of the multiuser support system.
//
// One SessionInstance owns everything a single client interacts with:
// its session id, its own compiled ROM file, its CPU instance and its
// console buffers (program output + pending stdin). Every public method
// takes the session lock, so a session is never mutated by two requests
// at once. Identity is owned by SessionRegistry below: it mints and
// sanitizes ids; sessions just carry them.

#include <cctype>
#include <cstdio>
#include <memory>
#include <mutex>
#include <random>
#include <string>
#include <unordered_map>
#include <vector>

#include "../emulator/src/assembler/assembler.h"
#include "../emulator/src/core/cpu.h"

namespace backend {

class SessionInstance {
public:
    // read model for GET /cpu/output; `len` is the total bytes ever
    // produced so the frontend can request only the delta
    struct ConsoleSnapshot {
        std::string text;
        size_t      len;
    };

    // registry-guaranteed non-empty sanitized id
    explicit SessionInstance(const std::string& id)
        : id_(id), exec_name_("session_" + id) {}

    const std::string& id() const { return id_; }

    // assembles source into this session's own ROM file and loads it,
    // so concurrent sessions never overwrite each other's programs;
    // throws on assembly errors (propagated from AssembleToRom)
    size_t Compile(const std::string& source) {
        std::lock_guard<std::recursive_mutex> lock(mutex_);
        const std::vector<Word> words =
            riscv::Assembler::AssembleToRom(source, exec_name_);
        if (!cpu_) {
            cpu_ = std::make_unique<cpu::CPU>(exec_name_ + ".txt");
        } else {
            cpu_->Reset();
            cpu_->LoadExecutable(exec_name_ + ".txt");
        }
        cpu_->SetIo(&io_);
        ClearConsole();
        return words.size();
    }

    void Reset() {
        std::lock_guard<std::recursive_mutex> lock(mutex_);
        if (cpu_) cpu_->Reset();
        ClearConsole();
    }

    // runs up to max_steps instructions, stopping early on halt;
    // returns how many steps were actually executed
    size_t Step(int max_steps) {
        std::lock_guard<std::recursive_mutex> lock(mutex_);
        if (!cpu_ || max_steps < 1) return 0;
        size_t executed = 0;
        while (executed < static_cast<size_t>(max_steps) && !cpu_->IsHalted()) {
            cpu_->Step();
            ++executed;
            // parked on a read ecall: stop burning the batch, the PC
            // stays at the ecall until input arrives
            if (cpu_->IsWaiting()) break;
        }
        return executed;
    }

    bool halted() {
        std::lock_guard<std::recursive_mutex> lock(mutex_);
        return cpu_ && cpu_->IsHalted();
    }

    bool waiting() {
        std::lock_guard<std::recursive_mutex> lock(mutex_);
        return cpu_ && cpu_->IsWaiting();
    }

    Word Pc() {
        std::lock_guard<std::recursive_mutex> lock(mutex_);
        return cpu_ ? cpu_->pc() : 0;
    }

    std::vector<Word> Registers() {
        std::lock_guard<std::recursive_mutex> lock(mutex_);
        std::vector<Word> regs(32, 0);
        if (cpu_) {
            for (size_t i = 0; i < regs.size(); ++i)
                regs[i] = cpu_->ReadReg(i);
        }
        return regs;
    }

    std::vector<Byte> Framebuffer() {
        std::lock_guard<std::recursive_mutex> lock(mutex_);
        return cpu_ ? cpu_->ReadFramebuffer() : std::vector<Byte>();
    }

    // ---- console (print-syscall output / stdin for read syscalls) ----
    // backed by the CpuIo payload the CPU reads/writes during ecalls

    void AppendOutput(const std::string& data) {
        std::lock_guard<std::recursive_mutex> lock(mutex_);
        io_.Emit(data);
    }

    void WriteInput(const std::string& data) {
        std::lock_guard<std::recursive_mutex> lock(mutex_);
        io_.WriteInput(data);
    }

    ConsoleSnapshot console() const {
        std::lock_guard<std::recursive_mutex> lock(mutex_);
        const std::string text = io_.Output();
        return {text, text.size()};
    }

    void ClearConsole() {
        std::lock_guard<std::recursive_mutex> lock(mutex_);
        io_.Clear();
    }

private:
    std::string                  id_;
    std::string                  exec_name_;
    std::unique_ptr<cpu::CPU>    cpu_;
    cpu::Io                      io_;
    mutable std::recursive_mutex mutex_;
};

// maps session ids to live sessions. Absent or unknown ids mint a new session
// session id's are custom generated because reusing the browser one might
// pose a security issue
class SessionRegistry {
public:
    std::shared_ptr<SessionInstance> GetOrCreate(const std::string& raw_id) {
        std::lock_guard<std::mutex> lock(map_mutex_);
        const std::string id = Sanitize(raw_id);
        const auto it = sessions_.find(id);
        if (it != sessions_.end()) return it->second;
        auto session = std::make_shared<SessionInstance>(id);
        sessions_.emplace(session->id(), session);
        return session;
    }

private:
    // generate session id for new sessions
    static std::string MintId() {
        static std::mt19937_64 rng(std::random_device{}());
        char buf[33];
        std::snprintf(buf, sizeof(buf), "%016llx%016llx",
                      static_cast<unsigned long long>(rng()),
                      static_cast<unsigned long long>(rng()));
        return buf;
    }

    // ids end up in ROM filenames; keep [A-Za-z0-9_-] only
    static std::string Sanitize(const std::string& raw) {
        std::string clean;
        for (char c : raw) {
            if (std::isalnum(static_cast<unsigned char>(c)) ||
                c == '-' || c == '_') {
                clean += c;
            }
        }
        return clean.empty() ? MintId() : clean;
    }

    std::mutex map_mutex_;
    std::unordered_map<std::string,
                       std::shared_ptr<SessionInstance>> sessions_;
};

} // namespace backend
