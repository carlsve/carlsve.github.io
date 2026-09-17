import { logger } from '../utils/logger.js'
import { pTimeout } from '../utils/timers.js'
import { sub2d, add2d, eq2d } from '../utils/vec2d.js'
import { camera } from './camera.js'
import { aStar } from './algorithms/astar.js'

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
    const viewPortPos = game.canvas.getTilePosAt(...mousePos)
    const { vx, vy } = camera(game.focusedEntity, game.world)
    const worldPos = add2d([vx, vy], viewPortPos)

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