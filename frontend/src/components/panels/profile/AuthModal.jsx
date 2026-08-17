import { useState } from 'react'
import { useAuthStore } from '../../../store/authStore'
import closeIcon from '../../../assets/close.svg'
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

  // ── Handlers ──
  const handleUsernameChange = (e) => setUsername(e.target.value)
  const handleEmailChange    = (e) => setEmail(e.target.value)
  const handlePasswordChange = (e) => setPassword(e.target.value)

  const handleToggleMode = () => {
    setIsLogin(!isLogin)
    setError('')
  }

  const handleBackdropClick = () => {
    onClose()
  }

  const handleModalClick = (e) => {
    e.stopPropagation()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await signup(username, email, password)
      }
      onClose() // close modal on success
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="auth-modal" onClick={handleModalClick}>
        <h2>{isLogin ? 'Welcome!' : 'Create Account'}</h2>
        
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
            placeholder="Password" 
            value={password} 
            onChange={handlePasswordChange} 
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
          <button className="text-btn" onClick={handleToggleMode}>
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>

        <button className="modal-close" onClick={onClose}>
          <img src={closeIcon} alt="Close" />
        </button>
      </div>
    </div>
  )
}
