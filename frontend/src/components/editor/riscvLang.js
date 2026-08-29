import { completeFromList } from '@codemirror/autocomplete'
import { HighlightStyle, LanguageSupport, StreamLanguage, syntaxHighlighting } from '@codemirror/language'
import { tags as t, Tag } from '@lezer/highlight'

import { completionInfoFor, docFor, riscvHover } from './asmHover'
import { customKeywords, riscvKeywords, riscvRegisters } from './riscvWords'

// Register a real highlight tag on the shared tags object so CodeMirror can
t.customKeyword = Tag.define('customKeyword')

const completionDirectives = ['.text', '.data', '.word', '.string']

// attach the docs entry (when there is one) so the popup shows the full docs tooltip
const completion = (label, type) => {
    const entry = docFor(label)
    if (!entry) return { label, type }
    return {
        label,
        type,
        info: completionInfoFor(entry),
    }
}

const completions = [
    ...riscvKeywords.map(k => completion(k, 'keyword')),
    ...riscvRegisters.map(r => completion(r, 'variable')),
    ...customKeywords.map(k => completion(k, 'customKeyword')),
    ...completionDirectives.map(d => completion(d, 'keyword')),
]

const riscvLanguage = StreamLanguage.define({
    token(stream) {
        if (stream.eatSpace()) return null

        if (stream.match(/#[^\n]*/)) return 'comment'

        if (stream.match(/"[^"]*"/)) return 'string'

        if (stream.match(/\.[a-z][a-z0-9]*/i, true)) return 'meta'

        if (stream.match(/0[xX][0-9a-fA-F]+/)) return 'number'
        if (stream.match(/0[bB][01]+/)) return 'number'
        if (stream.match(/-?\d+/)) return 'number'

        if (stream.match(/\bx([0-9]|[12]\d|3[01])\b/)) return 'atom'

        if (stream.match(/[(),:+-]/)) return 'punctuation'

        if (stream.match(/[a-zA-Z_][a-zA-Z0-9_]*(?=:)/)) return 'labelName'

        if (stream.match(new RegExp(`\\b(${riscvKeywords.join('|')})\\b`))) {
            return 'keyword'
        }

        if (stream.match(new RegExp(`\\b(${customKeywords.join('|')})\\b`))) {
            return 'customKeyword'
        }

        if (stream.match(/[a-zA-Z_][a-zA-Z0-9_]*/)) return 'variableName'

        stream.next()
        return null
    },
})

const riscvHighlight = HighlightStyle.define([
    { tag: t.comment,      color: "var(--code-comment)", fontStyle: "italic" },
    { tag: t.string,       color: "var(--code-string)" },
    { tag: t.number,       color: "var(--code-number)" },
    { tag: t.atom,         color: "var(--code-atom)" },
    { tag: t.keyword,      color: "var(--code-keyword)", fontWeight: "bold" },
    { tag: t.labelName,    color: "var(--code-label)", fontWeight: "bold" },
    { tag: t.meta,         color: "var(--code-meta)" },
    { tag: t.variableName, color: "var(--code-variable)" },
    { tag: t.customKeyword, color: "var(--code-constant)", fontWeight: "bold" },
    { tag: t.punctuation,  color: "var(--code-punctuation)" },
])

export const riscv = new LanguageSupport(riscvLanguage, [
    riscvLanguage.data.of({
        autocomplete: completeFromList(completions)
    }),
    syntaxHighlighting(riscvHighlight),
    riscvHover,
])
