import { aStar } from './algorithms/astar.js'
import { pTimeout } from '../utils/timers.js'
import { sub2d, eq2d } from '../utils/vec2d.js'
import { logger } from '../utils/logger.js'

export const walkTo = async (game, turn, worldPos) => {
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
        if (game.player.stats.currentLife <= 0) {
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