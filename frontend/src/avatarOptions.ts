export const EYE_OPTIONS = [
    {value: 'default', label: 'Neutral'},
    {value: 'happy', label: 'Happy'},
    {value: 'side', label: 'Side'},
    {value: 'wink', label: 'Wink'},
    {value: 'closed', label: 'Closed'},
    {value: 'surprised', label: 'Surprised'}
] as const

export type EyeVariant = typeof EYE_OPTIONS[number]['value']

export const MOUTH_OPTIONS = [
    {value: 'default', label: 'Excited'},
    {value: 'twinkle', label: 'Happy'},
    {value: 'serious', label: 'Serious'},
    {value: 'grimace', label: 'Grimace'},
    {value: 'sad', label: 'Sad'},
    {value: 'disbelief', label: 'Disbelief'}
] as const

export type MouthVariant = typeof MOUTH_OPTIONS[number]['value']

export const TOP_OPTIONS = [
    {value: 'bigHair', label: 'Wavy'},
    {value: 'longButNotTooLong', label: 'Medium'},
    {value: 'shortFlat', label: 'Short'},
    {value: 'straight02', label: 'Straight'},
    {value: 'shaggyMullet', label: 'Mullet'},
    {value: 'dreads01', label: 'Fade'}
]

export type TopVariant = typeof TOP_OPTIONS[number]['value']

export const CLOTHES_OPTIONS = [
    {value: 'blazerAndShirt', label: 'Blazer'},
    {value: 'collarAndSweater', label: 'Sweater'},
    {value: 'hoodie', label: 'Hoodie'},
    {value: 'overall', label: 'Overalls'},
    {value: 'shirtCrewNeck', label: 'Crew Neck'},
    {value: 'shirtVNeck', label: 'V Neck'}
]

export type ClothesVariant = typeof CLOTHES_OPTIONS[number]['value']

export const SKIN_COLOR_OPTIONS = [
    '614335',
    'd08b5b',
    'edb98a',
    'fd9841',
    'ffdbb4'
]

export type SkinColor = typeof SKIN_COLOR_OPTIONS[number]

export const HAIR_COLOR_OPTIONS = [
    'a55728',
    '2c1b18',
    'd6b370',
    '4a312c',
    'c93305',
    'e8e1e1'
]

export type HairColor = typeof HAIR_COLOR_OPTIONS[number]

export const CLOTHES_COLOR_OPTIONS = [
    '65c9ff',
    'a7ffc4',
    'ffffb1',
    'ffafb9',
    'ffffff'
]

export type ClothesColor = typeof CLOTHES_COLOR_OPTIONS[number]