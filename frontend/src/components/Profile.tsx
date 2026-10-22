import { useState } from 'react'
import type { UserProfile } from '../api'
import Avatar from './Avatar'
import EditProfile from './EditProfile'
import '../templates/profile.css'

import { GIFT_CHOICES } from '../data/giftChoices'

interface ProfileProps {
    profile: UserProfile
    currentUserId: number
    token: string
    onProfileUpdate: (profile: UserProfile) => void
}

function Profile({
    profile,
    currentUserId,
    token,
    onProfileUpdate
}: ProfileProps) {
    const [message, setMessage] = useState('')
    const [isEditing, setIsEditing] = useState(false)

    const isOwner = currentUserId === profile.id

    const chosenGift = GIFT_CHOICES.find(flower => flower.id === profile.gift_flower_id)

    return (
        <section className="profile-card">
            <div className="profile-header">
                <div>
                    <h2>{profile.username}</h2>
                    {isOwner && (
                        <button
                            className="edit-button"
                            onClick={() => {
                                setIsEditing(!isEditing)
                                setMessage('')
                            }}
                        >
                            {isEditing ? 'View Profile' : 'Edit Profile'}
                        </button>
                    )}
                </div>
            </div>

            {message && <div className="profile-message">{message}</div>}

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
                {!isEditing && (
                    <div className="profile-view-only">
                        

                        <div className="greeting-display">
                            <h3>Greeting</h3>
                            <p className="greeting-text">{profile.greeting}</p>
                        </div>

                        <div className="gift-display">
                            <h3>Current Gift: {chosenGift ? chosenGift.name : 'No gift chosen.'}</h3>
                            {chosenGift ? (
                                <div className="gift-showcase">
                                    <img src={chosenGift.image} alt={chosenGift.name} className="gift static"/>
                                </div>
                            ) : (
                                <p>No gift to display.</p>
                            )}
                        </div>
                    </div>
                )}

                {isEditing && isOwner && (
                    <EditProfile 
                        profile={profile}
                        token={token}
                        onProfileUpdate={onProfileUpdate}
                        setMessage={setMessage}
                    />
                )}
            </div>
        </section>
    )
}

export default Profile