import { useState, useEffect } from 'react'
import { getFriendList, getFriendRequests, acceptFriendRequest, rejectFriendRequest } from '../api'
import type { Friend, FriendRequest } from '../api'

interface FriendsProps {
    token: string,
    friendCount: number
    requestCount: number
    onFriendCountChange: (frCount: number) => void
    onRequestCountChange: (reqCount: number) => void
    onFriendProfile: (friendId: number) => void
}

export default function Friends({
    token,
    onFriendCountChange,
    onRequestCountChange,
    onFriendProfile
}: FriendsProps) {
    const [message, setMessage] = useState('')
    const [friendsList, setFriendsList] = useState<Friend[]>([])
    const [friendRequestList, setFriendRequestList] = useState<FriendRequest[]>([])

    useEffect(() => {
        async function loadData() {
            setMessage('')

            try {
                const [friendsData, requestsData] = await Promise.all([
                    getFriendList(token),
                    getFriendRequests(token)
                ])
                setFriendsList(friendsData)
                setFriendRequestList(requestsData)
            } catch (error) {
                setMessage(
                    error instanceof Error
                    ? error.message
                    : 'Could not load friends list.'
                )
            }
        }

        loadData()
    }, [token])

    async function handleRequestDecision(
        decision: 'accept' | 'reject',
        requestId: number
    ) {
        setMessage('')

        try {
            if (decision == 'accept') {
                const result = await acceptFriendRequest(token, requestId)
                const acceptedReq = friendRequestList.find((req) => req.id === requestId)
                setFriendRequestList((prev) => prev.filter((req) => req.id !== requestId))

                if (acceptedReq) {
                    setFriendsList((prev) => [...prev, acceptedReq.sender])
                }

                onFriendCountChange(result.updated_friend_count)
                onRequestCountChange(result.updated_request_count)
                
            }
            else {
                const result = await rejectFriendRequest(token, requestId)
                setFriendRequestList((prev) => prev.filter((req) => req.id !== requestId))
                onRequestCountChange(result.updated_request_count)
            }
        } catch (error) {
            setMessage(
                error instanceof Error
                ? error.message
                : 'Could not handle friend request decision.'
            )
        }
    }

    return (
        <section className="friends-page">

            {message && (
                <p className="error-message">
                    {message}
                </p>
            )}

            <div className="friend-list">
                <h2>Friends</h2>

                {friendsList.length === 0 ? (
                    <p className="empty-friends-list">Your friends list is empty.</p>
                ) : (
                    friendsList.map((friend) => {

                        return(
                            <div
                                key={friend.id}
                                className="friend-card"
                                onClick={() => {onFriendProfile(friend.id)}}
                            >
                                <div className="avatar-circle">
                                    {friend.username.charAt(0).toUpperCase()}
                                </div>

                                <div className="friend-name">
                                    <span className="username">{friend.username}</span>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            <div className="request-list">
                <h2>Requests</h2>

                {friendRequestList.length === 0 ? (
                    <p>You have no friend requests.</p>
                ) : (
                    friendRequestList.map((req) => {
                        const sender = req.sender

                        return(
                            <div
                                key={req.id}
                                className="request-card"
                            >
                                <div 
                                    className="avatar-circle"
                                    onClick={() => {}}
                                >
                                    {sender.username.charAt(0).toUpperCase()}
                                </div>

                                <div className="friend-name">
                                    <span className="username">{sender.username}</span>
                                </div>

                                <div className="request-decision">
                                    <button 
                                        className="request-decision-button"
                                        onClick={() => {handleRequestDecision('accept', req.id)}}
                                    >
                                        Accept
                                    </button>

                                    <button
                                        className="request-decision-button"
                                        onClick={() => {handleRequestDecision('reject', req.id)}}
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </section>
    )
}