import '../App.css'
import { useState, useCallback, useEffect } from 'react'
import MainLayout from './layout/MainLayout'
import TopBar from './layout/TopBar'
import LeftSideBar from './layout/LeftSideBar'
import RightSideBar from './layout/RightSideBar'
import DocsPanel from './panels/docs/DocsPanel'
import EditorPanel from './layout/EditorPanel'
import BottomPanel from './layout/BottomPanel'
import ResizeDivider from './ui/ResizeDivider'
import ToastContainer from './ui/ToastContainer'
import { useUIStore } from '../store/uiStore'

// Size constraints
const LEFT_MIN = 160; const LEFT_MAX = 480
const RIGHT_MIN = 280; const RIGHT_MAX = 800
const BOTTOM_MIN = 80; const BOTTOM_MAX = 520
const DOCS_MIN = 280; const DOCS_MAX = 800 // left panel too small for it

function App() {
  // ── Local State ──
  const [leftWidth, setLeftWidth] = useState(180)
  const [docsWidth, setDocsWidth] = useState(420)
  const [rightWidth, setRightWidth] = useState(420)
  const [bottomHeight, setBottomHeight] = useState(180)

  // ── Store Selectors ──
  const isChatOpen = useUIStore(s => s.isChatOpen)
  const isDocsOpen = useUIStore(s => s.isDocsOpen)
  const theme = useUIStore(s => s.theme)

  // ── Effects ──
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // ── Handlers ──
  const onLeftResize = useCallback((d) => setLeftWidth(w => Math.max(LEFT_MIN, Math.min(LEFT_MAX, w + d))), [])
  const onDocsResize = useCallback((d) => setDocsWidth(w => Math.max(DOCS_MIN, Math.min(DOCS_MAX, w + d))), [])
  const onRightResize = useCallback((d) => setRightWidth(w => Math.max(RIGHT_MIN, Math.min(RIGHT_MAX, w - d))), [])
  const onBottomResize = useCallback((d) => setBottomHeight(h => Math.max(BOTTOM_MIN, Math.min(BOTTOM_MAX, h - d))), [])

  return (
    <MainLayout>
      <TopBar />

      <div className="workspace">
        {/* Left sidebar */}
        {isDocsOpen ? (
          <DocsPanel style={{ width: docsWidth }} />
        ) : (
          <LeftSideBar style={{ width: leftWidth }} />
        )}

        <ResizeDivider
          direction="horizontal"
          onDrag={isDocsOpen ? onDocsResize : onLeftResize}
        />

        {/* Center: Editor + bottom panel */}
        <div className="center-col">
          <EditorPanel />
          <ResizeDivider
            direction="vertical"
            onDrag={onBottomResize}
          />
          <BottomPanel style={{ height: bottomHeight }} />
        </div>

        {/* Right sidebar */}
        {isChatOpen && (
          <>
            <ResizeDivider
              direction="horizontal"
              onDrag={onRightResize}
            />
            <RightSideBar style={{ width: rightWidth }} />
          </>
        )}
      </div>

      <ToastContainer />
    </MainLayout>
  )
}

export default App
