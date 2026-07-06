.PHONY: all run clean

SRC := $(shell find src -name '*.cpp')

ifeq ($(OS),Windows_NT)
    EXE = .exe
else
    EXE =
endif

TARGET = ./bin/main$(EXE)

all: $(TARGET)

$(TARGET): $(SRC)
	mkdir -p bin
	g++ -std=c++20 -Wall -Wextra $(SRC) -o $(TARGET)

run: $(TARGET)
	./$(TARGET)

clean:
	rm -f $(TARGET)