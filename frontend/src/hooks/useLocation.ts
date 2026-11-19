import { useEffect, useState, useRef } from 'react'

export interface UserLocation {
    latitude: number
    longitude: number
    accuracy: number
}

export type LocationPermission = 
    | "granted"
    | "prompt"
    | "denied"
    | "unsupported"

const LOCATION_SEND_INTERVAL = 25_000

const GEO_OPTIONS: PositionOptions = {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 15_000
}

export function useLocation(
    enabled: boolean,
    onThrottledLocationChange?: (loc: UserLocation) => void
) {
    const isSupported =
        typeof navigator !== "undefined" &&
        "geolocation" in navigator
    
    const [location, setLocation] = useState<UserLocation | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [permission, setPermission] = useState<LocationPermission>(() => 
        isSupported ? "prompt" : "unsupported"
    )

    const lastSentTimeRef = useRef<number>(0)
    const callbackRef = useRef(onThrottledLocationChange)

    useEffect(() => {
        callbackRef.current = onThrottledLocationChange
    }, [onThrottledLocationChange])
    
    useEffect(() => {
        if (!enabled || !isSupported) {
            lastSentTimeRef.current = 0
            return
        }

        let isActive = true
        let watchId: number | null = null
        let pollIntervalId: number | null = null
        let permissionStatus: PermissionStatus | null = null

        function handlePosition(position: GeolocationPosition, forceSend = false) {
            if (!isActive) return

            const newLocation: UserLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
            }

            setLocation(newLocation)
            setPermission("granted")
            setError(null)

            const now = Date.now()
            if (forceSend || now - lastSentTimeRef.current >= LOCATION_SEND_INTERVAL) {
                lastSentTimeRef.current = now
                callbackRef.current?.(newLocation)
            }
        }

        function handleGeoError(err: GeolocationPositionError) {
            if (!isActive) return

            if (err.code === GeolocationPositionError.PERMISSION_DENIED) {
                setPermission("denied")
                setError("Location permission was denied.")
                stopTracking()
            } else {
                setError(err.message)
            }
        }

        function startTracking() {
            if (!isActive) return

            if (watchId === null) {
                watchId = navigator.geolocation.watchPosition(
                    (pos) => handlePosition(pos, false),
                    handleGeoError,
                    GEO_OPTIONS
                )
            }

            if (pollIntervalId === null) {
                pollIntervalId = window.setInterval(() => {
                    navigator.geolocation.getCurrentPosition(
                        (pos) => handlePosition(pos, false),
                        handleGeoError,
                        GEO_OPTIONS
                    )
                }, LOCATION_SEND_INTERVAL)
            }
        }

        function stopTracking() {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId)
                watchId = null
            }

            if (pollIntervalId !== null) {
                clearInterval(pollIntervalId)
                pollIntervalId = null
            }
        }

        async function setupLocation() {
            try {
                if ("permissions" in navigator) {
                    permissionStatus = await navigator.permissions.query({
                        name: "geolocation"
                    })

                    if (!isActive) return
                    setPermission(permissionStatus.state)

                    permissionStatus.onchange = () => {
                        if (!isActive || !permissionStatus) return
                        const state = permissionStatus.state
                        setPermission(state)

                        if (state === "granted") {
                            startTracking()
                        } else {
                            stopTracking()
                        }
                    }
                }
            } catch {
                // Safari older versions throw on permissions.query("geolocation")
            }

            if (!isActive) return

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    handlePosition(position, true)
                    startTracking()
                },
                handleGeoError,
                GEO_OPTIONS
            )
        }

        setupLocation()

        return () => {
            isActive = false
            stopTracking()
            if (permissionStatus) {
                permissionStatus.onchange = null
            }
        }
    }, [enabled, isSupported])

    return {
        location,
        error,
        permission,
    }
}