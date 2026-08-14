export function SimpleMarkdown({ content }) {
  if (!content) return null

  // 1. Extract fenced code blocks first, replacing them with placeholders
  const codeBlocks = []
  let processed = content.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const index = codeBlocks.length
    codeBlocks.push(
      `<div class="chat-codeblock">` +
        `<pre><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>` +
      `</div>`
    )
    return `%%CODEBLOCK_${index}%%`
  })

  // 2. Extract inline code, protecting it from further transforms
  const inlineCode = []
  processed = processed.replace(/`([^`]+)`/g, (_, code) => {
    const index = inlineCode.length
    inlineCode.push(`<code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>`)
    return `%%INLINE_${index}%%`
  })

  // 3. Now apply block-level and inline markdown (safe — no code left)
  processed = processed
    // headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // bold, italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // blank lines → paragraph breaks
    .replace(/\n{2,}/g, '</p><p>')

  // 4. Restore inline code
  processed = processed.replace(/%%INLINE_(\d+)%%/g, (_, i) => inlineCode[i])

  // 5. Restore code blocks
  processed = processed.replace(/%%CODEBLOCK_(\d+)%%/g, (_, i) => codeBlocks[i])

  return <div className="markdown-body" dangerouslySetInnerHTML={{ __html: `<p>${processed}</p>` }} />
}
