import '../App.css'
import { useState, useCallback } from 'react'
import MainLayout from './layout/MainLayout'
import TopBar from './layout/TopBar'
import LeftSideBar from './layout/LeftSideBar'
import RightSideBar from './layout/RightSideBar'
import EditorPanel from './layout/EditorPanel'
import BottomPanel from './layout/BottomPanel'
import ResizeDivider from './ui/ResizeDivider'
import { useUIStore } from '../store/uiStore'

// Size constraints
const LEFT_MIN = 160; const LEFT_MAX = 480
const RIGHT_MIN = 280; const RIGHT_MAX = 800
const BOTTOM_MIN = 80; const BOTTOM_MAX = 520

function App() {
  // Panel sizes
  const [leftWidth, setLeftWidth] = useState(180)
  const [rightWidth, setRightWidth] = useState(420)
  const [bottomHeight, setBottomHeight] = useState(220)

  const isChatOpen = useUIStore(s => s.isChatOpen)

  // Resize handlers (incremental delta)
  const onLeftResize = useCallback((d) => setLeftWidth(w => Math.max(LEFT_MIN, Math.min(LEFT_MAX, w + d))), [])
  const onRightResize = useCallback((d) => setRightWidth(w => Math.max(RIGHT_MIN, Math.min(RIGHT_MAX, w - d))), [])
  const onBottomResize = useCallback((d) => setBottomHeight(h => Math.max(BOTTOM_MIN, Math.min(BOTTOM_MAX, h - d))), [])

  return (
    <MainLayout>
      <TopBar />

      <div className="workspace">
        {/* Left sidebar — width controlled by drag */}
        <LeftSideBar style={{ width: leftWidth }} />

        <ResizeDivider direction="horizontal" onDrag={onLeftResize} />

        {/* Center: Editor + bottom panel */}
        <div className="center-col">
          <EditorPanel />
          <ResizeDivider direction="vertical" onDrag={onBottomResize} />
          <BottomPanel style={{ height: bottomHeight }} />
        </div>

        {/* Right sidebar — collapsible */}
        {isChatOpen && (
          <>
            <ResizeDivider direction="horizontal" onDrag={onRightResize} />
            <RightSideBar
              style={{ width: rightWidth }}
            />
          </>
        )}
      </div>
    </MainLayout>
  )
}

export default App
