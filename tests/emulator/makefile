CXX = g++
CXXFLAGS = -std=c++20 -Wall -Wextra

ROOT_DIR := ../../emulator/src
TESTS_DIR := ./

ifeq ($(OS),Windows_NT)
    EXE = .exe
else
    EXE =
endif

TARGET = ./test$(EXE)

alu:
	$(CXX) $(CXXFLAGS) ./alu_test.cpp $(ROOT_DIR)/core/alu.cpp -o $(TARGET) && $(TARGET)

memory:
	$(CXX) $(CXXFLAGS) ./memory_test.cpp $(ROOT_DIR)/core/memory.cpp -o $(TARGET) && $(TARGET)

clean:
	rm -f $(TARGET)
