.PHONY: all run clean

SRC := $(wildcard src/*.cpp)

ifeq ($(OS),Windows_NT)
	EXE = .exe
else
	EXE = 
endif

TARGET = ./bin/main(EXE)

all: $(TARGET)

$(TARGET): $(SRC)
	g++ $(SRC) -o $(TARGET)

run: $(TARGET)
	./$(TARGET)

clean:
	rm -f $(TARGET)
