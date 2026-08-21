import { useEffect, useState, useMemo } from 'react'
import './LibraryPanel.css'
import { useLibraryStore } from '../../../store/libraryStore'
import ModalWrapper from '../../ui/ModalWrapper'

export default function LibraryPanel({ onClose }) {
  // ── Store Selectors & Actions ──
  const examples      = useLibraryStore(s => s.examples)
  const search        = useLibraryStore(s => s.search)
  
  const setSearch     = useLibraryStore(s => s.setSearch)
  const selectExample = useLibraryStore(s => s.selectExample)

  const [expanded, setExpanded] = useState(new Set())

  // Expand all when examples are loaded for the first time
  useEffect(() => {
    if (examples.length > 0 && expanded.size === 0) {
      setExpanded(new Set(examples.map(i => i.category || 'Other')))
    }
  }, [examples])

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
    <ModalWrapper title="Code Library" onClose={onClose} style={{ maxWidth: '680px' }}>
        {/* Search Bar */}
        <div className="library-modal__search-wrap">
          <input
            type="text"
            className="ui-input library-modal__search-input"
            placeholder="Search examples..."
            value={search}
            autoFocus
            onChange={handleSearchChange}
          />
          <button
            className="icon-btn library-modal__action-btn"
            onClick={handleToggleAll}
            title={isAllExpanded ? "Collapse All" : "Expand All"}
          >
            {isAllExpanded ? "▼" : "▲"}
          </button>
        </div>

        {/* Content Body */}
        <div className="library-modal__body">
          {Object.keys(grouped).length === 0 && (
            <div className="library-modal__status">No matching code examples found.</div>
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
                <div className="library-modal__items">
                  {items.map(item => (
                    <button
                      key={item.id}
                      className="library-modal__item"
                      onClick={() => selectExample(item.id, onClose)}
                    >
                      <div className="library-modal__item-title">{item.title}</div>
                      {item.description && (
                        <div className="library-modal__item-desc">
                          {item.description}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </details>
            ))}
        </div>
    </ModalWrapper>
  )
}
