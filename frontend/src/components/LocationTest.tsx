import { useEffect, useState } from "react"
import { useLocation } from "../hooks/useLocation"
import { sendLocation, setLocationSharing } from "../api"


interface LocationTestProps {
    meetingCount: number
    token: string
    onMeetings: () => void
}

// this should eventually become the explore/meetings page
export default function LocationTest({
    meetingCount,
    token,
    onMeetings
} : LocationTestProps) {
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
            console.error("No authentication token found")
            return
        }

        const newEnabled = !enabled

        try {
            setUpdatingSharing(true)

            await setLocationSharing(newEnabled, token)

            setEnabled(newEnabled)
        } catch (error) {
            console.error(
                "Failed to update location sharing:", error
            )
        } finally {
            setUpdatingSharing(false)
        }
    }

    const {
        location,
        error,
        permission,
    } = useLocation(enabled)

    useEffect(() => {

        if (!enabled || !location) {
            console.log("Not sending location")
            return
        }

        sendLocation(token, location)
        .then((result) => {
            console.log("Location successfully saved:", result)
        })
        .catch((error) => {
            console.error("Failed to save location:", error)
        })
    }, [location, enabled, token])

    return (
        <div>
            <h1>Location Test</h1>

            <button
                onClick={handleToggleLocation}
                disabled={updatingSharing}
            >
                {enabled ? "Disable Location" : "Enable Location"}
            </button>

            <h2>Status</h2>

            <p>
                App enabled:{" "}
                <strong>{enabled? "yes" : "no"}</strong>
            </p>

            <p>
                Browser permission:{" "}
                <strong>{permission}</strong>
            </p>

            <h2>
                Location
            </h2>

            {location ? (
                <div>
                    <p>Latitude: {location.latitude}</p>
                    <p>Longitude: {location.longitude}</p>
                    <p>Accuracy: {location.accuracy}</p>
                </div>
            ) : (
                <p>No location yet.</p>
            )}

            <h2>Error</h2>

            {error ? (
                <p style={{ color: "red" }}>{error}</p>
            ) : (
                <p>No error.</p>
            )}

            <div>
                <button
                    className="primary-button"
                    onClick={onMeetings}
                >
                    Meetings

                    {meetingCount > 0 && (
                        <span className="meeting-count">
                            {meetingCount}
                        </span>
                    )}
                </button>
            </div>
        </div>
    )
}