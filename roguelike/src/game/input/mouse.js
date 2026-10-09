import { logger } from '../../utils/logger.js'
import { sub2d, add2d, eq2d, apply2d } from '../../utils/vec2d.js'
import { camera } from '../camera.js'

import { renderOverlay } from '../render.js'
import { isPointInRect } from '../../utils/rectangle.js'
import { SLOTS_FOR_TYPE } from '../gear.js'
import { kinds } from '../inventory.js'
import { walkTo } from '../autowalk.js'
import { USABLE } from '../items.js'

export const mouseHandler = (turn, game) => async (e) => {
    const rect = game.canvas.boundingClientRect
    const mousePos = sub2d([e.clientX, e.clientY], [rect.left, rect.top])
    logger.debug(`click position: ${mousePos}`)

    if (isPointInRect(mousePos, game.canvas.inventoryDims)) {
        const inventoryIndex = game.canvas.inventoryIndexAt(mousePos)
        console.log(`clicking on inventory slot ${JSON.stringify(inventoryIndex)}`)

        if (game.heldItem === null) {
            if (game.downInput.shift) {
                const itemQuickBarIndex = game.findEmptyItemQuickBarIndex()
                if (game.inventory[inventoryIndex] !== null && ['consumable', 'throwable', 'shootable'].includes(game.inventory[inventoryIndex].type) && itemQuickBarIndex !== -1) {
                    turn({ action: 'moveItem', from: kinds.INVENTORY(inventoryIndex), to: kinds.ITEM_QUICK_BAR(itemQuickBarIndex)})
                } else {
                    turn({ action: 'moveItem', from: kinds.INVENTORY(inventoryIndex), to: kinds.GROUND(game.player.pos)})
                }
            } else {
                turn({ action: 'moveItem', from: kinds.INVENTORY(inventoryIndex), to: kinds.HELD})
            }
        } else {
            turn({ action: 'moveItem', from: kinds.HELD, to: kinds.INVENTORY(inventoryIndex) })
        }
        game.mousePos = mousePos
        return
    }

    if (isPointInRect(mousePos, game.canvas.gameWindowDims)) {
        const viewPortPos = game.canvas.getTilePosAt(...mousePos)
        const viewPort = camera(game, game.focusedEntity, game.canvas.viewPortDims)
        const worldPos = add2d([viewPort.x, viewPort.y], viewPortPos)

        // Pick Up Item
        if (game.heldItem === null) {
            for (const item of game.items) {
                if (eq2d(item.pos, worldPos)) {
                    const [dx, dy] = apply2d(Math.abs, sub2d(game.player.pos, item.pos))
                    const isAdjacentToPlayer = dx <= 1 && dy <= 1
        
                    console.log(`item is adjacent: ${isAdjacentToPlayer}`)
                    if (isAdjacentToPlayer) {
                        if (game.downInput.shift) {
                            if (USABLE.includes(item.type)) {
                                const itemQuickBarIndex = game.findEmptyItemQuickBarIndex()
                                if (itemQuickBarIndex !== -1) {
                                    turn({ action: 'moveItem', from: kinds.GROUND(item.pos), to: kinds.ITEM_QUICK_BAR(itemQuickBarIndex) })
                                }
                            }
                            const inventoryIndex = game.findEmptyInventoryIndex()
                            if (inventoryIndex !== -1) {
                                turn({ action: 'moveItem', from: kinds.GROUND(item.pos), to: kinds.INVENTORY(inventoryIndex) })
                            }
                            return
                        }
                        
                        game.mousePos = mousePos
                        turn({ action: 'moveItem', from: kinds.GROUND(item.pos), to: kinds.HELD })
                        return
                    }
                }
            }
        }

        // Drop Held Item
        if (game.heldItem) {
            // Drop on Player -> Pick up in Inventory (if has space)
            if (eq2d(worldPos, game.player.pos)) {
                const inventoryIndex = game.findEmptyInventoryIndex()
                if (inventoryIndex !== -1) {
                    turn({ action: 'moveItem', from: kinds.HELD, to: kinds.INVENTORY(inventoryIndex) })
                    return
                }
            }
            const [dropX, dropY] = sub2d(worldPos, game.player.pos)
            const dropDir = Math.abs(dropX) > Math.abs(dropY) ? [Math.sign(dropX), 0] : [0, Math.sign(dropY)]
            const dropAt = add2d(game.player.pos, dropDir)

            turn({ action: 'moveItem', from: kinds.HELD, to: kinds.GROUND(dropAt) })
            return
        }
        
        await walkTo(game, turn, worldPos)
        return
    }

    if (isPointInRect(mousePos, game.canvas.gearDims)) {
        if (game.heldItem) {
            for (const slot of (SLOTS_FOR_TYPE[game.heldItem.item.type] || [])) {
                const slotPos = game.canvas.gearSlots[slot]
                if (isPointInRect(mousePos, { x: slotPos[0], y: slotPos[1], w: game.canvas.ts, h: game.canvas.ts })) {
                    turn({ action: 'moveItem', from: kinds.HELD, to: kinds.GEAR(slot) })
                    return
                }
            }
        } else {
            const slot = game.canvas.gearSlotAt(mousePos)
            if (slot !== null && game.gear[slot] !== null) {
                turn({ action: 'moveItem', from: kinds.GEAR(slot), to: kinds.HELD })
                game.mousePos = mousePos
                return
            }
        }    
        return
    }

    if (isPointInRect(mousePos, game.canvas.itemQuickBarDims)) {
        const itemQuickBarIndex = game.canvas.itemQuickBarIndexAt(mousePos)
        console.log(`clicking on item quick bar slot ${itemQuickBarIndex + 1}`)

        if (game.heldItem === null) {
            if (game.downInput.shift) {
                const inventoryIndex = game.findEmptyInventoryIndex()
                if (inventoryIndex !== -1) {
                    turn({ action: 'moveItem', from: kinds.ITEM_QUICK_BAR(itemQuickBarIndex), to: kinds.INVENTORY(inventoryIndex)})
                } else {
                    turn({ action: 'moveItem', from: kinds.ITEM_QUICK_BAR(itemQuickBarIndex), to: kinds.GROUND(game.player.pos)})
                }
            } else {
                turn({ action: 'moveItem', from: kinds.ITEM_QUICK_BAR(itemQuickBarIndex), to: kinds.HELD})
            }
        } else {
            if (USABLE.includes(game.heldItem.item.type)) {
                turn({ action: 'moveItem', from: kinds.HELD, to: kinds.ITEM_QUICK_BAR(itemQuickBarIndex) })
            }
        }
        game.mousePos = mousePos
        return
    }

    if (game.heldItem) {
        if (game.heldItem.from !== null && game.inventory[game.heldItem.from] === null) {
            turn({action: 'moveItem', from: kinds.HELD, to: kinds.INVENTORY(game.heldItem.from) })
            return
        }
        const inventoryIndex = game.findEmptyInventoryIndex()
        if (inventoryIndex !== -1) {
            turn({action: 'moveItem', from: kinds.HELD, to: kinds.INVENTORY(inventoryIndex) })
            return
        }
        turn({action: 'moveItem', from: kinds.HELD, to: kinds.GROUND(game.player.pos) })
        return
    }
}

