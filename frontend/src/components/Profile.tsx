import { useState } from 'react'
import { updateAvatar } from '../api'
import type { Avatar, UserProfile } from '../api'
import AvatarCustomizer from './AvatarCustomizer'

interface ProfileProps {
    profile: UserProfile
    token: string
    onLogout: () => void
    onProfileUpdate: (profile: UserProfile) => void
}

function Profile({
    profile,
    token,
    onLogout,
    onProfileUpdate
}: ProfileProps) {
    const [message, setMessage] = useState('')

    function updateAvatarField(
        field: keyof Avatar,
        value: number
    ) {
        onProfileUpdate({
            ...profile,
            avatar: {
                ...profile.avatar,
                [field]: value
            }
        })
    }

    async function handleAvatarUpdate() {
        setMessage('')

        try {
            const updatedAvatar = await updateAvatar(
                token,
                profile.avatar
            )

            onProfileUpdate({
                ...profile,
                avatar: updatedAvatar
            })

            setMessage('Avatar updated successfully!')
        } catch (error) {
            setMessage(
                error instanceof Error
                ? error.message
                : 'Could not update avatar'
            )
        }
    }

    return (
        <section className="profile-card">
            <div className="profile-header">
                <div>
                    <p className="profile-label">Campus member</p>
                    <h2>Welcome, {profile.username}!</h2>
                </div>

                <button 
                    className="logout-button"
                    onClick={onLogout}
                >
                    Log Out
                </button>
            </div>

            <div className="profile-content">
                <div className="avatar-preview">
                    <h3>Your Avatar</h3>
                    <AvatarCustomizer />
                </div>

                <div className="avatar-editor">
                    <h3>Customize Avatar</h3>

                    <div className="avatar-field">
                        <label htmlFor="hair">Hair</label>

                        <input 
                            id="hair"
                            type="number"
                            min="1"
                            value={profile.avatar.hair}
                            onChange={(event) =>
                                updateAvatarField(
                                    'hair',
                                    Number(event.target.value)
                                )
                            }
                        />
                    </div>

                    <div className="avatar-field">
                        <label htmlFor="shirt">Shirt</label>

                        <input 
                            id="shirt"
                            type="number"
                            min="1"
                            value={profile.avatar.shirt}
                            onChange={(event) =>
                                updateAvatarField(
                                    'shirt',
                                    Number(event.target.value)
                                )
                            }
                        />
                    </div>

                    <div className="avatar-field">
                        <label htmlFor="hat">Hat</label>

                        <input 
                            id="hat"
                            type="number"
                            min="1"
                            value={profile.avatar.hat}
                            onChange={(event) =>
                                updateAvatarField(
                                    'hat',
                                    Number(event.target.value)
                                )
                            }
                        />
                    </div>

                    <div className="avatar-field">
                        <label htmlFor="skin-color">Skin Color</label>

                        <input 
                            id="skin-color"
                            type="number"
                            min="1"
                            value={profile.avatar.skin_color}
                            onChange={(event) =>
                                updateAvatarField(
                                    'skin_color',
                                    Number(event.target.value)
                                )
                            }
                        />
                    </div>

                    <button 
                        className="primary-button save-button"
                        onClick={handleAvatarUpdate}
                    >
                        Save Avatar
                    </button>

                    {message && (
                        <p className="message">
                            {message}
                        </p>
                    )}
                </div>
            </div>
        </section>
    )
}

export default Profile