import '../App.css'
import { useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import MainLayout from './layout/MainLayout'
import TopBar from './layout/TopBar'
import LeftSideBar from './layout/LeftSideBar'
import RightSideBar from './layout/RightSideBar'
import ScreenPanel from './panels/screen/ScreenPanel'
import EditorPanel from './layout/EditorPanel'
import BottomPanel from './layout/BottomPanel'
import ResizeDivider from './ui/ResizeDivider'
import ToastContainer from './ui/ToastContainer'
import { useUIStore } from '../store/uiStore'
import { useSettingsStore } from '../store/settingsStore'
import { useScreenStore } from '../store/screenStore'

// Size constraints
const LEFT_MIN = 260; const LEFT_MAX = 480
const RIGHT_MIN = 280; const RIGHT_MAX = 800
const BOTTOM_MIN = 80; const BOTTOM_MAX = 520

function App() {
  // ── Store Selectors ──
  const leftWidth = useUIStore(s => s.leftWidth)
  const rightWidth = useUIStore(s => s.rightWidth)
  const screenWidth = useUIStore(s => s.screenWidth)
  const bottomHeight = useUIStore(s => s.bottomHeight)

  // ── Store Selectors ──
  const isRightPanelOpen = useUIStore(s => s.isRightPanelOpen)
  const isLeftOpen = useUIStore(s => s.isLeftOpen)
  const theme = useSettingsStore(s => s.theme)
  const isScreenOpen = useScreenStore(s => s.isScreenOpen)

  // ── Effects ──
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const onLeftResize = useCallback((d) => {
    useUIStore.setState(s => ({ leftWidth: Math.max(LEFT_MIN, Math.min(LEFT_MAX, s.leftWidth + d)) }))
  }, [])
  const onRightResize = useCallback((d) => {
    useUIStore.setState(s => ({ rightWidth: Math.max(RIGHT_MIN, Math.min(RIGHT_MAX, s.rightWidth - d)) }))
  }, [])
  const onScreenResize = useCallback((d) => {
    useUIStore.setState(s => ({ screenWidth: Math.max(RIGHT_MIN, Math.min(RIGHT_MAX, s.screenWidth - d)) }))
  }, [])
  const onBottomResize = useCallback((d) => {
    useUIStore.setState(s => ({ bottomHeight: Math.max(BOTTOM_MIN, Math.min(BOTTOM_MAX, s.bottomHeight - d)) }))
  }, [])

  return (
    <MainLayout>
      <TopBar />

      <div className="workspace">
        {/* Left panel shell */}
        <motion.aside
          className="panel left-panel-shell"
          animate={{ width: isLeftOpen ? leftWidth : 34 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <div className="left-panel-shell__inner" style={{ width: isLeftOpen ? leftWidth : 34 }}>
            <LeftSideBar />
          </div>
        </motion.aside>

        <ResizeDivider
          direction="horizontal"
          onDrag={onLeftResize}
        />

        {/* Center: Editor + bottom panel */}
        <div className="center-col">
          <div className="center-top-row">
            <EditorPanel />
            {/* Screen aligns to the width */}
            <AnimatePresence>
              {isScreenOpen && (
                <motion.div
                  key="screen-panel-wrapper"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: screenWidth + 5 }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="screen-panel-wrapper"
                >
                  <ResizeDivider direction="horizontal" onDrag={onScreenResize} />
                  <ScreenPanel style={{ width: screenWidth }} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <ResizeDivider direction="vertical" onDrag={onBottomResize} />
          <BottomPanel style={{ height: bottomHeight }} />
        </div>

        {/* Right sidebar */}
        <AnimatePresence>
          {isRightPanelOpen && (
            <motion.div
              key="right-panel-wrapper"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: rightWidth + 5 }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="right-panel-wrapper"
            >
              <ResizeDivider
                direction="horizontal"
                onDrag={onRightResize}
              />
              <RightSideBar style={{ width: rightWidth }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ToastContainer />
    </MainLayout>
  )
}

export default App
