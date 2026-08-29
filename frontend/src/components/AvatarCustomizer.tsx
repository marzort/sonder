import { useState } from 'react'
import Avatar from './Avatar'

import {
    EYE_OPTIONS,
    MOUTH_OPTIONS,
    TOP_OPTIONS,
    CLOTHES_OPTIONS,
    SKIN_COLOR_OPTIONS,
    HAIR_COLOR_OPTIONS,
    CLOTHES_COLOR_OPTIONS
} from '../avatarOptions'

import type {
    EyeVariant,
    MouthVariant,
    TopVariant,
    ClothesVariant,
    SkinColor,
    HairColor,
    ClothesColor
} from '../avatarOptions'

export default function AvatarCustomizer() {
    const [eyes, setEyes] = useState<EyeVariant>('default')
    const [mouth, setMouth] = useState<MouthVariant>('default')
    const [top, setTop] = useState<TopVariant>('bigHair')
    const [clothes, setClothes] = useState<ClothesVariant>('hoodie')

    const [skinColor, setSkinColor] = useState<SkinColor>('614335')
    const [hairColor, setHairColor] = useState<HairColor>('a55728')
    const [clothesColor, setClothesColor] = useState<ClothesColor>('65c9ff')

    return (
        <div>
            <h2>Customize Your Avatar</h2>

            <Avatar 
                eyes={eyes}
                mouth={mouth}
                top={top}
                clothes={clothes}
                skinColor={skinColor}
                hairColor={hairColor}
                clothesColor={clothesColor}
            />
            
            <h3>Skin</h3>

            <div className="color-options">
                {SKIN_COLOR_OPTIONS.map((color) => (
                    <button
                        key={color}
                        onClick={() => setSkinColor(color)}
                        className={`color-button ${
                            skinColor === color ? 'selected' : ''
                        }`}
                        style={{ backgroundColor: `#${color}` }}
                        aria-label={`Skin color ${color}`}
                    />
                ))}
            </div>

            <h3>Eyes</h3>

            <div className="avatar-options">
                {EYE_OPTIONS.map((eye) => (
                    <button
                        key={eye.value}
                        onClick={() => setEyes(eye.value)}
                        className={eyes === eye.value ? 'selected' : ''}
                    >
                        {eye.label}
                    </button>
                ))}
            </div>

            <h3>Mouth</h3>

            <div className="avatar-options">
                {MOUTH_OPTIONS.map((mouthOption) => (
                    <button
                        key={mouthOption.value}
                        onClick={() => setMouth(mouthOption.value)}
                        className={mouth === mouthOption.value ? 'selected' : ''}
                    >
                        {mouthOption.label}
                    </button>
                ))}
            </div>

            <h3>Hair</h3>

            <div className="avatar-options">
                {TOP_OPTIONS.map((topOption) => (
                    <button
                        key={topOption.value}
                        onClick={() => setTop(topOption.value)}
                        className={top === topOption.value ? 'selected' : ''}
                    >
                        {topOption.label}
                    </button>
                ))}
            </div>

            <div className="color-options">
                {HAIR_COLOR_OPTIONS.map((color) => (
                    <button
                        key={color}
                        onClick={() => setHairColor(color)}
                        className={`color-button ${
                            hairColor === color ? 'selected' : ''
                        }`}
                        style={{ backgroundColor: `#${color}` }}
                        aria-label={`Hair color ${color}`}
                    />
                ))}
            </div>

            <h3>Clothes</h3>

            <div className="avatar-options">
                {CLOTHES_OPTIONS.map((clothesOption) => (
                    <button
                        key={clothesOption.value}
                        onClick={() => setClothes(clothesOption.value)}
                        className={clothes === clothesOption.value ? 'selected' : ''}
                    >
                        {clothesOption.label}
                    </button>
                ))}
            </div>

            <div className="color-options">
                {CLOTHES_COLOR_OPTIONS.map((color) => (
                    <button
                        key={color}
                        onClick={() => setClothesColor(color)}
                        className={`color-button ${
                            clothesColor === color ? 'selected' : ''
                        }`}
                        style={{ backgroundColor: `#${color}` }}
                        aria-label={`Clothes color ${color}`}
                    />
                ))}
            </div>

        </div>
    )
}