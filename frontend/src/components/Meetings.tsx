import { useState, useEffect } from 'react'
import type { UserProfile, Meeting } from '../api'
import { getMeetings, markMeetingViewed } from '../api'
import Avatar from './Avatar'
import '../templates/popup.css'
import '../templates/meetings.css'

import { GIFT_CHOICES } from '../data/giftChoices'

interface MeetingsProps {
    profile: UserProfile,
    token: string,
    onMeetingCountChange: (count: number) => void
}

export default function Meetings({
    token,
    onMeetingCountChange
}: MeetingsProps) {
    const [message, setMessage] = useState('')
    const [meetings, setMeetings] = useState<Meeting[]>([])

    const [isOpen, setIsOpen] = useState(false)
    const [meetingBeingViewed, setMeetingBeingViewed] = useState<Meeting | null>(null)

    useEffect(() => {
        async function loadMeetings() {
            setMessage('')
            try {
                const data = await getMeetings(token)
                setMeetings(data)
            } catch (error) {
                setMessage(
                    error instanceof Error
                    ? error.message
                    : 'Could not get meeting.'
                )
            }
        }

    loadMeetings()
    }, [token])

    async function handleViewedMeeting(meetingId: number) {
        const meeting = meetings.find(
            (meeting) => meeting.id === meetingId
        )

        if (!meeting || meeting.viewed) {
            return
        }

        try {
            const result = await markMeetingViewed(
                token,
                meetingId
            )

            setMeetings((current) =>
                current.map((meeting) =>
                    meeting.id === meetingId
                        ? { ...meeting, viewed: true }
                        : meeting
                )
            )

            console.log(
                'Remaining unviewed meetings:',
                result.unviewed_count
            )

            onMeetingCountChange(result.unviewed_count)
        } catch (error) {
            console.error(
                'Could not mark meeting as viewed:',
                error
            )
        }
    }
    

    return (
        <section className="meeting-screen">
            <div className="meeting-header">
                <div>
                    <p className="meetings-label">Meetings</p>
                    <h2>Let's see who you've met!</h2>
                </div>
            </div>
            
            {message && (
                <p className="error-message">
                    {message}
                </p>
            )}

            <div className="meetings-list">
                {meetings.length === 0 ? (
                    <p>You haven't met anyone yet.</p>
                ) : (
                    meetings.map((meeting) => (
                        <div
                            key={meeting.id}
                            className={`meeting-card ${
                                !meeting.viewed ? 'unviewed' : ''
                            }`}
                            onClick={() => {
                                setIsOpen(true)
                                setMeetingBeingViewed(meeting)
                                handleViewedMeeting(meeting.id)}
                            }
                        >
                            <h3>{meeting.other_user.username}</h3>
                            
                        </div>
                    ))
                )}
            </div>

            {isOpen && meetingBeingViewed && (
                <div className="modal-overlay" onClick={() => setIsOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button 
                            className="close-button" 
                            onClick={() => {
                                setIsOpen(false)
                                setMeetingBeingViewed(null)
                            }
                            }>
                            &times;
                        </button>
                        <div className="meeting-avatar-preview">
                            <Avatar 
                                eyes={meetingBeingViewed.other_user.avatar.eyes}
                                mouth={meetingBeingViewed.other_user.avatar.mouth}
                                top={meetingBeingViewed.other_user.avatar.hair}
                                clothes={meetingBeingViewed.other_user.avatar.clothes}
                                skinColor={meetingBeingViewed.other_user.avatar.skin_color}
                                hairColor={meetingBeingViewed.other_user.avatar.hair_color}
                                clothesColor={meetingBeingViewed.other_user.avatar.clothes_color}
                            />
                        </div>
                        <div className="meeting-gift-preview">
                            <img
                                src={GIFT_CHOICES.find(
                                    (flower) => flower.id === meetingBeingViewed.gift_received
                                )?.image}
                                alt="Gift received"
                                className="gift-received"
                            />
                        </div>
                        <p>"{meetingBeingViewed.other_user.greeting}"</p>
                    </div>
                </div>
            )}
        </section>
        
    )
}