import { useState, useMemo } from 'react'
import { DOCS_DATA } from '../../../data/docsData'
import { useUIStore } from '../../../store/uiStore'
import copyIcon from '../../../assets/copy.svg'
import './DocsPanel.css'

export default function DocsPanel() {
  // ── Local State ──
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(() => new Set())
  const addToast = useUIStore(s => s.addToast)

  // ── Handlers ──
  const handleSearchChange = (e) => {
    setSearch(e.target.value)
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    addToast('Copied', 'success', 1500)
  }

  const isAllExpanded = expanded.size >= DOCS_DATA.length

  const handleToggleAll = () => {
    if (isAllExpanded) {
      setExpanded(new Set())
    } else {
      setExpanded(new Set(DOCS_DATA.map(d => d.category)))
    }
  }

  const handleToggle = (category, isOpen) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (isOpen) next.add(category)
      else next.delete(category)
      return next
    })
  }

  // ── Derived State ──
  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return DOCS_DATA

    return DOCS_DATA.map(section => {
      if (section.category.toLowerCase().includes(q)) {
        return section
      }

      const matchingItems = section.items.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q)
      )

      return { ...section, items: matchingItems }
    }).filter(section => section.items.length > 0)
  }, [search])

  return (
    <div className="docs-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="docs-panel__header">
          <input
            type="text"
            className="ui-input docs-panel__search"
            placeholder="Search..."
            value={search}
            onChange={handleSearchChange}
          />
          <div className="docs-panel__actions">
            <button
              className="icon-btn docs-panel__action-btn"
              onClick={handleToggleAll}
              title={isAllExpanded ? "Collapse All" : "Expand All"}
            >
              {isAllExpanded ? "▼" : "▲"}
            </button>
          </div>
        </div>

        <div className="docs-panel__content">
          {filteredData.length === 0 ? (
            <div className="docs-panel__empty">No results found for "{search}"</div>
          ) : (
            filteredData.map(section => (
              <details
                key={section.category}
                className="docs-category"
                open={expanded.has(section.category)}
                onToggle={(e) => handleToggle(section.category, e.currentTarget.open)}
              >
                <summary>{section.category}</summary>

                {section.items.map((item, idx) => (
                  <div key={idx} className="docs-item">
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                    {item.example && (
                      <div className="docs-item__example-wrapper">
                        <button
                          className="docs-item__copy-btn"
                          onClick={() => handleCopy(item.example)}
                          title="Copy to clipboard"
                          aria-label="Copy code example"
                        >
                          <img src={copyIcon} alt="" className="docs-item__copy-icon" />
                        </button>
                        <pre className="docs-item__example">{item.example}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </details>
            ))
          )}
        </div>
    </div>
  )
}
