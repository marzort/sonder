import { useEffect, useState, useCallback } from "react"
import { useLocation } from "../hooks/useLocation"
import type { UserLocation } from "../hooks/useLocation"
import { sendLocation, setLocationSharing } from "../api"
import TrackingAnimation from "./TrackingAnimation"

import '../templates/explore.css'

interface ExploreProps {
    meetingCount: number
    token: string
    onMeetings: () => void
}

export default function Explore({
    meetingCount,
    token,
    onMeetings
} : ExploreProps) {
    const [enabled, setEnabled] = useState(false)
    const [updatingSharing, setUpdatingSharing] = useState(false)

    useEffect(() => {
        return () => {
            if (enabled && token) {
                setLocationSharing(false, token)
                .catch((error) => {
                    console.error(
                        "Failed to disable location sharing:",
                        error
                    )
                })
            }
        }
    }, [enabled, token])

    async function handleToggleLocation() {
        if (!token) {
            console.error("No authentication token found.")
            return
        }

        const newEnabled = !enabled

        try {
            setUpdatingSharing(true)

            await setLocationSharing(newEnabled, token)

            setEnabled(newEnabled)
        } catch (error) {
            console.error(
                "Failed to update location sharing:",
                error
            )
        } finally {
            setUpdatingSharing(false)
        }
    }

    const handleThrottledLocationChange = useCallback((throttledLocation: UserLocation) => {
        if (!token) return

        console.log("Sending throttled location update to backend:", throttledLocation)
        sendLocation(token, throttledLocation)
            .then((result) => {
                console.log("Location successfully saved:", result)
            })
            .catch((error) => {
                console.error("Failed to save location:", error)
            })
    }, [token])

    useLocation(enabled, handleThrottledLocationChange)

    return (
        <section className="explore-screen">

            {!enabled && (
                <div className="">
                    <p className="enable-location-blurb">Welcome to the Exploration page!</p>
                    <p></p>
                    <p className="enable-location-blurb">Here, you can encounter other users within your area.</p>
                    <p></p>
                    <p className="enable-location-blurb">
                        In order to do so, you will need to enable your location. 
                        While enabled, your location will be temporarily stored in periodic succession. 
                        You may disable this at any time.
                    </p>
                    <p></p>
                    <p className="enable-location-blurb">
                        Should you choose to enable your location, you will be discoverable by other users. 
                        Please remain on this page for as long as you wish to potentially meet others!
                    </p>
                </div>
            )}

            {enabled && (
                <div className="parent-wrapper">
                    <TrackingAnimation/>
                </div>
            )}

            <div className="buttons">
                <button
                className="enable-location-button"
                onClick={handleToggleLocation}
                disabled={updatingSharing}
            >
                {enabled ? "Disable Location" : "Enable Location"}
            </button>

            <div className="meetings-section">
                <button
                    className="meetings-button"
                    onClick={onMeetings}
                >
                    Meetings 
                </button>

                {meetingCount > 0 && (
                    <span className="meeting-count">
                        {meetingCount}
                    </span>
                )}
            </div>
            </div>
            
        </section>
    )
}