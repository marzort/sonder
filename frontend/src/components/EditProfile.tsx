import { useState } from 'react'
import { updateAvatar, updateGift, updateGreeting } from '../api'
import type { UserProfile } from '../api'
import Avatar from './Avatar'
import AvatarCustomizer from './AvatarCustomizer'
import '../templates/editprofile.css'

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
    const [avatarPrev, setAvatarPrev] = useState(profile.avatar)

    const MAX_LENGTH_GREETING = 80
    const isGreetingLimitReached = greeting.length >= MAX_LENGTH_GREETING

    async function handleAvatarUpdate() {
        setMessage('')

        try {
            const updatedAvatar = await updateAvatar(
                token,
                avatarPrev
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
            <div className="avatar-preview">
                <Avatar 
                    eyes={avatarPrev.eyes}
                    mouth={avatarPrev.mouth}
                    top={avatarPrev.hair}
                    clothes={avatarPrev.clothes}
                    skinColor={avatarPrev.skin_color}
                    hairColor={avatarPrev.hair_color}
                    clothesColor={avatarPrev.clothes_color}
                />
            </div>

            <div className="edit-greeting">
                <div>
                    <label htmlFor="greeting">Greeting:</label>
                </div>

                <div>
                    <textarea 
                        id="greeting"
                        name="greeting"
                        rows={4}
                        maxLength={MAX_LENGTH_GREETING}
                        value={greeting}
                        onChange={(event) => setGreeting(event.target.value)}
                    />

                    <div className="character-counter-container">
                        {isGreetingLimitReached && (
                            <span className="limit-warning">Character limit reached!</span>
                        )}
                        <span className={`character-counter ${isGreetingLimitReached ? 'counter-danger' : ''}`}>
                            {greeting.length}/{MAX_LENGTH_GREETING}
                        </span>
                    </div>
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
                    {GIFT_CHOICES.map((flower) => {
                        const FlowerImg = flower.image

                        return (
                            <div key={flower.id} className="tooltip-container">
                                <FlowerImg 
                                    className={`gift ${
                                        gift === flower.id ? 'selected' : ''
                                    }`}
                                    onClick={() => setGift(flower.id)}
                                    role="button"
                                    aria-label={flower.name}
                                />
                                <span className="tooltip-bubble">{flower.name}</span>
                            </div>
                        )
                    })}
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
                    eyes={avatarPrev.eyes}
                    mouth={avatarPrev.mouth}
                    top={avatarPrev.hair}
                    clothes={avatarPrev.clothes}
                    skinColor={avatarPrev.skin_color}
                    hairColor={avatarPrev.hair_color}
                    clothesColor={avatarPrev.clothes_color}

                    onEyesChange={(value) =>
                        setAvatarPrev(prev => ({ ...prev, eyes: value }))
                    }

                    onMouthChange={(value) =>
                        setAvatarPrev(prev => ({ ...prev, mouth: value }))
                    }

                    onTopChange={(value) =>
                        setAvatarPrev(prev => ({ ...prev, hair: value }))
                    }

                    onClothesChange={(value) =>
                        setAvatarPrev(prev => ({ ...prev, clothes: value}))
                    }

                    onSkinColorChange={(value) =>
                        setAvatarPrev(prev => ({ ...prev, skin_color: value}))
                    }

                    onHairColorChange={(value) =>
                        setAvatarPrev(prev => ({ ...prev, hair_color: value}))
                    }

                    onClothesColorChange={(value) =>
                        setAvatarPrev(prev => ({ ...prev, clothes_color: value }))
                    }
                />

                <div className="save-section">
                <button
                    className="save-avatar-button"
                    onClick={handleAvatarUpdate}
                >
                    Save Avatar
                </button>
            </div>
            </div>

            
        </section>
    )
}

export default EditProfile