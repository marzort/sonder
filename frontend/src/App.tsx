import { useEffect, useState, useRef } from 'react'
import AuthForm from './components/AuthForm'
import Profile from './components/Profile'
import { getProfile } from './api'
import type { UserProfile } from './api'
import Campus from './components/Campus'
import skyBackground from './assets/sky_background.png'
import LocationTest from './components/LocationTest'
import Meetings from './components/Meetings'
import './menu.css'

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

  const [screen, setScreen] = useState<
    'profile' | 'campus' | 'explore' | 'meetings'
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
        <header className="menu">
          <h1>Sonder</h1>
          <ul className="nav-links">
            <li>
              <button className="menu-button" onClick={handleCampusBack}>
                Profile
              </button>
            </li>
            <li>
              <button className="menu-button" onClick={handleCampusLaunch}>
                Campus
              </button>
            </li>
            <li>
              <button className="menu-button" onClick={handleExplore}>
                Explore
              </button>
            </li>
            <button className="menu-button" onClick={handleLogout}>
                Log Out
            </button>
          </ul>
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
        <Meetings
          profile={profile}
          token={token}
          onMeetingCountChange={setMeetingCount}
        />
      )}
      </div>
    </main>
  )
}

export default App