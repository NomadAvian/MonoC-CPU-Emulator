import { styleTags, tags } from '@lezer/highlight'
import { LanguageSupport, StreamLanguage, syntaxHighlighting, HighlightStyle } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'

const riscvLanguage = StreamLanguage.define({
    token(stream) {
        if (stream.eatSpace()) return null

        if (stream.match(/#[^\n]*/)) return 'comment'

        if (stream.match(/"[^"]*"/)) return 'string'

        if (stream.match(/\.[a-z][a-z0-9]*/i, true)) return 'meta'

        if (stream.match(/\b\d+\b/)) return 'number'
        if (stream.match(/0[xX][0-9a-fA-F]+/)) return 'number'
        if (stream.match(/0[bB][01]+/)) return 'number'

        if (stream.match(/\bx([0-9]|[12]\d|3[01])\b/)) return 'atom'

        if (stream.match(/[(),:+\-]/)) return 'punctuation'

        if (stream.match(/[a-zA-Z_][a-zA-Z0-9_]*(?=:)/)) return 'labelName'

        if (stream.match(/\b(addi|slti|sltu|sltiu|andi|ori|xori|slli|srli|srai|lui|auipc|add|sub|slt|and|or|xor|sll|srl|sra|jal|jalr|beq|bne|blt|bge|bltu|bgeu|lb|lh|lw|lbu|lhu|sb|sh|sw|fence|ecall|ebreak|mul|mulh|mulhsu|mulhu|div|divu|rem|remu)\b/)) {
            return 'keyword'
        }

        if (stream.match(/[a-zA-Z_][a-zA-Z0-9_]*/)) return 'variableName'

        stream.next()
        return null
    },
})

const riscvHighlight = HighlightStyle.define([
    { tag: t.comment,      color: "#6B7A99", fontStyle: "italic" },
    { tag: t.string,       color: "#A3D977" },
    { tag: t.number,       color: "#F6C177" },
    { tag: t.atom,         color: "#C792EA" },
    { tag: t.keyword,      color: "#7DCFFF", fontWeight: "bold" },
    { tag: t.labelName,    color: "#FF9E64", fontWeight: "bold" },
    { tag: t.meta,         color: "#89DDFF" },
    { tag: t.variableName, color: "#D9E0EE" },
    { tag: t.punctuation,  color: "#A9B1D6" },
])

export const riscv = new LanguageSupport(riscvLanguage, [
    syntaxHighlighting(riscvHighlight),
])
