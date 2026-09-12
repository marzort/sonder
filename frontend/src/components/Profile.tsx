import { useState } from 'react'
import { updateAvatar, updateGreeting } from '../api'
import type { UserProfile } from '../api'
import Avatar from './Avatar'
import AvatarCustomizer from './AvatarCustomizer'

interface ProfileProps {
    profile: UserProfile
    token: string
    onProfileUpdate: (profile: UserProfile) => void
}

function Profile({
    profile,
    token,
    onProfileUpdate
}: ProfileProps) {
    const [message, setMessage] = useState('')
    const [greeting, setGreeting] = useState(profile.greeting)

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

    async function handleGreetingUpdate() {
        setMessage('')

        try {
            const updated = await updateGreeting(
                token,
                greeting
            )

            onProfileUpdate({
                ...profile,
                greeting: updated.greeting
            })

            setMessage('Greeting updated successfully!')
        } catch (error) {
            setMessage(
                error instanceof Error
                ? error.message
                : 'Could not update greeting'
            )
        }
    }

    return (
        <section className="profile-card">
            <div className="profile-header">
                <div>
                    <h2>Welcome, {profile.username}!</h2>
                </div>
            </div>

            <div className="profile-content">
                
                    <div className="avatar-preview">
                        
                        <Avatar 
                            eyes={profile.avatar.eyes}
                            mouth={profile.avatar.mouth}
                            top={profile.avatar.hair}
                            clothes={profile.avatar.clothes}
                            skinColor={profile.avatar.skin_color}
                            hairColor={profile.avatar.hair_color}
                            clothesColor={profile.avatar.clothes_color}
                        />
                    </div>

                    <div className="greeting-preview">
                        <div>
                            <label htmlFor="greeting">Greeting:</label>
                        </div>
                        
                        <div>
                            <textarea 
                            id="greeting" 
                            name="greeting"
                            rows={4} 
                            cols={50}
                            value={greeting}
                            onChange={(event) => setGreeting(event.target.value)}
                        />
                        </div>
                        
                        <div>
                            <button onClick={handleGreetingUpdate}>
                            Save Greeting
                        </button>
                        </div>
                        
                    </div>
                

                <div className="profile-controls">
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

                    <div className="save-section">
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
            </div>
        </section>
    )
}

export default Profile