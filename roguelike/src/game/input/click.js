import { canPlace, firstEmpty, kinds, peek } from '../inventory.js'
import { firstEmptyGearSlot, SLOTS_FOR_TYPE } from '../gear.js'
import { canUse, getItemData } from '../items.js'
import { sub2d, eq2d, apply2d, add2d } from '../../utils/vec2d.js'

export const resolveClick = (game, { target, button, shift }) => {
    if ((shift || button === 'right') && peek(game, kinds.HELD) !== null) {
        return null
    }

    switch (target.kind) {
        case 'inventory': {
            const index = target.index
            if (button === 'left') {
                if (shift) {
                    const item = peek(game, kinds.INVENTORY(index))
                    const itemQuickBarIndex = firstEmpty(game, 'itemQuickBar')
                    if (item !== null && itemQuickBarIndex !== -1 && canPlace(game, kinds.ITEM_QUICK_BAR(itemQuickBarIndex), item)) {
                        return { command: { action: 'moveItem', from: kinds.INVENTORY(index), to: kinds.ITEM_QUICK_BAR(itemQuickBarIndex)} }
                    } else {
                        return { command: { action: 'moveItem', from: kinds.INVENTORY(index), to: kinds.GROUND(game.player.pos)} }
                    }
                } else {
                    if (peek(game, kinds.HELD) === null) {
                        return { command: { action: 'moveItem', from: kinds.INVENTORY(index), to: kinds.HELD} }
                    } else {
                        return { command: { action: 'moveItem', from: kinds.HELD, to: kinds.INVENTORY(index) } }
                    }
                }
            }
            if (button === 'right') {
                const item = peek(game, kinds.INVENTORY(index))
                if (item !== null) {
                    if (canUse(item)) {
                        return { command: { action: 'useItemInventory', index: index }}
                    } else {
                        const possibleSlots = SLOTS_FOR_TYPE[getItemData(item).type] || []
                        // Can only swap slots that are not multi (rings, weapons)
                        if (possibleSlots.length === 1) {
                            return { command: { action: 'moveItem', from: kinds.INVENTORY(index), to: kinds.GEAR(possibleSlots[0]) } }
                        } else if (possibleSlots.length > 1) {
                            const slot = firstEmptyGearSlot(game, item)
                            if (slot !== null) {
                                return { command: { action: 'moveItem', from: kinds.INVENTORY(index), to: kinds.GEAR(slot) } }
                            }
                        }
                    }
                }
            }
            break
        }
        case 'map': {
            const worldPos = target.worldPos
            if (button === 'left') {
                const item = peek(game, kinds.GROUND(worldPos))
                const [dx, dy] = apply2d(Math.abs, sub2d(game.player.pos, worldPos))
                const isAdjacentToPlayer = dx <= 1 && dy <= 1
                if (item !== null && isAdjacentToPlayer) {
                    if (shift) {
                        const isUsable = canUse(item)
                        const itemQuickBarIndex = firstEmpty(game, 'itemQuickBar')
                        if (isUsable && itemQuickBarIndex !== -1) {
                            return { command: { action: 'moveItem', from: kinds.GROUND(item.pos), to: kinds.ITEM_QUICK_BAR(itemQuickBarIndex) } }
                        }
                        const inventoryIndex = firstEmpty(game, 'inventory')
                        if (inventoryIndex !== -1) {
                            return { command: { action: 'moveItem', from: kinds.GROUND(item.pos), to: kinds.INVENTORY(inventoryIndex) } }
                        }
                    } else {
                        return { command: { action: 'moveItem', from: kinds.GROUND(item.pos), to: kinds.HELD } }
                    }
                }
                if (peek(game, kinds.HELD) === null) {
                    return { walk: { worldPos } }
                } else {
                    if (eq2d(worldPos, game.player.pos)) {
                        const itemQuickBarIndex = firstEmpty(game, 'itemQuickBar')
                        if (canPlace(game, kinds.ITEM_QUICK_BAR(itemQuickBarIndex), peek(game, kinds.HELD)) && itemQuickBarIndex !== -1) {
                            return { command: { action: 'moveItem', from: kinds.HELD, to: kinds.ITEM_QUICK_BAR(itemQuickBarIndex) } }
                        }
                        const inventoryIndex = firstEmpty(game, 'inventory')
                        if (inventoryIndex !== -1) {
                            return { command: { action: 'moveItem', from: kinds.HELD, to: kinds.INVENTORY(inventoryIndex) } }
                        }
                    }
                    const [dropX, dropY] = sub2d(worldPos, game.player.pos)
                    const dropDir = Math.abs(dropX) > Math.abs(dropY) ? [Math.sign(dropX), 0] : [0, Math.sign(dropY)]
                    const dropAt = add2d(game.player.pos, dropDir)

                    return { command: { action: 'moveItem', from: kinds.HELD, to: kinds.GROUND(dropAt) } }
                }
            }
            if (button === 'right') {
                return { command: { action: 'attackRange', pos: worldPos } }
            }
            break
        }
        case 'gear': {
            const slot = target.slot
            if (button === 'left') {
                if (peek(game, kinds.HELD) === null) {
                    return { command: { action: 'moveItem', from: kinds.GEAR(slot), to: kinds.HELD } }
                } else {
                    return { command: { action: 'moveItem', from: kinds.HELD, to: kinds.GEAR(slot) } }
                }
            }
            if (button === 'right') {
                const inventoryIndex = firstEmpty(game, 'inventory')
                if (inventoryIndex !== -1) {
                    return { command: { action: 'moveItem', from: kinds.GEAR(slot), to: kinds.INVENTORY(inventoryIndex) } }
                }
            }
            break
        }
        case 'itemQuickBar': {
            const index = target.index
            if (button === 'left') {
                if (shift) {
                    const inventoryIndex = firstEmpty(game, 'inventory')
                    if (inventoryIndex !== -1) {
                        return { command: { action: 'moveItem', from: kinds.ITEM_QUICK_BAR(index), to: kinds.INVENTORY(inventoryIndex)} }
                    } else {
                        return { command: { action: 'moveItem', from: kinds.ITEM_QUICK_BAR(index), to: kinds.GROUND(game.player.pos)} }
                    }
                } else {
                    if (peek(game, kinds.HELD) === null) {
                        return { command: { action: 'moveItem', from: kinds.ITEM_QUICK_BAR(index), to: kinds.HELD} }
                    } else {
                        return { command: { action: 'moveItem', from: kinds.HELD, to: kinds.ITEM_QUICK_BAR(index) } }
                    }
                }            
            }
            if (button === 'right') {
                const itemQuickBarIndex = (index + 10) % 10
                return { command: { action: 'useItemQuickBar', index: itemQuickBarIndex } }
            }
            break
        }
        case 'outside': {
            if (button === 'left') {
                const inventoryIndex = firstEmpty(game, 'inventory')
                if (inventoryIndex !== -1) {
                    return { command: {action: 'moveItem', from: kinds.HELD, to: kinds.INVENTORY(inventoryIndex) } }
                }
                return { command: {action: 'moveItem', from: kinds.HELD, to: kinds.GROUND(game.player.pos) } }
            }
            break
        }
    }

    return null
}