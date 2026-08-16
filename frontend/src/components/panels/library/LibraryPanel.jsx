import { useEffect, useMemo } from 'react'
import './LibraryPanel.css'
import closeIcon from '../../../assets/close.svg'
import { useLibraryStore } from '../../../store/libraryStore'

export default function LibraryPanel({ onClose }) {
  const { 
    examples, loading, error, search, loadingId, 
    setSearch, fetchExamples, selectExample 
  } = useLibraryStore()

  useEffect(() => {
    fetchExamples()
  }, [fetchExamples])

  // Ponytail: Inline filter and reduce for tiny arrays instead of bulky useMemo blocks.
  const q = search.trim().toLowerCase()
  const filtered = q ? examples.filter(i => 
    i.title.toLowerCase().includes(q) || 
    i.description?.toLowerCase().includes(q) || 
    i.category.toLowerCase().includes(q)
  ) : examples
  
  const grouped = filtered.reduce((acc, i) => ((acc[i.category || 'Other'] ??= []).push(i), acc), {})

  return (
    <div className="modal-overlay" id="library-overlay" onClick={onClose}>
      <div
        className="library-modal"
        id="library-modal"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="library-modal__header">
          <div className="library-modal__title-wrap">
            <span className="library-modal__title">Code Library</span>
            <span className="library-modal__subtitle">Example Programs</span>
          </div>
          <button
            id="library-close-btn"
            className="icon-btn library-modal__close-btn"
            onClick={onClose}
            aria-label="Close library"
          >
            <img src={closeIcon} alt="Close" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="library-modal__search-wrap">
          <input
            type="text"
            className="ui-input library-modal__search-input"
            placeholder="Search examples..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        {/* Content Body */}
        <div className="library-modal__body">
          {loading && (
            <div className="library-modal__status">Loading example library...</div>
          )}

          {error && (
            <div className="library-modal__status library-modal__status--error">
              {error}
            </div>
          )}

          {!loading && !error && Object.keys(grouped).length === 0 && (
            <div className="library-modal__status">No matching code examples found.</div>
          )}

          {!loading &&
            !error &&
            Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="library-modal__group">
                <div className="library-modal__category">{category}</div>
                <div className="library-modal__items">
                  {items.map(item => (
                    <button
                      key={item.id}
                      className={`library-modal__item ${loadingId === item.id ? 'loading' : ''}`}
                      onClick={() => selectExample(item.id, onClose)}
                      disabled={loadingId === item.id}
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
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
