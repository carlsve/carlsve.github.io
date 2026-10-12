import { getPlayer } from './entities/player.js'
import { getWorld } from './world.js'
import { keyDownHandler, keyUpHandler, downInput } from './input/keys.js'
import { mouseHandler, mouseMoveHandler, rightClickHandler } from './input/mouse.js'
import { getEnemy } from './entities/enemy.js'
import { initTurn } from './turn.js'
import { createItem } from './items.js'
import { randomPointInRect } from '../utils/rectangle.js'
import { eq2d } from '../utils/vec2d.js'

export const initGame = (canvas, rng, onDeath) => {
    const world = getWorld([80, 60])
    world.generate(rng)

    const game = {
        downInput,
        world,
        player: null,
        enemies: [],
        focusedEntity: null,
        canvas,
        rng: rng,
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
            feet: null,
            hands: null,
            crossbow: null,
            ring1: null,
            ring2: null,
        },
        heldItem: null,
        itemQuickBar: Array.from(Array(10), () => null),
        items: [],
        mousePos: [0,0],
    }

    game.inventory[0] = createItem('sword')
    game.inventory[1] = createItem('healthPotion')
    game.inventory[2] = createItem('crossbow')
    game.inventory[3] = createItem('arrows')
    game.inventory[4] = createItem('throwingStar')
    game.inventory[5] = createItem('sword2')
    game.inventory[6] = createItem('helmet')
    game.inventory[7] = createItem('healthPotion')
    game.inventory[8] = createItem('healthPotion')
    game.inventory[9] = createItem('healthPotion')

    const playerStartPos = randomPointInRect(rng, world.getRandomRoom(rng))
    game.player = getPlayer(game, playerStartPos)
    game.enemies = Array.from(Array(15), () => {
        let pos = randomPointInRect(rng, world.getRandomRoom(rng))
        while (eq2d(game.player.pos, pos)) {
            pos = randomPointInRect(rng, world.getRandomRoom(rng))
        }
        return getEnemy(game, pos)
    })

    game.items = [
        createItem('sword'),
        createItem('helmet'),
        createItem('healthPotion'),
        createItem('healthPotion'),
        createItem('healthPotion'),
        createItem('healthPotion'),
    ].map(item => {
        item.pos = randomPointInRect(rng, world.getRandomRoom(rng))
        return item
    })
    game.focusedEntity = game.player
    const turn = initTurn(game, onDeath, canvas)
    game.onKeyDown = keyDownHandler(turn, game)
    game.onKeyUp = keyUpHandler()
    game.onMouse = mouseHandler(turn, game)
    game.onMouseMove = mouseMoveHandler(game)
    game.onContextMenu = rightClickHandler(turn, game)

    turn({ action: 'wait' })

    window.game = game
    return game
}
