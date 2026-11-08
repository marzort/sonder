import { useState, useEffect } from 'react'
import { getMessages, markMessageViewed } from '../api'
import type { Message } from '../api'
import { sendMessage } from '../api'
import NewMessage from './NewMessage'
import '../templates/messages.css'

interface MessagesProps {
    token: string
    onMessageCountChange: (count: number) => void
}

export default function Messages({
    token,
    onMessageCountChange
}: MessagesProps) {
    const [errorMessage, setErrorMessage] = useState('')
    const [inbox, setInbox] = useState<Message[]>([])
    const [newMessageOpen, setNewMessageOpen] = useState(false)
    const [selectMessage, setSelectMessage] = useState<Message | null>(null)
    const [selectMessageOpen, setSelectMessageOpen] = useState(false)

    useEffect(() => {
        let isMounted = true

        async function fetchMessages() {
            setErrorMessage('')
            try {
                const data = await getMessages(token)
                if (isMounted) {
                    setInbox(data)
                }
            } catch (error) {
                if (isMounted) {
                    setErrorMessage(
                        error instanceof Error
                        ? error.message
                        : 'Could not get messages.'
                    )
                }
            }
        }

        fetchMessages()

        return () => {
            isMounted = false
        }
    }, [token])

    async function handleViewedMessage(msgId: number) {
        const msg = inbox.find(
            (msg) => msg.id === msgId
        )

        if (!msg || msg.viewed) return

        try {
            const result = await markMessageViewed(
                token,
                msgId
            )

            setInbox((current) =>
                current.map((msg) =>
                    msg.id === msgId
                        ? { ...msg, viewed: true}
                        : msg
                )
            )

            onMessageCountChange(result.unviewed_message_count)
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                ? error.message
                : 'Could not mark message as viewed.'
            )
        }
    }

    const handleSendMessage = async (
        recipientId: number,
        subject: string,
        body: string
    ) => {
        setErrorMessage('')

        try {
            await sendMessage(
                token,
                {
                    recipient_id: recipientId,
                    message_subject: subject,
                    message_body: body
                }
            )

            setNewMessageOpen(false)
            
            const updatedInbox = await getMessages(token)
            setInbox(updatedInbox)
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                ? error.message
                : 'Failed to send message.'
            )
        }
    }

    const formattedDate = selectMessage
    ? new Date(selectMessage.sent_at)
        .toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        })
    : null

    return (
        <section className="messages-screen">

            {errorMessage && (
                <p className="error-message">
                    {errorMessage}
                </p>
            )}

            <div className="messages-header">
                <h2>Inbox</h2>
            </div>

            <div className="messages-list">
                {inbox.length === 0 ? (
                    <p className="empty-inbox">Your inbox is empty.</p>
                ) : (
                    inbox.map((msg) => {
                        const formattedDateInList = new Date(msg.sent_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                        })

                        return (
                            <div 
                                key={msg.id} 
                                className="message-card"
                                onClick={() => {
                                    setSelectMessage(msg)
                                    setSelectMessageOpen(true)
                                    handleViewedMessage(msg.id)
                                }}
                            >
                                <div className="avatar-circle">
                                    {msg.other_user.username.charAt(0).toUpperCase()}
                                </div>

                                <div className="message-content">
                                    <div className="message-meta">
                                        <span className="username">{msg.other_user.username}</span>
                                        <span className="timestamp">{formattedDateInList}</span>
                                    </div>
                                    <p className="message-subject">{msg.message_subject}</p>
                                </div>

                                {msg.viewed == false && (
                                    <div className="unviewed-indicator">

                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>

            <button
                className="compose-message-button"
                onClick={() => {
                    setNewMessageOpen(true)
                }}
            >
                Send New Message
            </button>

            {newMessageOpen && (
                <NewMessage 
                    token={token}
                    onSend={handleSendMessage}
                    onClose={() => setNewMessageOpen(false)}
                />
            )}

            {selectMessage && selectMessageOpen && (
                <div
                    key={selectMessage.id}
                    className="view-message-window"
                >
                    <div className="view-message-window-content">
                        <button 
                            className="close-button" 
                            onClick={() => setSelectMessageOpen(false)}
                        >
                            &times;
                        </button>

                        <div className="sender">
                            <h4><strong>From: </strong>{selectMessage.other_user.username}</h4>
                        </div>

                        <div className="time-sent">
                            <h4><strong>Sent At: </strong>{formattedDate}</h4>
                        </div>

                        <div className="view-message-subject">
                            <h4>Subject: {selectMessage.message_subject}</h4>
                        </div>

                        <div className="full-message">
                            {selectMessage.message_body}
                        </div>
                    </div>
                </div>
            )}

        </section>
    )
}