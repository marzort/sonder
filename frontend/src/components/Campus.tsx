import type { UserProfile } from '../api'
import { buildings } from '../data/buildings'



interface CampusProps {
    profile: UserProfile
    players: Record<number, { x: number, y: number }>
    onBack: () => void
}

function Campus({
    profile,
    players,
    onBack
}: CampusProps) {
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
            style={{
              position: 'relative',
              width: '900px',
              height: '600px',
              border: '2px solid #333',
              overflow: 'auto'
            }}
          >

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
        </section>
    )
}

export default Campus