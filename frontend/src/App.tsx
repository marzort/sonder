import { useEffect, useState, useRef } from 'react'
import AuthForm from './components/AuthForm'
import Profile from './components/Profile'
import { getProfile } from './api'
import type { UserProfile } from './api'
import Campus from './components/Campus'
import skyBackground from './assets/sky_background.png'
import LocationTest from './components/LocationTest'

function App() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('access_token')
  )

  const [profile, setProfile] = useState<UserProfile | null>(null)

  const [loading, setLoading] = useState(true)

  const [players, setPlayers] = useState<
    Record<number, { x: number, y: number }>
  >({})

  const [screen, setScreen] = useState<'profile' | 'campus' | 'explore'>('profile')

  const socketRef = useRef<WebSocket | null>(null)

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
        setPlayers({})
      } finally {
        setLoading(false)
      }
    }

    loadExistingSession()
  }, [token])

  useEffect(() => {
    if (!token) {
      return
    }

    const socket = new WebSocket(
      `ws://localhost:8000/ws?token=${token}`
    )

    socketRef.current = socket

    socket.onopen = () => {
      console.log('WebSocket connected')
    }

    socket.onmessage = (event) => {
      console.log('WebSocket message:', event.data)

      const data = JSON.parse(event.data)

      if (data.type === 'welcome') {
        setPlayers(data.players)
      }

      if (data.type === 'player_moved') {
        setPlayers((current) => ({
          ...current,
          [data.user_id]: {
            x: data.x,
            y: data.y
          }
        }))
      }

      if (data.type === 'player_joined') {
        setPlayers((current) => ({
          ...current,
          [data.user_id]: {
            x: data.x,
            y: data.y
          }
        }))
      }

      if (data.type === 'player_left') {
        setPlayers((current) => {
          const updated = { ...current }
          delete updated[data.user_id]
          return updated
        })
      }
    }

    socket.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    socket.onclose = (event) => {
      console.log(
        'WebSocket closed:',
        event.code,
        event.reason
      )
    }

    return () => {
      socket.close()
      socketRef.current = null
    }
  }, [token])

  function handleMove(
    direction: 'up' | 'down' | 'left' | 'right'
  ) {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: 'move',
          direction
        })
      )
    }
  }

  function handleLogin(accessToken: string) {
    setToken(accessToken)
  }

  async function handleLogout() {
    const token = localStorage.getItem('access_token')

    try {
      await fetch('http://localhost:8000/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    } catch (error) {
      console.error('Logout request failed:', error)
    } finally {
      localStorage.removeItem('access_token')
      setToken(null)
      setProfile(null)
      setPlayers({})
    }
  }

  function handleCampusLaunch() {
    setScreen('campus')
  }

  function handleCampusBack() {
    setScreen('profile')
  }

  function handleExplore() {
    setScreen('explore')
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
    <main 
      className={`app ${!profile ? 'auth-background' : `${screen}-background`}`}
      style={
        !profile
          ? { backgroundImage: `url(${skyBackground})` }
          : undefined
      }
    >
      <div className="app-container">
        <header className="app-header">
          <h1>Sonder</h1>
          <p>Connect with the world around you.</p>
        </header>

      {!profile && (
        <AuthForm onLogin={handleLogin} />
      )}

      {profile && token && screen === 'profile' && (
        <Profile 
          profile={profile}
          token={token}
          onLogout={handleLogout}
          onProfileUpdate={setProfile}
          onCampusLaunch={handleCampusLaunch}
          onExplore={handleExplore}
        />
      )}

      {profile && token && screen === 'campus' && (
        <Campus
          profile={profile}
          players={players}
          onBack={handleCampusBack}
          onMove={handleMove}
        />
      )}

      {profile && token && screen === 'explore' && (
        <LocationTest/>
      )}
      </div>
    </main>
  )
}

export default App