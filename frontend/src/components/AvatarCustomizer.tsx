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

interface AvatarCustomizerProps {
    eyes: EyeVariant
    mouth: MouthVariant
    top: TopVariant
    clothes: ClothesVariant
    skinColor: SkinColor
    hairColor: HairColor
    clothesColor: ClothesColor

    onEyesChange: (value: EyeVariant) => void
    onMouthChange: (value: MouthVariant) => void
    onTopChange: (value: TopVariant) => void
    onClothesChange: (value: ClothesVariant) => void
    onSkinColorChange: (value: SkinColor) => void
    onHairColorChange: (value: HairColor) => void
    onClothesColorChange: (value: ClothesColor) => void
}

export default function AvatarCustomizer({
    eyes,
    mouth,
    top,
    clothes,
    skinColor,
    hairColor,
    clothesColor,
    onEyesChange,
    onMouthChange,
    onTopChange,
    onClothesChange,
    onSkinColorChange,
    onHairColorChange,
    onClothesColorChange
} : AvatarCustomizerProps) {
    
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
                        onClick={() => onSkinColorChange(color)}
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
                        onClick={() => onEyesChange(eye.value)}
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
                        onClick={() => onMouthChange(mouthOption.value)}
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
                        onClick={() => onTopChange(topOption.value)}
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
                        onClick={() => onHairColorChange(color)}
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
                        onClick={() => onClothesChange(clothesOption.value)}
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
                        onClick={() => onClothesColorChange(color)}
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