export const rightClickHandler = (turn, game) => (e) => {
    e.preventDefault()
    if (game.heldItem) {
        return
    }

    const rect = game.canvas.boundingClientRect
    const mousePos = sub2d([e.clientX, e.clientY], [rect.left, rect.top])
    logger.debug(`right click position: ${mousePos}`)

    if (isPointInRect(mousePos, game.canvas.inventoryDims)) {
        const inventoryIndex = game.canvas.inventoryIndexAt(mousePos)
        const item = game.inventory[inventoryIndex]
        if (item !== null) {
            if (USABLE.includes(item.type)) {
                turn({ action: 'useItemInventory', index: inventoryIndex })
            } else {
                for (const slot of (SLOTS_FOR_TYPE[item.type] || [])) {
                    if (game.gear[slot] === null) {
                        turn({ action: 'moveItem', from: kinds.INVENTORY(inventoryIndex), to: kinds.GEAR(slot) })
                        return
                    }
                }
            }
        }

        return
    }

    if (isPointInRect(mousePos, game.canvas.gameWindowDims)) {
        const viewPortPos = game.canvas.getTilePosAt(...mousePos)
        const viewPort = camera(game, game.focusedEntity, game.canvas.viewPortDims)
        const worldPos = add2d([viewPort.x, viewPort.y], viewPortPos)

        turn({ action: 'attackRange', pos: worldPos })
        return
    }
    
    if (isPointInRect(mousePos, game.canvas.gearDims)) {
        const slot = game.canvas.gearSlotAt(mousePos)
        const inventoryIndex = game.findEmptyInventoryIndex()
        if (slot !== null && game.gear[slot] !== null && inventoryIndex !== -1) {
            turn({ action: 'moveItem', from: kinds.GEAR(slot), to: kinds.INVENTORY(inventoryIndex) })
        }
        return
    }

    if (isPointInRect(mousePos, game.canvas.itemQuickBarDims)) {
        const itemQuickBarIndex = (game.canvas.itemQuickBarIndexAt(mousePos) + 10) % 10
        console.log(`right clicking on item quick bar slot ${itemQuickBarIndex + 1}`)
        turn({ action: 'useItemQuickBar', index: itemQuickBarIndex })
    }
}

let raf = 0
export const mouseMoveHandler = (game) => (e) => {
    if (!raf) {
        raf = requestAnimationFrame(() => {
            raf = 0
            const rect = game.canvas.boundingClientRect
            const mousePos = sub2d([e.clientX, e.clientY], [rect.left, rect.top])
            game.mousePos = mousePos
            renderOverlay(game, mousePos)
        })
    }
}