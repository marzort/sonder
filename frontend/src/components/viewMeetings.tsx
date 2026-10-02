import { useState, useEffect } from 'react'
import type { UserProfile, Meeting } from '../api'
import { getMeetings, markMeetingViewed } from '../api'
import Avatar from './Avatar'

import '../templates/viewmeetings.css'

import { GIFT_CHOICES } from '../data/giftChoices'

interface ViewMeetingsProps {
    profile: UserProfile,
    token: string,
    onMeetingCountChange: (count: number) => void
}

export default function ViewMeetings({
    profile,
    token,
    onMeetingCountChange
}: ViewMeetingsProps) {
    const [message, setMessage] = useState('')
    const [meetings, setMeetings] = useState<Meeting[]>([])

    const [meetingBeingViewed, setMeetingBeingViewed] = useState<Meeting | null>(null)
    const [viewMeeting, setViewMeeting] = useState(false)

    const [pageNum, setPageNum] = useState(0)

    useEffect(() => {
        async function loadMeetings() {
            setMessage('')
            try {
                const data = await getMeetings(token)
                setMeetings(data)

                const firstUnviewed = data.find(
                    (meeting) => !meeting.viewed
                )

                if (firstUnviewed) {
                    setMeetingBeingViewed(firstUnviewed)
                }
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

    const unviewedMeetings = meetings.filter(
        (meeting) => !meeting.viewed
    )

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
                        ? { ...meeting, viewed: true}
                        : meeting
                )
            )

            onMeetingCountChange(result.unviewed_count)

            const nextMeeting = meetings.find(
                (meeting) =>
                    !meeting.viewed &&
                meeting.id !== meetingId
            )

            if (nextMeeting) {
                setMeetingBeingViewed(nextMeeting)
                setPageNum(1)
            } else {
                setMeetingBeingViewed(null)
                setPageNum(0)
                setViewMeeting(false)
            }
        } catch (error) {
            console.error(
                'Could not mark meeting as viewed:',
                error
            )
        }
    }

    function handleNext() {
        if (!meetingBeingViewed) {
            return
        }

        if (pageNum === 1) {
            setPageNum(2)
        } else {
            handleViewedMeeting(meetingBeingViewed.id)
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

            {!viewMeeting && (
                <div className="meeting-launcher">
                {unviewedMeetings.length === 0 ? (
                    meetings.length > 0 ? (
                        <p className="meeting-status">
                            You have no unviewed meetings.
                            <br />
                            Go check out your garden!
                        </p>
                    ) : (
                        <p className="meeting-status">You haven't met anyone yet.</p>
                    )
                ) : (
                    <button
                        className="view-meetings-button"
                        onClick={() => {
                            setMeetingBeingViewed(unviewedMeetings[0])
                            setViewMeeting(true)
                            setPageNum(1)
                        }}
                    >
                        View Meetings
                    </button>
                )}
            </div>
            )}
            

            {meetingBeingViewed && viewMeeting && (
                    <div
                        className="meeting-card"
                        key={meetingBeingViewed.id}
                    >
                        <div className="meeting-page">
                            <div className="other-avatar-preview">
                                <Avatar
                                        size="min(15vw, 20vh)"
                                        eyes={meetingBeingViewed.other_user.avatar.eyes}
                                        mouth={meetingBeingViewed.other_user.avatar.mouth}
                                        top={meetingBeingViewed.other_user.avatar.hair}
                                        clothes={meetingBeingViewed.other_user.avatar.clothes}
                                        skinColor={meetingBeingViewed.other_user.avatar.skin_color}
                                        hairColor={meetingBeingViewed.other_user.avatar.hair_color}
                                        clothesColor={meetingBeingViewed.other_user.avatar.clothes_color}
                                />
                            </div>

                            <div className="exchange">
                                {pageNum === 1 && (
                                    <div className="greetings">
                                        <div className="other-greeting">
                                            {meetingBeingViewed.other_user.greeting}
                                        </div>
                                        <div className="user-greeting">
                                            {profile.greeting}
                                        </div>
                                    </div>
                                )}

                                {pageNum === 2 && (
                                    <div className="gift-exchange">
                                        <div className="other-gift">
                                            <img 
                                                src={GIFT_CHOICES.find(
                                                    (flower) => flower.id === meetingBeingViewed.gift_received
                                                )?.image}
                                                alt="Gift received"
                                                className="gift-received"
                                            />
                                        </div>

                                        <div className="user-gift">
                                            <img 
                                                src={GIFT_CHOICES.find(
                                                    (flower) => flower.id === profile.gift_flower_id
                                                )?.image}
                                                alt="Gift given"
                                                className="gift-given"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="user-avatar-preview">
                                <Avatar
                                    size="min(15vw, 20vh)"
                                    eyes={profile.avatar.eyes}
                                    mouth={profile.avatar.mouth}
                                    top={profile.avatar.hair}
                                    clothes={profile.avatar.clothes}
                                    skinColor={profile.avatar.skin_color}
                                    hairColor={profile.avatar.hair_color}
                                    clothesColor={profile.avatar.clothes_color}
                                />
                            </div>
                        </div>
                        
                        <button 
                            className="next-button"
                            onClick={handleNext}
                        >
                            Next
                        </button>
                    </div>
                )
            }
        </section>
    )
}