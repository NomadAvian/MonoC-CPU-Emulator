import './MainLayout.css'
import { useEffect } from 'react'
import { useUIStore } from '../../store/uiStore'

export default function MainLayout({ children }) {
  const theme = useUIStore(s => s.theme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return (
    <div className="main-layout">
      {children}
    </div>
  )
}
