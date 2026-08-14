.PHONY: all build run clean

# Crow server build/run/clean targets.
# Crow headers are installed system-wide (default include path).

CXX      = g++
# CXXFLAGS = -std=c++20 -Wall -Wextra -O2 -pthread
CXXFLAGS = -std=c++20 -Wall -Wextra -O2 -pthread -I/opt/homebrew/include -L/opt/homebrew/lib
BACKEND_DIR = ../backend
EMU_CORE    = ../emulator/src/core
EMU_ASM     = ../emulator/src/assembler

SRC = \
	$(BACKEND_DIR)/main.cpp \
	$(EMU_CORE)/cpu.cpp \
	$(EMU_CORE)/memory.cpp \
	$(EMU_CORE)/alu.cpp \
	$(EMU_ASM)/parser.cpp \
	$(EMU_ASM)/scanner.cpp \
	$(EMU_ASM)/token.cpp \
	$(EMU_ASM)/token_type.cpp

TARGET = crow_server

all: build

build: $(TARGET)

$(TARGET): $(SRC)
	$(CXX) $(CXXFLAGS) $(SRC) -o $(TARGET)

run: $(TARGET)
	./$(TARGET)

clean:
	rm -f $(TARGET)
