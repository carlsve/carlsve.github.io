import { getItemData } from './items.js'

export const SLOTS_FOR_TYPE = {
    weapon: ['weapon1', 'weapon2'],
    ring: ['ring1', 'ring2'],
    feet: ['feet'],
    helmet: ['helmet'],
    body: ['body'],
    legs: ['legs'],
    hands: ['hands'],
    crossbow: ['crossbow'],
}

export const firstEmptyGearSlot = (game, item) => SLOTS_FOR_TYPE[getItemData(item).type].find(slot => game.gear[slot] === null) || null

export const equip = (game, slot, item) => {
    game.gear[slot] = item
    for (const [stat, value] of Object.entries(getItemData(item).stats.primary || {})) {
        game.player.stats.statDump.primary[stat] += value
    }
    
    for (const [stat, value] of Object.entries(getItemData(item).stats.secondary || {})) {
        game.player.stats.statDump.secondary[stat] += value
    }

    for (const [damageType, value] of Object.entries(getItemData(item).stats.resistances || {})) {
        game.player.stats.resistances[damageType] += value
    }
}

export const unequip = (game, slot, item) => {
    game.gear[slot] = null
    for (const [stat, value] of Object.entries(getItemData(item).stats.primary || {})) {
        game.player.stats.statDump.primary[stat] -= value
    }
    for (const [stat, value] of Object.entries(getItemData(item).stats.secondary || {})) {
        game.player.stats.statDump.secondary[stat] -= value
    }
    for (const [damageType, value] of Object.entries(getItemData(item).stats.resistances || {})) {
        game.player.stats.resistances[damageType] -= value
    }
}