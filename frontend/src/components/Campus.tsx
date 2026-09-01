import type { UserProfile } from '../api'

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
        </section>
    )
}

export default Campus