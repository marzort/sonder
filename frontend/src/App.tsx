import { useEffect, useState, useRef } from 'react'
import AuthForm from './components/AuthForm'
import Profile from './components/Profile'
import { getProfile } from './api'
import type { UserProfile } from './api'
import Campus from './components/Campus'
import skyBackground from './assets/sky_background.png'
import LocationTest from './components/LocationTest'
import ViewMeetings from './components/viewMeetings'
import './templates/menu.css'
import Garden from './components/Garden'

function App() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('access_token')
  )

  const [profile, setProfile] = useState<UserProfile | null>(null)

  const [loading, setLoading] = useState(true)

  const [players, setPlayers] = useState<
    Record<number, { x: number, y: number }>
  >({})

  const [meetingCount, setMeetingCount] = useState(0)

  const [menuOpen, setMenuOpen] = useState(false)

  const [screen, setScreen] = useState<
    'profile' | 'campus' | 'explore' | 'meetings' | 'garden'
  >('profile')

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
      `${import.meta.env.VITE_WS_URL}/ws?token=${token}`
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
        setMeetingCount(data.unviewed_meeting_count)
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

      if (data.type === 'meeting_count_updated') {
        setMeetingCount(data.count)
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
      await fetch(`${import.meta.env.VITE_API_URL}/logout`, {
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

  function handleCampusBack() {
    setScreen('profile')
  }

  function handleMeetings() {
    setScreen('meetings')
  }

  if (loading) {
    return (
      <main className="app">
        <div className="loading-card">
          <h1>Sonder</h1>
          <p>Loading...</p>
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

      {!profile && (
        <AuthForm onLogin={handleLogin} />
      )}

      {profile && (
        <header className="navbar">
          <div className="navbar-container">
            <button
              className="navbar-brand"
              onClick={() => {
                setScreen('profile')
                setMenuOpen(false)
              }}
            >
              Sonder
            </button>

            <button
              className="navbar-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            <nav className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
              <ul className="nav-links">

                <li>
                  <button
                    className={screen === 'profile' ? 'nav-link active' : 'nav-link'}
                    onClick={() => {
                      setScreen('profile')
                      setMenuOpen(false)
                    }}
                  >
                    Profile
                  </button>
                </li>

                  <li>
                  <button
                    className={screen === 'campus' ? 'nav-link active' : 'nav-link'}
                    onClick={() => {
                      setScreen('campus')
                      setMenuOpen(false)
                    }}
                  >
                    Campus
                  </button>
                </li>

                <li>
                  <button
                    className={screen === 'explore' ? 'nav-link active' : 'nav-link'}
                    onClick={() => {
                      setScreen('explore')
                      setMenuOpen(false)
                    }}
                  >
                    Explore
                  </button>
                </li>

                <li>
                  <button
                    className={screen === 'garden' ? 'nav-link active' : 'nav-link'}
                    onClick={() => {
                      setScreen('garden')
                      setMenuOpen(false)
                    }}
                  >
                    Garden
                  </button>
                </li>

                <li className="logout-item">
                  <button
                    className="logout-button"
                    onClick={() => {
                      setMenuOpen(false)
                      handleLogout()
                    }}
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </header>
      )}

      {profile && token && screen === 'profile' && (
        <Profile 
          profile={profile}
          token={token}
          onProfileUpdate={setProfile}
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
        <LocationTest
          token={token}
          meetingCount={meetingCount}
          onMeetings={handleMeetings}
        />
      )}

      {profile && token && screen === 'meetings' && (
        <ViewMeetings
          profile={profile}
          token={token}
          onMeetingCountChange={setMeetingCount}
        />
      )}

      {profile && token && screen === 'garden' && (
        <Garden
          token={token}
        />
      )}
      </div>
    </main>
  )
}

export default App