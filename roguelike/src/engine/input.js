import { logger } from '../utils/logger.js'
import { add2d, sub2d } from '../utils/vec2d.js'
import { bus } from './bus.js'
import { camera } from '../game/camera.js'

const inputToAction = (key) => {
    switch (key) {
        case 'ArrowUp':
        case 'w':
            return 'up'
        case 'ArrowDown':
        case 's':
            return 'down'
        case 'ArrowLeft': 
        case 'a':
            return 'left'
        case 'ArrowRight':
        case 'd':
            return 'right'
        default:
            return null
    }
}

export const inputEvent = (e) => {
    const action = inputToAction(e.key)
    if (action) {
        bus.emit('player:action', { action })
    }
}

export const mouseEvent = (game) => (e) => {
    const rect = game.canvas.canvas.getBoundingClientRect()
    const mousePos = sub2d([e.clientX, e.clientY], [rect.left, rect.top])
    const viewPortPos = game.canvas.getTilePosAt(...mousePos)
    const { vx, vy } = camera(game.focusedEntity, game.world)
    const worldPos = add2d([vx, vy], viewPortPos)

    logger.debug(`click position: ${mousePos}`)
    logger.debug(`viewport click position: ${viewPortPos}`)
    logger.debug(`world click position: ${worldPos}`)

    bus.emit('player:action', { action: 'mouse', pos: worldPos })
}