import { hoverTooltip } from '@codemirror/view'
import { syntaxTree } from '@codemirror/language'
import { ASM_DOCS } from '../../data/asmDocs'
import { MONOC_DOCS } from '../../data/monocDocs'
import { useSettingsStore } from '../../store/settingsStore'
import {
    riscvKeywords,
    riscvRegisters,
    customKeywords,
    riscvDirectives,
} from './riscvWords'

// hovered token to docs index
const KNOWN_TOKENS = new Set([...riscvKeywords, ...riscvRegisters, ...customKeywords, ...riscvDirectives])

function titleTokens(title) {
    const tokens = []
    for (const word of title.split(/[\s/]+/)) {
        const clean = word.replace(/:$/, '')
        if (KNOWN_TOKENS.has(clean)) tokens.push(clean)
        else break
    }
    return tokens
}

const EXTRA_DIRECTIVE_DOCS = {
    '.word': { title: '.word — data word(s)', desc: 'Emits one or more 32-bit words into the .data section.', example: 'my_var: .word 1, 2, 3' },
    '.half': { title: '.half — 16-bit values', desc: 'Emits one or more half-words into the .data section.', example: 'count: .half 10' },
    '.byte': { title: '.byte — 8-bit values', desc: 'Emits one or more bytes into the .data section.', example: 'flag: .byte 1' },
    '.string': { title: '.string — NUL-terminated string', desc: 'Emits a string followed by a NUL terminator into the .data section.', example: 'msg: .string "Hello"' },
    '.ascii': { title: '.ascii — string (no terminator)', desc: 'Emits a raw string without a NUL terminator into the .data section.', example: 'msg: .ascii "Hello"' },
    '.asciiz': { title: '.asciiz — NUL-terminated string', desc: 'Emits a NUL-terminated string into the .data section.', example: 'msg: .asciiz "Hello"' },
    '.space': { title: '.space — reserve bytes', desc: 'Reserves an uninitialized block of bytes in the .data section.', example: 'buffer: .space 64' },
    '.float': { title: '.float — 32-bit float', desc: 'Emits a 32-bit floating-point constant.', example: 'pi: .float 3.14' },
    '.double': { title: '.double — 64-bit float', desc: 'Emits a 64-bit floating-point constant.', example: 'pi: .double 3.14' },
}

// generalized docs for registers
function registerDocs() {
    const map = {}
    const add = (num, abi, role) => {
        const desc = 'General-purpose register in the RV32I calling convention.'
        map[`x${num}`] = { title: `x${num} (${abi}) — ${role}`, desc, example: '' }
        map[abi] = { title: `${abi} (x${num}) — ${role}`, desc, example: '' }
    }
    add(0, 'zero', 'hardwired to 0; reads as zero, writes are ignored')
    map['zr'] = { title: 'zr (x0) — hardwired to 0', desc: 'General-purpose register in the RV32I calling convention.', example: '' }
    add(1, 'ra', 'return address')
    add(2, 'sp', 'stack pointer')
    add(3, 'gp', 'global pointer')
    add(4, 'tp', 'thread pointer')
    const groups = [
        [5, 7, ['t0', 't1', 't2'], 'temporary'],
        [8, 8, ['s0'], 'saved register (also fp, frame pointer)'],
        [9, 9, ['s1'], 'saved register'],
        [10, 11, ['a0', 'a1'], 'function argument / return value'],
        [12, 17, ['a2', 'a3', 'a4', 'a5', 'a6', 'a7'], 'function argument'],
        [18, 27, ['s2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11'], 'saved register'],
        [28, 31, ['t3', 't4', 't5', 't6'], 'temporary'],
    ]
    for (const [start, end, abis, role] of groups) {
        for (let n = start; n <= end; n++) add(n, abis[n - start], role)
    }
    return map
}

function buildDocLookup() {
    const lookup = new Map()

    const indexItem = (item) => {
        const tokens = titleTokens(item.title)
        for (const token of tokens) {
            const existing = lookup.get(token)
            if (!existing || tokens[0] === token) lookup.set(token, item)
        }
    }

    for (const section of ASM_DOCS) section.items.forEach(indexItem)

    // SCREEN lives in the MonoC manual
    const screen = MONOC_DOCS.flatMap(s => s.items).find(i => i.title === 'SCREEN keyword')
    if (screen) indexItem(screen)

    for (const [token, entry] of Object.entries(EXTRA_DIRECTIVE_DOCS)) {
        if (!lookup.has(token)) lookup.set(token, entry)
    }
    for (const [token, entry] of Object.entries(registerDocs())) {
        if (!lookup.has(token)) lookup.set(token, entry)
    }

    return lookup
}

const DOC_LOOKUP = buildDocLookup()

export function docFor(token) {
    return DOC_LOOKUP.get(token) || null
}


// cursor token
const TOKEN_RE = /[A-Za-z0-9_.]+/g

function tokenAt(state, pos) {
    const line = state.doc.lineAt(pos)
    const rel = pos - line.from
    for (const match of line.text.matchAll(TOKEN_RE)) {
        if (match.index <= rel && rel < match.index + match[0].length) {
            return {
                text: match[0],
                from: line.from + match.index,
                to: line.from + match.index + match[0].length,
            }
        }
    }
    return null
}

// tool tip dom
const LINK_RE = /\[([^\]]+)\]\(([^)\s]+)\)/g

function pushLines(parent, text) {
    text.split('\n').forEach((line, i) => {
        if (i > 0) parent.appendChild(document.createElement('br'))
        if (line) parent.appendChild(document.createTextNode(line))
    })
}

function pushRichText(parent, text) {
    let last = 0
    for (const match of text.matchAll(LINK_RE)) {
        if (match.index > last) pushLines(parent, text.slice(last, match.index))
        const link = document.createElement('a')
        link.href = match[2]
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        link.textContent = match[1]
        parent.appendChild(link)
        last = match.index + match[0].length
    }
    pushLines(parent, text.slice(last))
}

export function buildDocNode(entry) {
    const wrap = document.createElement('div')
    wrap.className = 'cm-tooltip-docs'

    const item = document.createElement('div')
    item.className = 'docs-item'

    const title = document.createElement('h4')
    title.textContent = entry.title
    item.appendChild(title)

    const desc = document.createElement('p')
    pushRichText(desc, entry.desc || '')
    item.appendChild(desc)

    if (entry.example) {
        const example = document.createElement('pre')
        example.className = 'docs-item__example'
        example.textContent = entry.example
        item.appendChild(example)
    }

    wrap.appendChild(item)
    return wrap
}

// tool tip extension
function hoverSource(view, pos) {
    // Don't show docs when hovering over commented-out text or string literals.
    const cur = syntaxTree(view.state).resolveInner(pos, -1)
    if (cur.name === 'comment' || cur.name === 'string') return null
    const token = tokenAt(view.state, pos)
    if (!token) return null
    const entry = DOC_LOOKUP.get(token.text)
    if (!entry) return null
    return {
        pos: token.from,
        end: token.to,
        create: () => ({ dom: buildDocNode(entry) }),
    }
}

export const riscvHover = hoverTooltip(hoverSource)

// lazy loaded completion docs
export function completionInfoFor(entry) {
    return () => {
        if (!useSettingsStore.getState().showCompletionDocs) return null
        return { dom: buildDocNode(entry) }
    }
}
