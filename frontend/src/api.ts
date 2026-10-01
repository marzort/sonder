import type {
    EyeVariant,
    MouthVariant,
    TopVariant,
    ClothesVariant,
    SkinColor,
    HairColor,
    ClothesColor
} from './avatarOptions'

const API_URL = `${import.meta.env.VITE_API_URL}` 

export type Avatar = {
    eyes: EyeVariant
    mouth: MouthVariant
    hair: TopVariant
    clothes: ClothesVariant
    skin_color: SkinColor
    hair_color: HairColor
    clothes_color: ClothesColor
}

export type UserProfile = {
    id: number
    username: string
    created_at: string
    avatar: Avatar
    greeting: string
    gift_flower_id: number
}

export type Meeting = {
    id: number
    started_at: string
    viewed: boolean
    other_user: {
        id: number
        username: string
        greeting: string
        avatar: Avatar
    }
    gift_received: number
}

export type Gift = {
    id: number
    given_by: {
        id: number
        username: string
        greeting: string
        avatar: Avatar
    }
    gift_choice: {
        id: number
        name: string
        fact: string
    }
}

export async function registerUser(
    username: string,
    password: string
) {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            password
        })
    })

    const data = await response.json()

    if(!response.ok) {
        if (Array.isArray(data.detail)) {
            const message = data.detail[0]?.msg ?? 'Validation failed'

            throw new Error(
                message.replace(/^Value error,\s*/, '')
            )
        }
        throw new Error(data.detail || 'Registration failed')
    }

    return data
}

export async function loginUser(
    username: string,
    password: string
) {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            password
        })
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.detail || 'Login failed')
    }

    return data
}

export async function getProfile(
    accessToken: string
): Promise<UserProfile> {
    const response = await fetch(`${API_URL}/profile`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.detail || 'Could not load profile')
    }

    return data
}

export async function updateAvatar(
    accessToken: string,
    avatar: Avatar
): Promise<Avatar> {
    const response = await fetch(`${API_URL}/avatar`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(avatar)
    })

    const data = await response.json()
    
    if (!response.ok) {
        throw new Error(data.detail || 'Could not update avatar')
    }

    return data
}

export async function updateGreeting(
    accessToken: string,
    greeting: string
) : Promise<{ greeting: string }> {
    const response = await fetch(`${API_URL}/greeting`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ greeting })
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.details || 'Could not update greeting')
    }

    return data
}

export async function updateGift(
    accessToken: string,
    gift: number
): Promise<{ gift: number }> {
    const response = await fetch(`${API_URL}/gifts/${gift}`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ gift })
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.details || 'Could not update gift')
    }

    return data
}

export interface LocationUpdate {
    latitude: number
    longitude: number
    accuracy: number | null
}

export async function sendLocation(
    accessToken: string,
    location: LocationUpdate
) {
    const response = await fetch(`${API_URL}/location`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify(location)
    })

    if (!response.ok) {
        const errorBody = await response.text()

        throw new Error(
            `Failed to update location: ${response.status} ${errorBody}`
        )
    }

    return response.json()
}

export async function setLocationSharing(
    enabled: boolean,
    token: string
) {
    const response = await fetch(`${API_URL}/location/sharing`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            enabled
        })
    })

    if (!response.ok) {
        const errorBody = await response.text()

        throw new Error(
            `Failed to update location sharing: ${response.status} ${errorBody}`
        )
    }

    return response.json()
}

export async function getMeetings(
    accessToken: string
): Promise<Meeting[]> {
    const response = await fetch(`${API_URL}/meetings`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(
            data.detail || 'Could not load meetings'
        )
    }

    return data
}

export async function markMeetingViewed(
    accessToken: string,
    meetingId: number
) {
    const response = await fetch(
        `${API_URL}/meetings/${meetingId}/viewed`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    )

    const data = await response.json()

    if (!response.ok) {
        throw new Error(
            data.detail || 'Could not mark meeting as viewed'
        )
    }

    return data
}

export async function getGifts(
    accessToken: string
): Promise<Gift[]> {
    const response = await fetch(`${API_URL}/gifts`, 
        {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }
    )

    const data = await response.json()

    if (!response.ok) {
        throw new Error(
            data.detail || 'Could not load gifts'
        )
    }

    return data
}