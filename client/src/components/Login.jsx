
import { useState } from 'react'
import axios from 'axios'

function Login({ onLogin, onSwitchToRegister }) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await axios.post('/api/login', formData)
      onLogin(response.data.user, response.data.token)
    } catch (error) {
      setError(error.response?.data?.message || 'შესვლა ვერ მოხერხდა')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="form-group">
        <label htmlFor="username">მომხმარებლის სახელი:</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">პაროლი:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <button type="submit" disabled={loading} className="auth-button">
        {loading ? 'იტვირთება...' : 'შესვლა'}
      </button>

      <p className="auth-switch">
        არ გაქვთ ანგარიში?{' '}
        <button type="button" onClick={onSwitchToRegister} className="link-button">
          რეგისტრაცია
        </button>
      </p>
    </form>
  )
}

export default Login
