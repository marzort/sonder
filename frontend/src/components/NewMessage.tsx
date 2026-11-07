import { useState, useEffect } from 'react'
import { getFriendList } from '../api'
import type { Friend } from '../api'

interface NewMessageProps {
    token: string
    onSend: (recipientId: number, body: string) => void
    onClose: () => void
}

export default function NewMessage({
    token,
    onSend,
    onClose
}: NewMessageProps) {
    const [errorMessage, setErrorMessage] = useState('')
    const [friendList, setFriendList] = useState<Friend[]>([])
    const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
    const [messageBody, setMessageBody] = useState('')

    useEffect(() => {
        async function loadFriendList() {
            setErrorMessage('')
            try {
                const data = await getFriendList(token)
                setFriendList(data)
            } catch (error) {
                setErrorMessage(
                    error instanceof Error
                    ? error.message
                    : 'Could not load friends list.'
                )
            }
        }

        loadFriendList()
    }, [token])

    const handleSend = () => {
        if (!selectedFriend) {
            setErrorMessage('Please select a recipient.')
            return
        }

        if (!messageBody.trim()) {
            setErrorMessage('Message cannot be empty.')
            return
        }

        onSend(selectedFriend.id, messageBody.trim())
    }

    return (
        <div className="new-message-window">
            <div className="new-message-window-content">
                <button className="close-button" onClick={onClose}>
                    &times;
                </button>

                {errorMessage && <p className="error-message">{errorMessage}</p>}

                <div className="recipient">
                    <h4>Select Recipient:</h4>
                        <div className="recipient-options">
                            {friendList.map((friend) => (
                                <button
                                    key={friend.id}
                                    onClick={() => setSelectedFriend(friend)}
                                    className={`friend-choice ${
                                        selectedFriend?.id === friend.id ? 'selected' : ''
                                    }`}
                                >
                                    {friend.username}
                                </button>
                            ))}
                        </div>

                        {selectedFriend && (
                            <p className="selected-recipient">
                                To: <strong>{selectedFriend.username}</strong>
                            </p>
                        )}

                        <div className="compose-message">
                            <label htmlFor="message">Message:</label>

                            
                                <textarea 
                                    id="message"
                                    rows={4}
                                    value={messageBody}
                                    onChange={(e) => setMessageBody(e.target.value)}
                                />
                            
                        </div>
                </div>

                <button
                    className="send-message-button"
                    onClick={handleSend}
                    disabled={!selectedFriend || !messageBody.trim()}
                >
                    Send
                </button>
            </div>
            

            
        </div>
    )
}