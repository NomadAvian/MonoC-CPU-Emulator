export function SimpleMarkdown({ content }) {
  if (!content) return null

  // 1. extract fenced code blocks first, replacing them with placeholders
  const codeBlocks = []
  let processed = content.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const index = codeBlocks.length
    const cleanCode = code.replace(/</g, '<').replace(/>/g, '>')
    codeBlocks.push(
      `<div class="chat-codeblock">` +
        `<div class="chat-codeblock__header">` +
          (lang ? `<span class="chat-codeblock__lang">${lang}</span>` : '') +
          `<button class="chat-codeblock__copy-btn" data-code="${cleanCode.replace(/"/g, '"')}" title="Copy to clipboard">` +
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>` +
          `</button>` +
        `</div>` +
        `<pre><code>${cleanCode}</code></pre>` +
      `</div>`
    )
    return `%%CODEBLOCK_${index}%%`
  })

  // 2. extract inline code, protecting it from further transforms
  const inlineCode = []
  processed = processed.replace(/`([^`]+)`/g, (_, code) => {
    const index = inlineCode.length
    inlineCode.push(`<code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>`)
    return `%%INLINE_${index}%%`
  })

  // 3. clean up LaTeX math notation 
  processed = processed.replace(/\$\$?([\s\S]+?)\$\$?/g, (_, math) => {
    return math.replace(/\\text\{([^}]+)\}/g, '$1').replace(/\\/g, '')
  })

  // 4. apply block-level and inline markdown 
  processed = processed
    // headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // bold, italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // lists
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    // blank lines → paragraph breaks
    .replace(/\n{2,}/g, '</p><p>')

  // 4. Restore inline code
  processed = processed.replace(/%%INLINE_(\d+)%%/g, (_, i) => inlineCode[i])

  // 5. Restore code blocks
  processed = processed.replace(/%%CODEBLOCK_(\d+)%%/g, (_, i) => codeBlocks[i])

  return <div className="markdown-body" dangerouslySetInnerHTML={{ __html: processed }} />
}
