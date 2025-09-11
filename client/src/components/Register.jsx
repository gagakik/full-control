
import { useState } from 'react'
import axios from 'axios'

function Register({ onRegister, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (formData.password !== formData.confirmPassword) {
      setError('პაროლები არ ემთხვევა')
      setLoading(false)
      return
    }

    try {
      await axios.post('/api/register', {
        username: formData.username,
        password: formData.password
      })
      setSuccess('რეგისტრაცია წარმატებით დასრულდა! ახლა შეგიძლიათ შეხვიდეთ.')
      setTimeout(() => {
        onRegister()
      }, 2000)
    } catch (error) {
      setError(error.response?.data?.message || 'რეგისტრაცია ვერ მოხერხდა')
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

      <div className="form-group">
        <label htmlFor="confirmPassword">პაროლის დადასტურება:</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <button type="submit" disabled={loading} className="auth-button">
        {loading ? 'იტვირთება...' : 'რეგისტრაცია'}
      </button>

      <p className="auth-switch">
        უკვე გაქვთ ანგარიში?{' '}
        <button type="button" onClick={onSwitchToLogin} className="link-button">
          შესვლა
        </button>
      </p>
    </form>
  )
}

export default Register
