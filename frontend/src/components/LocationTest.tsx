import { useState } from "react"
import { useLocation } from "../hooks/useLocation"

export default function LocationTest() {
    const [enabled, setEnabled] = useState(false)

    const {
        location,
        error,
        permission,
    } = useLocation(enabled)

    return (
        <div>
            <h1>Location Test</h1>

            <button onClick={() => setEnabled((current) => !current)}>
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
        </div>
    )
}