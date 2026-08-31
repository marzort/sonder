import { useEffect, useState, useRef } from 'react'
import AuthForm from './components/AuthForm'
import Profile from './components/Profile'
import { getProfile } from './api'
import type { UserProfile } from './api'

function App() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('access_token')
  )

  const [profile, setProfile] = useState<UserProfile | null>(null)

  const [loading, setLoading] = useState(true)

  const [players, setPlayers] = useState<
    Record<number, { x: number, y: number }>
  >({})

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

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      let direction: string | null = null
      
      if (event.key === 'ArrowUp') {
        direction = 'up'
      }

      if (event.key === 'ArrowDown') {
        direction = 'down'
      }

      if (event.key === 'ArrowLeft') {
        direction = 'left'
      }

      if (event.key === 'ArrowRight') {
        direction = 'right'
      }

      if (direction === null) {
        return
      }

      event.preventDefault()

      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: 'move',
            direction: direction
          })
        )
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

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
          <h1>CampusPass</h1>
          <p>Your campus. Your character. Your community.</p>

          <div
            style={{
              position: 'relative',
              width: '600px',
              height: '400px',
              border: '2px solid #333',
              overflow: 'hidden'
            }}
          >
            {Object.entries(players).map(([userId, player]) => (
              <div
                key={userId}
                style={{
                  position: 'absolute',
                  left: player.x,
                  top: player.y,
                  width: '30px',
                  height: '30px',
                  backgroundColor:
                    Number(userId) === profile?.id ? 'blue' : 'red',
                  borderRadius: '50%'
              }}
            />
            ))}
            
          </div>
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