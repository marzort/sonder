import React from 'react'
import bell_flower from '../assets/flowers/bellflower.svg?react'
import bleeding_heart from '../assets/flowers/bleedingheart.svg?react'
import calla_lily from '../assets/flowers/callalily.svg?react'
import chrysanthemum from '../assets/flowers/chrysanthemum.svg?react'
import cornflower from '../assets/flowers/cornflower.svg?react'
import daisy from '../assets/flowers/daisy.svg?react'
import rose from '../assets/flowers/rose.svg?react'
import tulip from '../assets/flowers/tulip.svg?react'

interface GiftChoice {
    id: number
    name: string
    image: React.ComponentType<React.ComponentProps<'svg'>>
}

export const GIFT_CHOICES: GiftChoice[] = [
    {
        id: 1,
        name: 'Bell Flower',
        image: bell_flower
    },
    {
        id: 2,
        name: 'Bleeding Heart Flower',
        image: bleeding_heart
    },
    {
        id: 3,
        name: 'Calla Lily',
        image: calla_lily
    },
    {
        id: 4,
        name: 'Chrysanthemum',
        image: chrysanthemum
    },
    {
        id: 5,
        name: 'Cornflower',
        image: cornflower
    },
    {
        id: 6,
        name: 'Daisy',
        image: daisy
    },
    {
        id: 7,
        name: 'Rose',
        image: rose
    },
    {
        id: 8,
        name: 'Tulip',
        image: tulip
    }
]