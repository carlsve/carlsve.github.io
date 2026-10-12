import { getItemData } from "../items.js"

export const damageTypes = {
    crushing: 'crushing', 
    slashing: 'slashing', 
    blasting: 'blasting',
    acidic: 'acidic', 
    aethereal: 'aethereal', 
    asphyxiative: 'asphyxiative', 
    conflagratory: 'conflagratory', 
    existential: 'existential', 
    hyperborean: 'hyperborean', 
    necromantic: 'necromantic', 
    piercing: 'piercing', 
    putrefying: 'putrefying', 
    righteous: 'righteous', 
    toxic: 'toxic', 
    transmutative: 'transmutative', 
    voltaic: 'voltaic',
}

// Mundane damage types order matters for armour absorption calculation
export const MUNDANE = ['crushing', 'slashing', 'blasting']
export const EXOTIC = ['acidic', 'aethereal', 'asphyxiative', 'conflagratory', 'existential', 'hyperborean', 'necromantic', 'piercing', 'putrefying', 'righteous', 'toxic', 'transmutative', 'voltaic']

// Type can be melee, rangeThrow or rangeShoot
export const getDamages = (game, type) => {
    const damages = {}

    const addDamages = (item) => {
        for (const [damageType, value] of Object.entries(getItemData(item).stats.damages || {})) {
            damages[damageType] = (damages[damageType] || 0) + value
        }
    }

    for (const item of Object.values(game.gear)) {
        if (item === null) {
            continue
        }
        if (getItemData(item).type === 'weapon' || getItemData(item).type === 'shield') {
            if (type === 'melee') {
                addDamages(item)
            }
            continue
        }

        if (getItemData(item).type === 'crossbow') {
            if (type === 'rangeShoot') {
                addDamages(item)
            }
            continue
        }
        addDamages(item)
    }

    return damages
}