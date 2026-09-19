import { useState, useEffect } from 'react'
import { GIFT_CHOICES } from '../data/giftChoices'
import { getGifts } from '../api'
import type { Gift } from '../api'
import Avatar from './Avatar'
import styles from '../templates/garden.module.css'
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
        <section className={styles['garden-screen']}>
            <div className={styles['garden-header']}>
                <div>
                    <p className={styles['garden-label']}>Garden</p>
                </div>
            </div>

            {message && (
                <p className="error-message">
                    {message}
                </p>
            )}

            <div className={styles['garden-area']}>
                {gifts.length === 0 ? (
                    <p>Your garden is currently empty.</p>
                ) : (
                    gifts.map((gift) => (
                        <div
                            key={gift.id}
                            className={styles['gift-plot']}
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
                                className={styles.gift}
                            />
                        </div>
                    ))
                )}
            </div>

            {isOpen && giftBeingViewed && (
                <div className={styles['modal-overlay']} onClick={() => setIsOpen(false)}>
                    <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
                        <button
                            className="close-button"
                            onClick={() => {
                                setIsOpen(false)
                                setGiftBeingViewed(null)
                            }}>
                                &times;
                        </button>

                        <div className={styles['gift-preview']}>
                            <img
                                src={GIFT_CHOICES.find(
                                    (flower) => flower.id === giftBeingViewed.gift_choice
                                )?.image}
                                alt="Gift being viewed"
                                className={styles['gift-received']}
                            />

                            <div>
                                
                            </div>
                        </div>

                        <div className={styles['gift-info']}>
                            <p>From: {giftBeingViewed.given_by.username}</p>

                            <div className={styles['garden-avatar-preview']}>
                                <Avatar
                                    eyes={giftBeingViewed.given_by.avatar.eyes}
                                    mouth={giftBeingViewed.given_by.avatar.mouth}
                                    top={giftBeingViewed.given_by.avatar.hair}
                                    clothes={giftBeingViewed.given_by.avatar.clothes}
                                    skinColor={giftBeingViewed.given_by.avatar.skin_color}
                                    hairColor={giftBeingViewed.given_by.avatar.hair_color}
                                    clothesColor={giftBeingViewed.given_by.avatar.clothes_color}
                                />
                            </div>

                            <p>{giftBeingViewed.given_by.greeting}</p>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
    
}