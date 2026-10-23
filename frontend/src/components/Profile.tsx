import { useState, useEffect } from 'react'
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

    useEffect(() => {
        if (!message) return

        const timer = setTimeout(() => {
            setMessage('')
        }, 3000)

        return () => clearTimeout(timer)
    }, [message])

    const isError = message.toLowerCase().includes('could not') || message.toLowerCase().includes('error')

    return (
        <section className="profile-card">

            {message && (
                <div className="toast-container">
                    <div className={`profile-message-popup ${isError ? 'error' : 'success'}`}>
                        {message}
                    </div>
                </div>
            )}

            <div className="profile-header">
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

            {!isEditing && (
                <div className="profile-view-only">
                    <div className="profile-view-avatar-preview">
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

                    <div className="greeting-gift-wrapper">
                        <div className="greeting-display">
                        <h3>Greeting:</h3>
                        <p className="greeting-text">{profile.greeting}</p>
                    </div>

                    <div className="gift-display">
                        <h3>Current Gift: {chosenGift ? chosenGift.name : 'No gift chosen.'}</h3>
                        {chosenGift ? (
                            <div className="gift-showcase">
                                <img src={chosenGift.image} alt={chosenGift.name} className="gift-static"/>
                            </div>
                        ) : (
                            <p>No gift to display.</p>
                        )}
                    </div>
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
            
        </section>
    )
}

export default Profile