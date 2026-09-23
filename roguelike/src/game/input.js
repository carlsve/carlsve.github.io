import { logger } from '../utils/logger.js'
import { pTimeout } from '../utils/timers.js'
import { sub2d, add2d, eq2d, apply2d } from '../utils/vec2d.js'
import { camera } from './camera.js'
import { aStar } from './algorithms/astar.js'
import { render } from './render.js'
import { isPointInRect } from '../utils/rectangle.js'

const inputToAction = (key) => {
    switch (key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            return { action: 'step', stepTo: [0, -1] }
        case 'ArrowDown':
        case 's':
        case 'S':
            return { action: 'step', stepTo: [0, 1] }
        case 'ArrowLeft': 
        case 'a':
        case 'A':
            return { action: 'step', stepTo: [-1, 0] }
        case 'ArrowRight':
        case 'd':
        case 'D':
            return { action: 'step', stepTo: [1, 0] }
        case ' ':
            return { action: 'wait' }
        case 'r':
        case 'R':
            return { action: 'range' }
        default:
            return null
    }
}

export const keyHandler = (turn) => (e) => {
    const action = inputToAction(e.key)
    if (action) {
        turn(action)
    }
}

export const mouseHandler = (turn, game) => async (e) => {
    const rect = game.canvas.canvas.getBoundingClientRect()
    const mousePos = sub2d([e.clientX, e.clientY], [rect.left, rect.top])
    logger.debug(`click position: ${mousePos}`)

    if (isPointInRect(mousePos, game.canvas.inventoryDims)) {
        handleInventoryClick(game, mousePos)
        return
    }

    if (isPointInRect(mousePos, game.canvas.gameWindowDims)) {
        await handleGameWindowClick(turn, game, mousePos)
        return
    }

    if (isPointInRect(mousePos, game.canvas.gearDims)) {
        handleGearClick(game, mousePos)
        return
    }

    if (game.heldItem) {
        if (game.heldItem.from && game.inventory[game.heldItem.from] === null) {
            game.inventory[game.heldItem.from] = game.heldItem.item
            game.heldItem = null
            render({ canvas: game.canvas, game })
        } else if (game.inventory.some(item => item === null)) {
            game.inventory[game.inventory.findIndex(item => item === null)] = game.heldItem.item
            game.heldItem = null
            render({ canvas: game.canvas, game })
        } else {
            throw new Error("Item should be dropped on ground!")
        }
        return
    }
}

export const mouseMoveHandler = (game) => (e) => {
    if (game.heldItem !== null) {
        const rect = game.canvas.canvas.getBoundingClientRect()
        const mousePos = sub2d([e.clientX, e.clientY], [rect.left, rect.top])
        game.mousePos = mousePos
        render({ canvas: game.canvas, game })
    }
}

const handleInventoryClick = (game, mousePos) => {
    const inventoryDims = game.canvas.inventoryDims
    const clickedSlot = {
        x: Math.floor((mousePos[0] - inventoryDims.x) / game.canvas.ts),
        y: Math.floor((mousePos[1] - inventoryDims.y) / game.canvas.ts)
    }
    console.log(`clicking on inventory slot ${JSON.stringify(clickedSlot)}`)
    const inventoryIndex = clickedSlot.y * inventoryDims.cols + clickedSlot.x
    const item = game.inventory[inventoryIndex]
    console.log(item)

    if (game.heldItem === null) {
        if (item !== null) {
            game.heldItem = { from: inventoryIndex, item }
            game.inventory[inventoryIndex] = null
            game.mousePos = mousePos
            render({ canvas: game.canvas, game })
        }
    } else {
        if (item === null) {
            if (game.inventory[game.heldItem.from]) {
                game.inventory[game.heldItem.from] = null
            }
            game.inventory[inventoryIndex] = game.heldItem.item
            game.heldItem = null
            game.mousePos = mousePos
            render({ canvas: game.canvas, game })
        } else {
            const temp = item
            game.inventory[inventoryIndex] = game.heldItem.item
            game.heldItem = { item: temp, from: null }
            render({ canvas: game.canvas, game })
        }
    }
}

