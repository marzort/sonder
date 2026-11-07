import { useState, useEffect } from 'react'
import { getMessages } from '../api'
import type { Message } from '../api'

interface MessagesProps {
    token: string
}

export default function Messages({
    token
}: MessagesProps) {
    const [message, setMessage] = useState('')
    const [inbox, setInbox] = useState<Message[]>([])

    useEffect(() => {
        async function loadInbox() {
            setMessage('')
            try {
                const data = await getMessages(token)
                setInbox(data)
            } catch (error) {
                setMessage(
                    error instanceof Error
                    ? error.message
                    : 'Could not get message.'
                )
            }
        }

        loadInbox()
    }, [token])

    return (
        <section className="messages-screen">

            {message && (
                <p className="error-message">
                    {message}
                </p>
            )}

            <div className="messages-header">
                <h2>Inbox</h2>
            </div>

            <div className="messages-list">
                {inbox.length === 0 ? (
                    <p>Your inbox is empty.</p>
                ) : (
                    inbox.map((msg) => {
                        
                        return (
                            <div key={msg.id} className="message-in-list">
                                {msg.other_user.username}: {msg.message_body}
                            </div>
                        )
                    })
                )}
            </div>
        </section>
    )
}