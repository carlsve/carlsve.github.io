/*
non-player performing interaction

click inventory slot, hand empty -> inv:i -> hand
click invenrory slot, holding    -> hand -> inv:i, swap (hand -> inv:i, inv:i -> hand)
click gear slot, hand empty      -> gear:s -> hand
click gear slot, holding         -> hand -> gear:s, swap (hand -> gear:s, gear:s -> hand)
click empty space, holding       -> hand -> inv:from:i (if from inventory, might have nulled due to swapping, then try find empty slot, if no empty slot then hand -> ground), hand -> ground (if from ground), hand -> gear:s (if from gear)
click own tile, holding          -> hand -> inv (can skip from:i since its a rare operation)
click adjacent ground item       -> ground:p -> hand
click ground tile, holding       -> hand -> ground:p
right click equippable           -> inv:i -> gear:s
righth click gear slot           -> gear:s -> inv

location:
    { kind: 'inventory', index: i }
    { kind: 'gear', slot: s }
    { kind: 'held' }
    { kind: 'ground', pos: [x,y] }
*/

import { eq2d } from "../utils/vec2d.js"
import { equip, SLOTS_FOR_TYPE, unequip } from "./gear.js"

export const kinds = {
    INVENTORY: (index) => ({ kind: 'inventory', index }),
    GEAR: (slot) => ({ kind: 'gear', slot }),
    HELD: { kind: 'held' },
    GROUND: (pos) => ({ kind: 'ground', pos }),
    ITEM_QUICK_BAR: (index) => ({ kind: 'itemQuickBar', index }),
}

export const take = (game, location) => {
    switch (location.kind) {
        case 'inventory': {
            if (location.index < 0 || location.index >= game.inventory.length) {
                throw new Error(`Bad inventory index: ${location.index}`)
            }
            const item = game.inventory[location.index]
            game.inventory[location.index] = null
            return item
        }
        case 'gear': {
            const item = game.gear[location.slot]
            if (item === null) {
                return null
            }
            unequip(game, location.slot, item)
            return item
        }
        case 'held': {
            if (game.heldItem === null) {
                return null
            }
            const item = game.heldItem.item
            game.heldItem = null
            return item
        }
        case 'ground': {
            const item = game.items.find(_item => eq2d(_item.pos, location.pos)) || null
            if (item !== null) {
                game.items = game.items.filter(_item => _item !== item)
            }
            return item
        }
        case 'itemQuickBar': {
            if (location.index < 0 || location.index >= game.itemQuickBar.length) {
                throw new Error(`Bad item quick bar index: ${location.index}`)
            }
            const item = game.itemQuickBar[location.index]
            game.itemQuickBar[location.index] = null
            return item
        }
        default: {
            throw new Error(`No location of type: ${JSON.stringify(location)}`)
        }
    }
}

export const put = (game, location, item) => {
    switch (location.kind) {
        case 'inventory': {
            if (location.index < 0 || location.index >= game.inventory.length) {
                throw new Error(`Bad inventory index: ${location.index}`)
            }
            const displaced = game.inventory[location.index]
            game.inventory[location.index] = item
            return displaced
        }
        case 'gear': {
            const displaced = game.gear[location.slot]
            if (displaced !== null) {
                unequip(game, location.slot, displaced)
            }
            equip(game, location.slot, item)
            return displaced
        }
        case 'held': {
            game.heldItem = { item }
            return null
        }
        case 'ground': {
            item.pos = location.pos
            game.items.push(item)

            if (game.player.selectedSlot === item) {
                game.player.selectedSlot = null
            }
            return null
        }
        case 'itemQuickBar': {
            if (location.index < 0 || location.index >= game.itemQuickBar.length) {
                throw new Error(`Bad itemQuickBar index: ${location.index}`)
            }
            const displaced = game.itemQuickBar[location.index]
            game.itemQuickBar[location.index] = item
            return displaced
        }
        default: {
            throw new Error(`No location of type: ${JSON.stringify(location)}`)
        }
    }
}

export const moveItem = (game, from, to) => {
    const item = take(game, from)
    if (item === null) {
        return false
    }

    if (!canPlace(game, to, item)) {
        put(game, from, item)
        return false
    }

    const displaced = put(game, to, item)
    if (displaced !== null) {
        put(game, from, displaced)
    }
    
    if (from.kind === 'inventory' && to.kind === 'held') {
        game.heldItem.from = from.index
    }
    return true
}

export const canPlace = (game, to, item) => {
    switch (to.kind) {
        case 'gear': {
            return SLOTS_FOR_TYPE[item.type].includes(to.slot)
        }
        case 'inventory': {
            return true
        }
        case 'itemQuickBar': {
            return true
        }
        case 'held': {
            return true
        }
        case 'ground': {
            return game.world.at(...to.pos) === 0
        }
    }
}