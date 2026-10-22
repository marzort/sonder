import { useState } from 'react'
import { updateAvatar, updateGift, updateGreeting } from '../api'
import type { UserProfile } from '../api'
import AvatarCustomizer from './AvatarCustomizer'
import '../templates/profile.css'

import { GIFT_CHOICES } from '../data/giftChoices'

interface EditProfileProps {
    profile: UserProfile
    token: string
    onProfileUpdate: (profile: UserProfile) => void
    setMessage: (msg: string) => void
}

function EditProfile({
    profile,
    token,
    onProfileUpdate,
    setMessage
}: EditProfileProps) {
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
                : 'Could not update avatar.'
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
        } catch(error) {
            setMessage(
                error instanceof Error
                ? error.message
                : 'Could not update greeting.'
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
        } catch(error) {
            setMessage(
                error instanceof Error
                ? error.message
                : 'Could not update gift.'
            )
        }
    }

    return (
        <section className="edit-profile-section">
            <div className="edit-greeting">
                <div>
                    <label htmlFor="greeting">Greeting:</label>
                </div>

                <div>
                    <textarea 
                        id="greeting"
                        name="greeting"
                        rows={4}
                        value={greeting}
                        onChange={(event) => setGreeting(event.target.value)}
                    />
                </div>

                <div>
                    <button
                        className="save-greeting-button"
                        onClick={handleGreetingUpdate}
                    >
                        Save Greeting
                    </button>
                </div>
            </div>

            <div className="edit-gift">
                <div>
                    <label htmlFor="gift">Gift:</label>
                </div>

                <div className="gift-choices">
                    {GIFT_CHOICES.map((flower) => (
                        <div className="tooltip-container">
                            <img 
                                key={flower.id}
                                src={flower.image}
                                alt={flower.name}
                                className={`gift ${
                                    gift === flower.id ? 'selected' : ''
                                }`}
                                onClick={() => setGift(flower.id)}
                            />
                            <span className="tooltip-bubble">{flower.name}</span>
                        </div>
                    ))}
                </div>

                <div>
                    <button
                        className="save-gift-button"
                        onClick={handleGiftUpdate}
                    >
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
            </div>

            <div className="save-section">
                <button
                    className="primary button save-button"
                    onClick={handleAvatarUpdate}
                >
                    Save Avatar
                </button>
            </div>
        </section>
    )
}

export default EditProfile