import '../App.css'
import { useCallback, useEffect } from 'react'
import { AnimatePresence } from 'motion/react'
import MainLayout from './layout/MainLayout'
import TopBar from './layout/TopBar'
import LeftSideBar from './layout/LeftSideBar'
import RightSideBar from './layout/RightSideBar'
import DocsPanel from './panels/docs/DocsPanel'
import ScreenPanel from './panels/screen/ScreenPanel'
import EditorPanel from './layout/EditorPanel'
import BottomPanel from './layout/BottomPanel'
import ResizeDivider from './ui/ResizeDivider'
import ToastContainer from './ui/ToastContainer'
import { useUIStore } from '../store/uiStore'
import { useScreenStore } from '../store/screenStore'

// Size constraints
const LEFT_MIN = 160; const LEFT_MAX = 480
const RIGHT_MIN = 280; const RIGHT_MAX = 800
const BOTTOM_MIN = 80; const BOTTOM_MAX = 520
const DOCS_MIN = 280; const DOCS_MAX = 800 // left panel too small for it

function App() {
  // ── Store Selectors ──
  const leftWidth = useUIStore(s => s.leftWidth)
  const docsWidth = useUIStore(s => s.docsWidth)
  const rightWidth = useUIStore(s => s.rightWidth)
  const bottomHeight = useUIStore(s => s.bottomHeight)

  // ── Store Selectors ──
  const isChatOpen = useUIStore(s => s.isChatOpen)
  const isDocsOpen = useUIStore(s => s.isDocsOpen)
  const theme = useUIStore(s => s.theme)
  const isScreenOpen = useScreenStore(s => s.isScreenOpen)

  // ── Effects ──
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const onLeftResize = useCallback((d) => {
    useUIStore.setState(s => ({ leftWidth: Math.max(LEFT_MIN, Math.min(LEFT_MAX, s.leftWidth + d)) }))
  }, [])
  const onDocsResize = useCallback((d) => {
    useUIStore.setState(s => ({ docsWidth: Math.max(DOCS_MIN, Math.min(DOCS_MAX, s.docsWidth + d)) }))
  }, [])
  const onRightResize = useCallback((d) => {
    useUIStore.setState(s => ({ rightWidth: Math.max(RIGHT_MIN, Math.min(RIGHT_MAX, s.rightWidth - d)) }))
  }, [])
  const onBottomResize = useCallback((d) => {
    useUIStore.setState(s => ({ bottomHeight: Math.max(BOTTOM_MIN, Math.min(BOTTOM_MAX, s.bottomHeight - d)) }))
  }, [])

  return (
    <MainLayout>
      <TopBar />

      <div className="workspace">
        {/* Left sidebar */}
        <AnimatePresence mode="popLayout">
          {isDocsOpen ? (
            <DocsPanel key="docs" style={{ width: docsWidth }} />
          ) : (
            <LeftSideBar key="left-sidebar" style={{ width: leftWidth }} />
          )}
        </AnimatePresence>

        <ResizeDivider
          direction="horizontal"
          onDrag={isDocsOpen ? onDocsResize : onLeftResize}
        />

        {/* Center: Editor + bottom panel */}
        <div className="center-col">
          <div className="center-top-row">
            <EditorPanel />
            {/* Screen aligns to the width */}
            {isScreenOpen && (
              <>
                <ResizeDivider direction="horizontal" onDrag={onRightResize} />
                <ScreenPanel style={{ width: rightWidth }} />
              </>
            )}
          </div>
          <ResizeDivider direction="vertical" onDrag={onBottomResize} />
          <BottomPanel style={{ height: bottomHeight }} />
        </div>

        {/* Right sidebar */}
        {isChatOpen && (
          <ResizeDivider
            direction="horizontal"
            onDrag={onRightResize}
          />
        )}
        <AnimatePresence>
          {isChatOpen && (
            <RightSideBar key="right-sidebar" style={{ width: rightWidth }} />
          )}
        </AnimatePresence>
      </div>

      <ToastContainer />
    </MainLayout>
  )
}

export default App
