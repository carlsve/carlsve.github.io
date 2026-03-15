import { camera } from "./camera.js"
import { sub2d } from "../utils/vec2d.js"

const dungeonTileOfIndex = ["floor", "wall", "stairs"]

export const render = ({ canvas, game }) => {
    const entity = game.focusedEntity
    const {vx, vy, vw, vh} = camera(entity, game.world)

    for (let y = 0; y < vh; y += 1) {
        for (let x = 0; x < vw; x += 1) {
            canvas.drawTile(dungeonTileOfIndex[game.world.at(x + vx, y + vy)],x,y)
        }
    }

    canvas.drawTile('player', ...sub2d(game.player.pos, [vx, vy]))
    document.querySelector('#dungeons-widget__tick').textContent = `${game.tick}`
    document.querySelector('#dungeons-widget__playerpos').textContent = `(${game.player.pos[0]},${game.player.pos[1]})`
}