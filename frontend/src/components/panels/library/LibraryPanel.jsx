import { useState, useMemo } from 'react'
import './LibraryPanel.css'
import { useLibraryStore } from '../../../store/libraryStore'

export default function LibraryPanel() {
  // ── Store Selectors & Actions ──
  const examples      = useLibraryStore(s => s.examples)
  const search        = useLibraryStore(s => s.search)

  const setSearch     = useLibraryStore(s => s.setSearch)
  const selectExample = useLibraryStore(s => s.selectExample)

  // example data is static, so all categories start expanded
  const [expanded, setExpanded] = useState(
    () => new Set(examples.map(i => i.category || 'Other'))
  )

  // ── Handlers ──
  const handleSearchChange = (e) => {
    setSearch(e.target.value)
  }

  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = q ? examples.filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.description?.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q)
    ) : examples
    return filtered.reduce((acc, i) => ((acc[i.category || 'Other'] ??= []).push(i), acc), {})
  }, [search, examples])

  const numCategories = Object.keys(grouped).length
  const isAllExpanded = numCategories > 0 && expanded.size >= numCategories

  const handleToggleAll = () => {
    if (isAllExpanded) {
      setExpanded(new Set())
    } else {
      setExpanded(new Set(Object.keys(grouped)))
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

  return (
    <div className="library-panel">
        {/* Search Bar */}
        <div className="library-panel__search-wrap">
          <input
            type="text"
            className="ui-input library-panel__search-input"
            placeholder="Search examples..."
            value={search}
            onChange={handleSearchChange}
          />
          <button
            className="icon-btn library-panel__action-btn"
            onClick={handleToggleAll}
            title={isAllExpanded ? "Collapse All" : "Expand All"}
          >
            {isAllExpanded ? "▼" : "▲"}
          </button>
        </div>

        {/* Content Body */}
        <div className="library-panel__body">
          {Object.keys(grouped).length === 0 && (
            <div className="library-panel__status">No matching code examples found.</div>
          )}

          {Object.entries(grouped).sort(([a], [b]) => {
              const order = { 'Basic': 1, 'Intermediate': 2, 'Graphics': 3 }
              return (order[a] || 99) - (order[b] || 99)
            }).map(([category, items]) => (
              <details
                key={category}
                className="library-category"
                open={expanded.has(category)}
                onToggle={(e) => handleToggle(category, e.currentTarget.open)}
              >
                <summary className="library-category__summary">{category}</summary>
                <div className="library-panel__items">
                  {items.map(item => (
                    <button
                      key={item.id}
                      className="library-panel__item"
                      onClick={() => selectExample(item.id)}
                    >
                      <div className="library-panel__item-title">{item.title}</div>
                      {item.description && (
                        <div className="library-panel__item-desc">
                          {item.description}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </details>
            ))}
        </div>
    </div>
  )
}
