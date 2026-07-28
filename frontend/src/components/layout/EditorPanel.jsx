import './EditorPanel.css'
import CodeEditor from '../editor/CodeEditor'
import ControlBar from '../editor/ControlBar'


export default function EditorPanel() {
  return (
    <div className="editor-panel">
      <div className="editor-panel__editor">
        <CodeEditor />
      </div>
      <ControlBar />
    </div>
  )
}
