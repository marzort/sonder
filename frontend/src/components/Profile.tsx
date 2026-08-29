import { useState } from 'react'
import { updateAvatar } from '../api'
import type { UserProfile } from '../api'
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
                    <AvatarCustomizer 
                        eyes={profile.avatar.eyes}
                        mouth={profile.avatar.mouth}
                        top={profile.avatar.hair}
                        clothes={profile.avatar.clothes}
                        skinColor={profile.avatar.skin_color}
                        hairColor={profile.avatar.hair_color}
                        clothesColor={profile.avatar.clothes_color}

                        onEyesChange={(value) =>
                            onProfileUpdate({
                                ...profile,
                                avatar: {
                                    ...profile.avatar,
                                    eyes: value
                                }
                            })
                        }

                        onMouthChange={(value) =>
                            onProfileUpdate({
                                ...profile,
                                avatar: {
                                    ...profile.avatar,
                                    mouth: value
                                }
                            })
                        }

                        onTopChange={(value) =>
                            onProfileUpdate({
                                ...profile,
                                avatar: {
                                    ...profile.avatar,
                                    hair: value
                                }
                            })
                        }

                        onClothesChange={(value) =>
                            onProfileUpdate({
                                ...profile,
                                avatar: {
                                    ...profile.avatar,
                                    clothes: value
                                }
                            })
                        }

                        onSkinColorChange={(value) =>
                            onProfileUpdate({
                                ...profile,
                                avatar: {
                                    ...profile.avatar,
                                    skin_color: value
                                }
                            })
                        }

                        onHairColorChange={(value) =>
                            onProfileUpdate({
                                ...profile,
                                avatar: {
                                    ...profile.avatar,
                                    hair_color: value
                                }
                            })
                        }

                        onClothesColorChange={(value) =>
                            onProfileUpdate({
                                ...profile,
                                avatar: {
                                    ...profile.avatar,
                                    clothes_color: value
                                }
                            })
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
        </section>
    )
}

export default Profile