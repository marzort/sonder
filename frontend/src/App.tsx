import { useEffect, useState } from 'react'

type User = {
  id: number
  username: string
  created_at: string
}

function App() {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    async function loadUsers() {
      const response = await window.fetch('http://localhost:8000/users')
      const data = await response.json()

      setUsers(data)
    }

    loadUsers()
  }, [])

  return (
    <main>
      <h1>Project Campus</h1>

      <h2>Users</h2>

      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.username}</li>
        ))}
      </ul>
    </main>
  )
}

export default App