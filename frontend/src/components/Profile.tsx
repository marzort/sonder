import { useState, useEffect } from 'react'
import { friendRequest, removeFriend } from '../api'
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

    type FriendButtonLabel = 'Add Friend' | 'Unfriend' | 'Pending'

    function mapStatusToButton(
        status?: UserProfile['friendship_status']
    ): FriendButtonLabel {
        if (status === 'accepted') return 'Unfriend'
        if (status === 'pending') return 'Pending'
        return 'Add Friend'
    }

    const [override, setOverride] = useState<{
        profileId: number
        status: FriendButtonLabel
    } | null>(null)

    const friendStatus: FriendButtonLabel = 
        override && override.profileId === profile.id
        ? override.status
        : mapStatusToButton(profile.friendship_status)

    const chosenGift = GIFT_CHOICES.find(flower => flower.id === profile.gift_flower_id)

    useEffect(() => {
        if (!message) return

        const timer = setTimeout(() => {
            setMessage('')
        }, 3000)

        return () => clearTimeout(timer)
    }, [message])

    async function handleFriendChange() {
        setMessage('')

        try {
            if (friendStatus === 'Add Friend') {
                await friendRequest(token, profile.id)
                setOverride({ profileId: profile.id, status: 'Pending' })
            } else if (friendStatus === 'Unfriend') {
                await removeFriend(token, profile.id)
                setOverride({ profileId: profile.id, status: 'Add Friend' })
            }
        } catch (error) {
            setMessage(
                error instanceof Error
                ? error.message
                : 'Could not change friend status.'
            )
        }
    }

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
                {isOwner ? (
                    <button
                        className="edit-button"
                        onClick={() => {
                            setIsEditing(!isEditing)
                            setMessage('')
                        }}
                    >
                        {isEditing ? 'View Profile' : 'Edit Profile'}
                    </button>
                ) : (
                    <button
                        className="friend-button"
                        onClick={() => {
                            handleFriendChange()
                        }}
                        disabled={friendStatus == 'Pending'}
                    >
                        {friendStatus}
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
                                {(() => {
                                    const GiftImg = chosenGift.image

                                    return <GiftImg className="gift-static" aria-label={chosenGift.name} />
                                })()}
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