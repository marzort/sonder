import { useState, useEffect } from 'react'
import { getMessages } from '../api'
import type { Message } from '../api'
import { sendMessage } from '../api'
import NewMessage from './NewMessage'

interface MessagesProps {
    token: string
}

export default function Messages({
    token
}: MessagesProps) {
    const [errorMessage, setErrorMessage] = useState('')
    const [inbox, setInbox] = useState<Message[]>([])
    const [newMessageOpen, setNewMessageOpen] = useState(false)

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

    const handleSendMessage = async (
        recipientId: number,
        body: string
    ) => {
        setErrorMessage('')

        try {
            await sendMessage(
                token,
                {
                    recipient_id: recipientId,
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
                    <p>Your inbox is empty.</p>
                ) : (
                    inbox.map((msg) => (
                        <div key={msg.id} className="message-in-list">
                            <strong>{msg.other_user.username}:</strong> {msg.message_body}
                        </div>
                    ))
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
        </section>
    )
}