
import { useState, useEffect } from 'react'
import axios from 'axios'
import UserManagement from './UserManagement'

function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('users')
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    regularUsers: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/users')
      const users = response.data
      setStats({
        totalUsers: users.length,
        adminUsers: users.filter(u => u.role === 'admin').length,
        regularUsers: users.filter(u => u.role === 'user').length
      })
    } catch (error) {
      console.error('სტატისტიკის მიღების შეცდომა:', error)
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Admin Panel</h1>
          <div className="user-info">
            <span>მოგესალმებით, {user.username}!</span>
            <button onClick={onLogout} className="logout-button">
              გასვლა
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <nav className="dashboard-nav">
          <button
            className={`nav-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            მომხმარებლები
          </button>
          <button
            className={`nav-button ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            სტატისტიკა
          </button>
        </nav>

        <main className="dashboard-main">
          {activeTab === 'users' && (
            <UserManagement onStatsUpdate={fetchStats} />
          )}
          
          {activeTab === 'stats' && (
            <div className="stats-container">
              <h2>სისტემის სტატისტიკა</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>სულ მომხმარებლები</h3>
                  <div className="stat-number">{stats.totalUsers}</div>
                </div>
                <div className="stat-card">
                  <h3>ადმინისტრატორები</h3>
                  <div className="stat-number">{stats.adminUsers}</div>
                </div>
                <div className="stat-card">
                  <h3>რეგულარული მომხმარებლები</h3>
                  <div className="stat-number">{stats.regularUsers}</div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard
