import { useState, useEffect } from 'react'
import { GIFT_CHOICES } from '../data/giftChoices'
import { getGifts } from '../api'
import type { Gift } from '../api'
import '../templates/garden.css'
import '../templates/popup.css'

interface GardenProps {
    token: string,
}

export default function Garden({
    token,
}: GardenProps) {
    const [message, setMessage] = useState('')
    const [gifts, setGifts] = useState<Gift[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [giftBeingViewed, setGiftBeingViewed] = useState<Gift | null>(null)

    useEffect(() => {
        async function loadGifts() {
            setMessage('')
            try {
                const data = await getGifts(token)
                setGifts(data)
            } catch (error) {
                setMessage(
                    error instanceof Error
                    ? error.message
                    : 'Could not get gift.'
                )
            }
    }

    loadGifts()
    }, [token])

    return (
        <section className="garden-screen">
            <div className="garden-header">
                <div>
                    <p className="garden-label">Garden</p>
                </div>
            </div>

            {message && (
                <p className="error-message">
                    {message}
                </p>
            )}

            <div className="garden-area">
                {gifts.length === 0 ? (
                    <p>Your garden is currently empty.</p>
                ) : (
                    gifts.map((gift) => (
                        <div
                            key={gift.id}
                            className="gift-plot"
                            onClick={() => {
                                setIsOpen(true)
                                setGiftBeingViewed(gift)
                            }}
                        >
                            <img
                                src={GIFT_CHOICES.find(
                                    (flower) => flower.id === gift.gift_choice
                                )?.image}
                                alt="Gift"
                                className="gift"
                            />
                        </div>
                    ))
                )}
            </div>

            {isOpen && giftBeingViewed && (
                <div className="modal-overlay" onClick={() => setIsOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="close-button"
                            onClick={() => {
                                setIsOpen(false)
                                setGiftBeingViewed(null)
                            }}>
                                &times;
                        </button>

                        <div className="gift-preview">
                            <img
                                src={GIFT_CHOICES.find(
                                    (flower) => flower.id === giftBeingViewed.gift_choice
                                )?.image}
                                alt="Gift being viewed"
                                className="gift-received"
                            />
                        </div>

                        <div className="gift-info">
                            <p>From: {giftBeingViewed.given_by.username}</p>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
    
}