const handleGearClick = (game, mousePos) => {
    if (game.heldItem) {
        for (const [gearType, gearSlotPos] of Object.entries(game.canvas.gearSlots)) {
            if (isPointInRect(mousePos, { x: gearSlotPos[0], y: gearSlotPos[1], w: game.canvas.ts, h: game.canvas.ts })) {
                if (gearType.startsWith(game.heldItem.item.type)) {
                    game.gear[gearType] = game.heldItem.item
                    if (game.inventory[game.heldItem.from]) {
                        game.inventory[game.heldItem.from] = null
                    }
                    game.heldItem = null
                    render({ canvas: game.canvas, game })
                    return
                }
            }
        }
    } else {
        for (const [gearType, gearSlotPos] of Object.entries(game.canvas.gearSlots)) {
            if (isPointInRect(mousePos, { x: gearSlotPos[0], y: gearSlotPos[1], w: game.canvas.ts, h: game.canvas.ts })) {
                if (game.gear[gearType]) {
                    game.heldItem = { item: game.gear[gearType], from: null }
                    game.gear[gearType] = null
                    game.mousePos = mousePos
                    render({ canvas: game.canvas, game })
                    return
                }
            }
        }
    }
}

const handleGameWindowClick = async (turn, game, mousePos) => {
    const viewPortPos = game.canvas.getTilePosAt(...mousePos)
    const { vx, vy } = camera(game.focusedEntity, game.world)
    const worldPos = add2d([vx, vy], viewPortPos)

    // Pick Up Item
    for (const item of game.items) {
        if (eq2d(item.pos, worldPos)) {
            // complicated logic but basically, if it player is [x,y] then item must be [x +- 1, y] OR [x, y +- 1] OR [x, y] but not diagonal to player!
            const isAdjacentToPlayer = apply2d(Math.abs, sub2d(game.player.pos, item.pos)).reduce((s,n) => s + n,0) <= 1
            console.log(`item is adjacent: ${isAdjacentToPlayer}`)
            if (isAdjacentToPlayer) {
                game.mousePos = mousePos
                turn({ action: 'pickup', item, mousePos })
                return
            }
        }
    }

    // Drop Held Item
    if (game.heldItem) {
        // Drop on Player -> Pick up in Inventory
        if (eq2d(worldPos, game.player.pos)) {
            if (game.inventory.some(item => item === null)) {

                if (game.inventory[game.heldItem.from]) {
                    game.inventory[game.heldItem.from] = null
                }
                game.inventory[game.inventory.findIndex(item => item === null)] = game.heldItem.item
                game.heldItem = null
                render({ canvas: game.canvas, game })
            }
            return
        }
        const [dropX, dropY] = sub2d(worldPos, game.player.pos)
        const dropDir = Math.abs(dropX) > Math.abs(dropY) ? [Math.sign(dropX), 0] : [0, Math.sign(dropY)]
        const dropAt = add2d(game.player.pos, dropDir)
        console.log([dropX, dropY], dropAt, dropDir)
        console.log("drop item on ground!")
        turn({ action: 'drop', dropAt })

        return
    }

    logger.debug(`viewport click position: ${viewPortPos}`)
    logger.debug(`world click position: ${worldPos}`)

    if (game.attackMode === 'range') {
        turn({ action: 'attackRange', pos: worldPos })
        return
    }

    game.walkId += 1
    const myId = game.walkId

    logger.debug(game.world.at(...worldPos))
    if (game.world.at(...worldPos) !== 0) return;
    if (!game.world.exploredAt(...worldPos)) return;

    const playerPos = {x: game.player.pos[0], y: game.player.pos[1]}
    const goalPos = {x: worldPos[0], y: worldPos[1]}

    const path = (aStar(game.world.board, playerPos, goalPos) ?? [])
        .map(({x,y}) => [x,y]).slice(1)

    for (const pathPos of path) {
        if (game.player.stats.life <= 0) {
            return
        }
        await pTimeout(100)
        if (myId !== game.walkId) {
            return
        }
        logger.debug(pathPos)
        turn({ action: 'step', stepTo: sub2d(pathPos, game.player.pos) })
        for (const enemy of game.enemies) {
            if (game.visible.some(pos => eq2d(pos, enemy.pos))) return
        }
    }
}