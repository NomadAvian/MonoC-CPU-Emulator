import './MainLayout.css'
import { useEffect } from 'react'
import TopBar from './TopBar'
import { useSettingsStore } from '../../store/settingsStore'

export default function MainLayout({ children }) {
  const theme = useSettingsStore(s => s.theme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return (
    <div className="main-layout">
      {children}
    </div>
  )
}
