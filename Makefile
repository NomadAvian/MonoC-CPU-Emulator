.PHONY: all build run clean

# Crow server build/run/clean targets.
# Crow headers are installed system-wide (default include path).
# The binary is emitted into build/ because start_dev.sh runs it from there.

CXX      = g++
UNAME_S := $(shell uname -s)
CXXFLAGS = -std=c++20 -Wall -Wextra -O2 -pthread

ifeq ($(UNAME_S),Darwin)
HOMEBREW_PREFIX := $(shell if [ -d /opt/homebrew/include ]; then echo /opt/homebrew; elif [ -d /usr/local/include ]; then echo /usr/local; fi)
CXXFLAGS += -I$(HOMEBREW_PREFIX)/include -L$(HOMEBREW_PREFIX)/lib
TARGET_SUFFIX = _mac
else
TARGET_SUFFIX = _linux
endif

BACKEND_DIR = backend
EMU_CORE    = emulator/src/core
EMU_ASM     = emulator/src/assembler

SRC = \
	$(BACKEND_DIR)/main.cpp \
	$(EMU_CORE)/cpu.cpp \
	$(EMU_CORE)/memory.cpp \
	$(EMU_CORE)/alu.cpp \
	$(EMU_ASM)/parser.cpp \
	$(EMU_ASM)/scanner.cpp \
	$(EMU_ASM)/token.cpp \
	$(EMU_ASM)/token_type.cpp

BUILD_DIR = build
TARGET    = $(BUILD_DIR)/crow_server$(TARGET_SUFFIX)

all: build

build: $(TARGET)

$(TARGET): $(SRC)
	mkdir -p $(BUILD_DIR)
	$(CXX) $(CXXFLAGS) $(SRC) -o $(TARGET)

run: $(TARGET)
	cd $(BUILD_DIR) && ./crow_server

clean:
	rm -f $(TARGET)
