// creating a tiny parser because we only need to
// support [title](link) and not entire markdown style rendering.
// should probably be removed in the future

const LINK_RE = /\[([^\]]+)\]\(([^)\s]+)\)/g

export function renderRichText(text) {
  if (!text) return null

  const nodes = []
  let key = 0
  let last = 0

  const pushText = (str) => {
    // \n inside plain segments becomes a line break
    str.split('\n').forEach((line, i) => {
      if (i > 0) nodes.push(<br key={`br-${key++}`} />)
      if (line) nodes.push(line)
    })
  }

  for (const match of text.matchAll(LINK_RE)) {
    const [full, label, url] = match
    if (match.index > last) pushText(text.slice(last, match.index))
    nodes.push(
      <a key={`a-${key++}`} href={url} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    )
    last = match.index + full.length
  }
  pushText(text.slice(last))

  return nodes
}
