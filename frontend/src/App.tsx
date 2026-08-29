import { useEffect, useState } from 'react'
import AuthForm from './components/AuthForm'
import Profile from './components/Profile'
import { getProfile } from './api'
import type { UserProfile } from './api'
import AvatarCustomizer from './components/AvatarCustomizer'

function App() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('access_token')
  )

  const [profile, setProfile] = useState<UserProfile | null>(null)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadExistingSession() {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const data = await getProfile(token)
        setProfile(data)
      } catch {
        localStorage.removeItem('access_token')
        setToken(null)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    loadExistingSession()
  }, [token])

  function handleLogin(accessToken: string) {
    setToken(accessToken)
  }

  function handleLogout() {
    localStorage.removeItem('access_token')
    setToken(null)
    setProfile(null)
  }

  if (loading) {
    return (
      <main className="app">
        <div className="loading-card">
          <h1>CampusPass</h1>
          <p>Loading your campus...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="app">
      <div className="app-container">
        <header className="app-header">
          <h1>DiceBear Test</h1>
          <AvatarCustomizer />
          <h1>CampusPass</h1>
          <p>Your campus. Your character. Your community.</p>
        </header>

      {!profile && (
        <AuthForm onLogin={handleLogin} />
      )}

      {profile && token && (
        <Profile 
          profile={profile}
          token={token}
          onLogout={handleLogout}
          onProfileUpdate={setProfile}
        />
      )}
      </div>
    </main>
  )
}

export default App