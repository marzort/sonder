import { useState, useEffect } from 'react'
import type { UserProfile, Meeting } from '../api'
import { getMeetings, markMeetingViewed } from '../api'

interface MeetingsProps {
    profile: UserProfile,
    token: string,
    onBack: () => void
    onMeetingCountChange: (count: number) => void
}

export default function Meetings({
    token,
    onBack,
    onMeetingCountChange
}: MeetingsProps) {
    const [message, setMessage] = useState('')
    const [meetings, setMeetings] = useState<Meeting[]>([])

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
                    <p className="profile-label">Meetings</p>
                    <h2>Let's see who you've met!</h2>
                </div>

                <button
                    className="primary-button"
                    onClick={onBack}
                >
                    Back to Explore
                </button>
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
                            onClick={() => handleViewedMeeting(meeting.id)}
                        >
                            <h3>{meeting.other_user.username}</h3>
                            <p>"{meeting.other_user.greeting}"</p>
                        </div>
                    ))
                )}
            </div>
        </section>
        
    )
}