import { generateBSP } from './generation/bsp.js'
import { getPlayer } from './entities/player.js'
import { world } from './world.js'
import { keyHandler, mouseHandler, mouseMoveHandler } from './input.js'
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
        attackMode: 'melee',
        inventory: Array.from(Array(60), () => null),
        gear: {
            helmet: null,
            body: null,
            weapon1: null,
            weapon2: null,
            legs: null,
            boots: null,
            hands: null,
            ring1: null,
            ring2: null,
        },
        heldItem: null,
        mousePos: null,
    }

    game.inventory[0] = { tile: 'sword', name: 'wooden sword', type: 'weapon', stats: { damage: [{type: 'crushing', amount: 2}], }}
    game.inventory[1] = { tile: 'helmet', name: 'wooden helmet', type: 'helmet', stats: { armour: [{type: 'crushing', amount: 2}], secondary: {armourAbsorption: 3}, }}
    game.inventory[2] = { tile: 'healthPotion', name: 'health potion', type: 'consumable', onConsume: () => { game.player.currentLife += 20 } }

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
    game.enemies = Array.from(Array(20), () => {
        const spawnRoomIndex = rng.randInRange(0, game.world.rooms.length)
        const spawnRoom = game.world.rooms[spawnRoomIndex]
        const enemyStartPos = [
            rng.randInRange(spawnRoom.x, spawnRoom.x + spawnRoom.w),
            rng.randInRange(spawnRoom.y, spawnRoom.y + spawnRoom.h),
        ]
        return getEnemy(game, enemyStartPos)
    })
    game.items = [
        { tile: 'healthPotion', name: 'health potion', type: 'consumable', onConsume: () => { game.player.currentLife += 20 } },
        { tile: 'healthPotion', name: 'health potion', type: 'consumable', onConsume: () => { game.player.currentLife += 20 } },
        { tile: 'healthPotion', name: 'health potion', type: 'consumable', onConsume: () => { game.player.currentLife += 20 } },
        { tile: 'healthPotion', name: 'health potion', type: 'consumable', onConsume: () => { game.player.currentLife += 20 } },
    ].map(item => {
        const spawnRoomIndex = rng.randInRange(0, game.world.rooms.length)
        const spawnRoom = game.world.rooms[spawnRoomIndex]
        item.pos = [
            rng.randInRange(spawnRoom.x, spawnRoom.x + spawnRoom.w),
            rng.randInRange(spawnRoom.y, spawnRoom.y + spawnRoom.h),
        ]
        return item
    })
    game.focusedEntity = game.player
    game.canvas = canvas
    const turn = initTurn(game, onDeath, canvas)
    game.onKey = keyHandler(turn)
    game.onMouse = mouseHandler(turn, game)
    game.onMouseMove = mouseMoveHandler(game)

    turn({ action: 'wait' })

    return game
}
