import { useState } from 'react'
import { useAuthStore } from '../../../store/authStore'
import { useUIStore } from '../../../store/uiStore'
import ModalWrapper from '../../ui/ModalWrapper'
import './AuthModal.css'

export default function AuthModal({ onClose }) {
  // ── Local State ──
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // ── Store Actions ──
  const login  = useAuthStore(s => s.login)
  const signup = useAuthStore(s => s.signup)
  const addToast = useUIStore(s => s.addToast)

  // ── Handlers ──
  const handleUsernameChange = (e) => setUsername(e.target.value)
  const handleEmailChange    = (e) => setEmail(e.target.value)
  const handlePasswordChange = (e) => setPassword(e.target.value)

  const handleToggleMode = () => {
    setIsLogin(!isLogin)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (isLogin) {
        await login(email, password)
        addToast('Welcome back!', 'success')
      } else {
        await signup(username, email, password)
        addToast('Signed up successfully!', 'success')
      }
      onClose() 
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ModalWrapper title={isLogin ? 'Welcome!' : 'Create Account'} onClose={onClose}>
      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        {!isLogin && (
          <input 
            type="text" 
            className="ui-input" 
            placeholder="Username" 
            value={username} 
            onChange={handleUsernameChange} 
            required 
          />
        )}
        <input 
          type="email" 
          className="ui-input" 
          placeholder="Email" 
          value={email} 
          onChange={handleEmailChange} 
          required 
        />
        <input
          type="password"
          className="ui-input"
          placeholder={isLogin ? "Password" : "Password (min 8 chars)"}
          value={password}
          onChange={handlePasswordChange}
          minLength={isLogin ? undefined : 8}
          required
        />
        
        <button
          type="submit"
          className="ui-button ui-button--accent auth-submit"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : (isLogin ? 'Log In' : 'Sign Up')}
        </button>
      </form>

      <p className="auth-toggle">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button type="button" className="text-btn" onClick={handleToggleMode}>
          {isLogin ? 'Sign up' : 'Log in'}
        </button>
      </p>
    </ModalWrapper>
  )
}
