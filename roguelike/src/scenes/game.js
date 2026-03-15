import { bus } from '../engine/bus.js'
import { render } from '../game/render.js'
import { generateBSP } from '../game/generation/bsp.js'
import { getPlayer } from '../game/entities/player.js'
import { world } from '../game/world.js'
import { inputEvent, mouseEvent } from '../engine/input.js'

const game = {
    world,
    player: null,
    focusedEntity: null,
    canvas: null,
    tick: 0
}

export const initGame = async (canvas, rng) => {
    game.world.init([80, 60])
    generateBSP(game.world, rng)
    const spawnRoomIndex = rng.randInRange(0, game.world.rooms.length)
    const spawnRoom = game.world.rooms[spawnRoomIndex]
    const playerStartPos = [
        rng.randInRange(spawnRoom.x, spawnRoom.x + spawnRoom.w),
        rng.randInRange(spawnRoom.y, spawnRoom.y + spawnRoom.h),
    ]
    game.player = getPlayer(game.world, playerStartPos)
    game.focusedEntity = game.player
    game.canvas = canvas

    document.addEventListener('keydown', inputEvent)
    canvas.canvas.addEventListener('click', mouseEvent(game))

    render({ canvas, game })

    bus.on('world:tick', () => {
        game.tick += 1
        render({ canvas, game })
    })

}
