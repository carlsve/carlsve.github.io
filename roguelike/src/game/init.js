import { generateBSP } from './generation/bsp.js'
import { getPlayer } from './entities/player.js'
import { world } from './world.js'
import { keyHandler, mouseHandler } from './input.js'
import { getEnemy } from './entities/enemy.js'
import { initTurn } from './turn.js'

export const initGame = (canvas, rng, onDeath) => {
    const game = {
        world,
        player: null,
        focusedEntity: null,
        canvas: null,
        rng: null,
        tick: 0,
        walkId: 0,
        visible: [],
        attackMode: 'melee'
    }

    game.rng = rng
    game.world.init([80, 60])
    generateBSP(game.world, rng)
    const spawnRoomIndex = rng.randInRange(0, game.world.rooms.length)
    const spawnRoom = game.world.rooms[spawnRoomIndex]
    const playerStartPos = [
        rng.randInRange(spawnRoom.x, spawnRoom.x + spawnRoom.w),
        rng.randInRange(spawnRoom.y, spawnRoom.y + spawnRoom.h),
    ]
    game.player = getPlayer(game, playerStartPos)
    game.enemies = Array.from(Array(15), () => {
        const spawnRoomIndex = rng.randInRange(0, game.world.rooms.length)
        const spawnRoom = game.world.rooms[spawnRoomIndex]
        const enemyStartPos = [
            rng.randInRange(spawnRoom.x, spawnRoom.x + spawnRoom.w),
            rng.randInRange(spawnRoom.y, spawnRoom.y + spawnRoom.h),
        ]
        return getEnemy(game, enemyStartPos)
    })
    game.focusedEntity = game.player
    game.canvas = canvas
    const turn = initTurn(game, onDeath, canvas)
    game.onKey = keyHandler(turn)
    game.onMouse = mouseHandler(turn, game)


    turn({ action: 'wait' })

    return game
}
