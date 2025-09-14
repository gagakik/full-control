
import { useState, useEffect } from 'react'
import axios from 'axios'

function UserManagement({ onStatsUpdate }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({ username: '', role: '' })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users')
      setUsers(response.data)
      onStatsUpdate()
    } catch (error) {
      setError('მომხმარებლების მიღება ვერ მოხერხდა')
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user.id)
    setEditForm({
      username: user.username,
      role: user.role
    })
  }

  const handleSave = async (userId) => {
    try {
      const response = await axios.put(`/api/users/${userId}`, editForm)
      setUsers(users.map(user => 
        user.id === userId ? response.data : user
      ))
      setEditingUser(null)
      onStatsUpdate()
    } catch (error) {
      setError('მომხმარებლის განახლება ვერ მოხერხდა')
      console.error('Error updating user:', error)
    }
  }

  const handleDelete = async (userId) => {
    if (window.confirm('ნამდვილად გსურთ ამ მომხმარებლის წაშლა?')) {
      try {
        await axios.delete(`/api/users/${userId}`)
        setUsers(users.filter(user => user.id !== userId))
        onStatsUpdate()
      } catch (error) {
        setError('მომხმარებლის წაშლა ვერ მოხერხდა')
        console.error('Error deleting user:', error)
      }
    }
  }

  const handleCancel = () => {
    setEditingUser(null)
    setEditForm({ username: '', role: '' })
  }

  if (loading) {
    return <div className="loading">მომხმარებლები იტვირთება...</div>
  }

  return (
    <div className="user-management">
      <h2>მომხმარებლების მენეჯმენტი</h2>
      
      {error && <div className="error-message">{error}</div>}

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>მომხმარებლის სახელი</th>
              <th>როლი</th>
              <th>შექმნის თარიღი</th>
              <th>მოქმედებები</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>
                  {editingUser === user.id ? (
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                      className="edit-input"
                    />
                  ) : (
                    user.username
                  )}
                </td>
                <td>
                  {editingUser === user.id ? (
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                      className="edit-select"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                    </select>
                  ) : (
                    <span className={`role-badge ${user.role}`}>
                      {user.role === 'admin' ? 'ადმინი' : 'მომხმარებელი'}
                    </span>
                  )}
                </td>
                <td>
                  {new Date(user.created_at).toLocaleDateString('ka-GE')}
                </td>
                <td>
                  <div className="action-buttons">
                    {editingUser === user.id ? (
                      <>
                        <button
                          onClick={() => handleSave(user.id)}
                          className="save-button"
                        >
                          შენახვა
                        </button>
                        <button
                          onClick={handleCancel}
                          className="cancel-button"
                        >
                          გაუქმება
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(user)}
                          className="edit-button"
                        >
                          რედაქტირება
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="delete-button"
                        >
                          წაშლა
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UserManagement
