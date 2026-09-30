import { useEffect, useState } from 'react'

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

//const LOCATION_SEND_INTERVAL = 10_000

export function useLocation(enabled: boolean) {
    const [location, setLocation] = useState<UserLocation | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [permission, setPermission] = useState<LocationPermission>("prompt")

    const isSupported = 
        typeof navigator !== "undefined" &&
        "geolocation" in navigator

    useEffect(() => {

        if (!enabled || !isSupported) {
            return
        }

        let isActive = true
        let watchId: number | null = null
        let permissionStatus: PermissionStatus | null = null

        function stopWatching() {
            if (watchId !== null) {
                console.log("Stopping watcher:", watchId)

                navigator.geolocation.clearWatch(watchId)
                watchId = null
            }
        }

        function startWatching() {
            if (!isActive) {
                console.log("Not starting watcher because effect is inactive")
                return
            }

            if (watchId !== null) {
                console.log(
                    "Watcher already exists:",
                    watchId
                )
                return
            }

            console.log("6. startWatching called")

            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    if (!isActive) {
                        return
                    }

                    console.log(
                        "7. WATCH SUCCESS:",
                        position.coords
                    )

                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    })

                    setError(null)
                },
                (error) => {
                    if (!isActive) {
                        return
                    }

                    console.error(
                        "7. WATCH ERROR:",
                        {
                            code: error.code,
                            message: error.message
                        }
                    )

                    setError(error.message)
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 10_000,
                    timeout: 10_000
                }
            )

            console.log("8. watchId:", watchId)
        }

        async function setupLocation() {
            console.log("1. setupLocation started")

            try {
                permissionStatus = await navigator.permissions.query({
                    name: "geolocation",
                })

                if (!isActive) {
                    return
                }

                console.log(
                    "2. permission state:",
                    permissionStatus.state
                )

                setPermission(permissionStatus.state)

                permissionStatus.onchange = () => {
                    if (!isActive) {
                        return
                    }

                    const state = permissionStatus!.state

                    console.log(
                        "3. permission changed:",
                        permissionStatus!.state
                    )

                    setPermission(state)

                    // using right now for testing, but may want different behavior
                    // should be catching if going from granted --> denied
                    if (state === "granted") {
                        startWatching()
                    } else {
                        stopWatching()
                    }
                }
            } catch (err) {
                if (!isActive) {
                    return
                }

                console.error(
                    "Permissions API failed:",
                    err
                )
                // if browser does not support querying geolocation permission
                // use geolocation api itself
            }

            if (!isActive) {
                return
            }

            console.log("4. calling getCurrentPosition")

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    if (!isActive) {
                        return
                    }

                    console.log(
                        "5. getCurrentPosition SUCCESS:",
                        position.coords
                    )

                    setPermission("granted")

                    startWatching()
                },
                (error) => {
                    if (!isActive) {
                        return
                    }

                    console.error(
                        "5. getCurrentPosition ERROR:",
                        {
                            code: error.code,
                            message: error.message
                        }
                    )

                    if (
                        error.code ===
                        GeolocationPositionError.PERMISSION_DENIED
                    ) {
                        setPermission("denied")
                        setError("Location permission was denied.")
                    } else {
                        setError(error.message)
                    }
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 10_000,
                    timeout: 10_000
                }
            )
        }

        setupLocation()

        return () => {
            console.log("Cleaning up location effect")

            isActive = false

            stopWatching()

            if (permissionStatus) {
                permissionStatus.onchange = null
            }
        }
    }, [enabled, isSupported])

    return {
        location,
        error,
        permission
    }
}