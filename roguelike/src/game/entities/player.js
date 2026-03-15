import { bus } from '../../engine/bus.js'
import { logger } from '../../utils/logger.js'
import { pTimeout } from '../../utils/timers.js'
import { add2d, clamp2d, eq2d } from '../../utils/vec2d.js'
import { aStar } from '../algorithms/astar.js'

export const getPlayer = (world, startPos) => {
    const player = { pos: startPos }

    const perform = async ({ action, ...payload }) => {
        switch (action) {
            case 'up':
            case 'down':
            case 'left':
            case 'right':
                const dpos = {
                    up: [0, -1],
                    down: [0, 1],
                    left: [-1, 0],
                    right: [1, 0],
                }[action]
        
                const nextPos = clamp2d(add2d(player.pos, dpos), [0,0], add2d([-1, -1], world.dims))
                const outOfBounds = eq2d(nextPos, player.pos)
                if (!outOfBounds && world.at(...nextPos) === 0) {
                    player.pos = nextPos
                    bus.emit('world:tick')
                }
                break;
            case 'mouse':
                logger.debug(world.at(...payload.pos))
                if (world.at(...payload.pos) !== 0) return;
                const playerPos = {x: player.pos[0], y: player.pos[1]}
                const goalPos = {x: payload.pos[0], y: payload.pos[1]}
        
                const path = (aStar(world.board, playerPos, goalPos) ?? [])
                    .map(({x,y}) => [x,y])
        
                logger.debug("A* result:")
                logger.debug(path)
        
                for (const pathPos of path) {
                    await pTimeout(100)
                    logger.debug(pathPos)
                    player.pos = pathPos
                    bus.emit('world:tick')
                }
                break;
            default:
                throw new Error(`action "${action}" not implemented`)
        }
    }

    
    bus.on('player:action', (action) => {
        logger.debug('player:action', action)
        perform(action)
    })

    return player
}
