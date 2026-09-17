import { useState } from 'react'
import { updateAvatar, updateGreeting, updateGift } from '../api'
import type { UserProfile } from '../api'
import Avatar from './Avatar'
import AvatarCustomizer from './AvatarCustomizer'
import '../templates/profile.css'

import cactus from '../assets/flowers/cactus.svg'
import daisy from '../assets/flowers/daisy.svg'
import tulip from '../assets/flowers/tulip.svg'

const gift_choices = [
    {
        id: 1,
        name: 'Cactus',
        image: cactus
    },
    {
        id: 2,
        name: 'Daisy',
        image: daisy
    },
    {
        id: 3,
        name: 'Tulip',
        image: tulip
    }
]

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
    const [gift, setGift] = useState(profile.gift_flower_id)

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

    async function handleGiftUpdate() {
        setMessage('')

        try {
            const updated = await updateGift(
                token,
                gift
            )

            onProfileUpdate({
                ...profile,
                gift_flower_id: updated.gift
            })

            setMessage('Gift updated successfully!')
        } catch (error) {
            setMessage(
                error instanceof Error
                ? error.message
                : 'Could not update gift'
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

                    <div className="gift-preview">
                        <div>
                            <img
                                src={gift_choices.find(
                                    (flower) => flower.id === profile.gift_flower_id
                                )?.image}
                                alt="Current gift"
                                className="gift"
                            />
                        </div>

                        <div className="gift-choices">
                            {gift_choices.map((flower) => (
                                <img
                                    key={flower.id}
                                    src={flower.image}
                                    alt={flower.name}
                                    className={`gift ${
                                        gift === flower.id ? 'selected' : ''
                                    }`}
                                    onClick={() => setGift(flower.id)}
                                />
                            ))}
                        </div>

                        <div>
                            <button onClick={handleGiftUpdate}>
                                Save Gift
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