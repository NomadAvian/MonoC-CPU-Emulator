import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App>
        <MainLayout>
            <TopBar/>
            <LeftSideBar />
                <RegisterTab />
                <MemoryTab />
            <Editor/>
            <RightSideBar />
                <ChatPanel />
            <BottomPanel />
                <LogPanel />
        </MainLayout>
    </App>
  </StrictMode>,
)
