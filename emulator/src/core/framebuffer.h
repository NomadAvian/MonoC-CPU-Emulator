#ifndef CORE_FRAMEBUFFER_H_
#define CORE_FRAMEBUFFER_H_

#include <cstddef>
#include <cstdint>

// the framebuffer lives at the tail of RAM: it occupies the last
// kFramebufferBytes bytes of the address space, ending at kRamSize.
// each pixel corresponds to a bit in this space.

constexpr std::uint32_t kRamSize           = 128 * 1024 * 1024; // 0x08000000
constexpr std::size_t   kFramebufferWidth  = 128;
constexpr std::size_t   kFramebufferHeight = 96;
constexpr std::size_t   kFramebufferBytes  = kFramebufferWidth * kFramebufferHeight;
constexpr std::uint32_t kFramebufferBase   = kRamSize - static_cast<std::uint32_t>(kFramebufferBytes);

#endif // CORE_FRAMEBUFFER_H_