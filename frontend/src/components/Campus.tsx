import type { UserProfile } from '../api'
import { buildings } from '../data/buildings'
import { useEffect, useRef, useState } from 'react'

interface CampusProps {
    profile: UserProfile
    players: Record<number, { x: number, y: number }>
    onBack: () => void
    onMove: (direction: 'up' | 'down' | 'left' | 'right') => void
}

function Campus({
    profile,
    players,
    onBack,
    onMove
}: CampusProps) {
  const viewportRef = useRef<HTMLDivElement>(null)

  const [viewportSize, setViewportSize] = useState({
    width: 900,
    height: 600
  })

  useEffect(() => {
    const element = viewportRef.current

    if (!element) {
      return
    }

    function updateViewportSize() {
      setViewportSize({
        width: element.clientWidth,
        height: element.clientHeight
      })
    }

    updateViewportSize()

    const observer = new ResizeObserver(updateViewportSize)
    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [])

  const currentPlayer = players[profile.id]

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    let direction : 'up' | 'down' | 'left' | 'right' | null = null

    if (event.key == 'ArrowUp' || event.key.toLowerCase() === 'w') {
      direction = 'up'
    }

    if (event.key == 'ArrowDown' || event.key.toLowerCase() === 's') {
      direction = 'down'
    }

    if (event.key == 'ArrowLeft' || event.key.toLowerCase() === 'a') {
      direction = 'left'
    }

    if (event.key == 'ArrowRight' || event.key.toLowerCase() === 'd') {
      direction = 'right'
    }

    if (!direction) {
      return
    }

    event.preventDefault()
    onMove(direction)
  }

  const WORLD_WIDTH = 2400
  const WORLD_HEIGHT = 1600

  const PLAYER_SIZE = 30

  const playerX = currentPlayer?.x ?? WORLD_WIDTH / 2
  const playerY = currentPlayer?.y ?? WORLD_HEIGHT / 2

  const cameraX = Math.max(
    Math.min(
      viewportSize.width / 2 - (playerX + PLAYER_SIZE / 2),
      0
    ),
    viewportSize.width - WORLD_WIDTH
  )

  const cameraY = Math.max(
    Math.min(
      viewportSize.height / 2 - (playerY + PLAYER_SIZE / 2),
      0
    ),
    viewportSize.height - WORLD_HEIGHT
  )


    return (
        <section className="campus-screen">
            <div className="campus-header">
                <div>
                    <p className="profile-label">Campus</p>
                    <h2>Welcome to campus, {profile.username}</h2>
                </div>

                <button
                    className="primary-button"
                    onClick={onBack}
                >
                    Back to Profile
                </button>
            </div>

            <div
              ref={viewportRef}
              tabIndex={0}
              onKeyDown={handleKeyDown}
              style={{
                width: '100%',
                maxWidth: '900px',
                height: '600px',
                overflow: 'hidden',
                border: '2px solid #333',
                position: 'relative',
                outline: 'none'
              }}
              >
                {/*world*/}
                <div
                  style={{
                    position: 'absolute',
                    width: `${WORLD_WIDTH}px`,
                    height: `${WORLD_HEIGHT}px`,
                    transform: `translate(${cameraX}px, ${cameraY}px)`,
                    backgroundColor: '#7dbb68'
                  }}
                  >
                    {/*buildings*/}
                    {buildings.map((building) => (
                      <div
                        key={building.id}
                        style={{
                          position: 'absolute',
                          left: building.x,
                          top: building.y,
                          width: building.width,
                          height: building.height,
                          backgroundColor: building.color ?? '#888',
                          border: '2px solid #444',
                          boxSizing: 'border-box'
                        }}
                        >
                          <span
                            style={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              height: '100%',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}
                            >
                              {building.name}
                            </span>
                        </div>
                    ))}

                    {/*players*/}
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
                          borderRadius: '50%',
                          border: '2px solid white',
                          boxSizing: 'border-box',
                          transition: 'left 0.1s linear, top 0.1s linear'
                      }}
                    />
                  ))}

                </div>
              </div>
        </section>
    )
}

export default Campus