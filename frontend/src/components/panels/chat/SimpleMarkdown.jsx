export function SimpleMarkdown({ content }) {
  if (!content) return null

  let html = content
    // code blocks
    .replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    // headings 
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // bold, inline code, italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // blank lines = paragraph breaks
    .replace(/\n{2,}/g, '</p><p>')

  return <div className="markdown-body" dangerouslySetInnerHTML={{ __html: `<p>${html}</p>` }} />
}
