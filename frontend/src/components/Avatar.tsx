import { Avatar as DiceBearAvatar } from '@dicebear/core'
import avataaars from '@dicebear/styles/avataaars.json'
import '../templates/avatar.css'

import type {
    EyeVariant,
    MouthVariant,
    TopVariant,
    ClothesVariant,
    SkinColor,
    HairColor,
    ClothesColor
} from '../avatarOptions'

type DiceBearTopVariant = keyof typeof avataaars.components.top.variants
type DiceBearClothesVariant = keyof typeof avataaars.components.clothes.variants

interface AvatarProps {
    eyes: EyeVariant
    mouth: MouthVariant
    top: TopVariant
    clothes: ClothesVariant
    skinColor: SkinColor
    hairColor: HairColor
    clothesColor: ClothesColor
    size?: number
}

export default function Avatar ({
    eyes,
    mouth,
    top,
    clothes,
    skinColor,
    hairColor,
    clothesColor,
    size = 240
}: AvatarProps) {
    const avatar = new DiceBearAvatar(avataaars, {
        seed: 'campuspass',

        eyesVariant: [eyes],
        mouthVariant: [mouth],
        noseVariant: ['default'],
        topVariant: [top as DiceBearTopVariant],
        clothesVariant: [clothes as DiceBearClothesVariant],

        skinColor: [skinColor],
        hairColor: [hairColor],
        clothesColor: [clothesColor],

        accessoriesProbability: 0,
        clothesGraphicProbability: 0,
        facialHairProbability: 0
    })

    return (
        <div 
            className="avatar-image"
            style={{
                width: `${size}px`,
                height: `${size}px`
            }} 
        
        >
            <div
                dangerouslySetInnerHTML={{
                    __html: avatar.toString()
                }}
            />
        </div>
            
    )
}