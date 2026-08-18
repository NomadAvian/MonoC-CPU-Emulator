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

# assembler test stuff
ASM_TEST_DIR   := ./data/asm_tests
ASM_TEST_ASM   := $(wildcard $(ASM_TEST_DIR)/*.asm)
ASM_TEST_NAMES := $(notdir $(basename $(ASM_TEST_ASM)))

alu:
	$(CXX) $(CXXFLAGS) ./alu_test.cpp $(ROOT_DIR)/core/alu.cpp -o $(TARGET) && $(TARGET)

decode:
	$(CXX) $(CXXFLAGS) ./decoder_test.cpp \
		$(ROOT_DIR)/core/cpu.cpp \
		$(ROOT_DIR)/core/memory.cpp \
		$(ROOT_DIR)/core/alu.cpp \
		-o $(TARGET) && $(TARGET)

memory:
	$(CXX) $(CXXFLAGS) ./memory_test.cpp $(ROOT_DIR)/core/memory.cpp -o $(TARGET) && $(TARGET)

$(TARGET): assembler_test.cpp $(wildcard $(ROOT_DIR)/assembler/*.cpp)
	$(CXX) $(CXXFLAGS) assembler_test.cpp $(ROOT_DIR)/assembler/*.cpp -o $(TARGET)

assembler: $(TARGET)
	@pass=0; fail=0; \
	for name in $(ASM_TEST_NAMES); do \
		asm="$(ASM_TEST_DIR)/$${name}.asm"; \
		expected="$(ASM_TEST_DIR)/$${name}.txt"; \
		out="/tmp/$${name}_got.txt"; \
		printf "  %-22s ... " "$${name}"; \
		if ./$(TARGET) "$$asm" "$$out" >/dev/null 2>&1; then \
			if diff -q "$$out" "$$expected" >/dev/null 2>&1; then \
				echo "PASS"; \
				pass=$$((pass + 1)); \
			else \
				echo "FAIL (output differs)"; \
				diff "$$expected" "$$out"; \
				fail=$$((fail + 1)); \
			fi; \
		else \
			echo "FAIL (assembly error)"; \
			fail=$$((fail + 1)); \
		fi; \
	done; \
	echo; \
	echo "  Results: $$pass passed, $$fail failed"; \
	test "$$fail" -eq 0

EMU_TARGET := ./emu_test

$(EMU_TARGET): emulator_test.cpp $(wildcard $(ROOT_DIR)/core/*.cpp) $(wildcard $(ROOT_DIR)/assembler/*.cpp)
	$(CXX) $(CXXFLAGS) emulator_test.cpp $(ROOT_DIR)/core/*.cpp $(ROOT_DIR)/assembler/*.cpp -o $(EMU_TARGET)

emulator: $(EMU_TARGET)
	@pass=0; fail=0; \
	for name in $(ASM_TEST_NAMES); do \
		asm="$(ASM_TEST_DIR)/$${name}.asm"; \
		printf "  %-22s ... " "$${name}"; \
		if ./$(EMU_TARGET) "$$asm" >/dev/null 2>&1; then \
			echo "PASS"; \
			pass=$$((pass + 1)); \
		else \
			echo "FAIL"; \
			fail=$$((fail + 1)); \
		fi; \
	done; \
	echo; \
	echo "  Results: $$pass passed, $$fail failed"; \
	test "$$fail" -eq 0

clean:
	rm -f $(TARGET) $(EMU_TARGET)
