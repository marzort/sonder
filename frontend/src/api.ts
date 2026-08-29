import type {
    EyeVariant,
    MouthVariant,
    TopVariant,
    ClothesVariant,
    SkinColor,
    HairColor,
    ClothesColor
} from './avatarOptions'

const API_URL = 'http://localhost:8000'

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