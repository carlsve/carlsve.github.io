import { camera } from "./camera.js"
import { eq2d, mul2d, sub2d } from "../utils/vec2d.js"

const dungeonTileOfIndex = ["floor", "wall", "stairs"]

export const render = ({ canvas, game }) => {
    canvas.ctx.fillStyle = '#000000'
    canvas.ctx.fillRect(0, 0, canvas.canvas.width, canvas.canvas.height)
    const entity = game.focusedEntity
    const {vx, vy, vw, vh} = camera(entity, game.world)

    for (let y = 0; y < vh; y += 1) {
        for (let x = 0; x < vw; x += 1) {
            if (game.world.exploredAt(x + vx, y + vy)) {
                if (game.visible.some((pos => eq2d(pos, [x + vx, y + vy])))) {
                    canvas.drawTile(dungeonTileOfIndex[game.world.at(x + vx, y + vy)],x,y)
                } else {
                    canvas.drawFogTile(dungeonTileOfIndex[game.world.at(x + vx, y + vy)],x,y)
                }
            }
        }
    }

    canvas.drawTile('player', ...sub2d(game.player.pos, [vx, vy]))

    for (const enemy of game.enemies) {
        if (game.visible.some((pos => eq2d(pos, enemy.pos)))) {
            const [enemyCameraX, enemyCameraY] = sub2d(enemy.pos, [vx, vy])
            canvas.drawTile('enemy', enemyCameraX, enemyCameraY)

            // Enemy HP Bar
            canvas.ctx.fillStyle = '#000000'
            canvas.ctx.fillRect(enemyCameraX * canvas.ts, enemyCameraY * canvas.ts - 6, canvas.ts, 3)
            canvas.ctx.fillStyle = '#FF0000'
            canvas.ctx.fillRect(enemyCameraX * canvas.ts, enemyCameraY * canvas.ts - 6, Math.max(Math.floor((enemy.stats.currentLife / enemy.stats.secondary.life()) * canvas.ts), 0), 3)

            // Enemy alert indicator
            if (enemy.seesPlayer) {
                canvas.drawRect('#FF0000', enemyCameraX, enemyCameraY)
            }
        }
    }
    document.querySelector('#dungeons-widget__tick').textContent = `${game.tick}`
    document.querySelector('#dungeons-widget__playerpos').textContent = `(${game.player.pos[0]},${game.player.pos[1]})`

    renderMinimap(canvas, game)
    renderHUD(canvas, game)
}

const renderMinimap = (canvas, game) => {
    canvas.ctx.globalAlpha = 0.6
    const ts = 2
    const [w, h] = mul2d(ts, game.world.dims)
    const ox = canvas.canvas.width - w - ts
    const oy = ts
    canvas.ctx.fillStyle = '#FFFFFF'
    canvas.ctx.fillRect(ox - 1, oy - 1, w + 2, h + 2)
    canvas.ctx.fillStyle = '#000000'
    canvas.ctx.fillRect(ox, oy, w, h)

    for (let y = 0; y < game.world.dims[1]; y += 1) {
        for (let x = 0; x < game.world.dims[0]; x += 1) {
            if (game.world.exploredAt(x, y)) {
                canvas.ctx.fillStyle = '#cccccc'
                canvas.ctx.fillRect(ox + x*ts, oy + y*ts, ts, ts)
            }
        }
    }
    canvas.ctx.fillStyle = '#FF0000'
    for (const enemy of game.enemies) {
        if (game.visible.some((pos => eq2d(pos, enemy.pos)))) {
            canvas.ctx.fillRect(ox + enemy.pos[0]*ts, oy + enemy.pos[1]*ts, ts, ts)
        }
    }
    
    canvas.ctx.fillStyle = '#0000FF'
    canvas.ctx.fillRect(ox + game.player.pos[0] * ts, oy + game.player.pos[1] * ts, ts, ts)
    
    canvas.ctx.globalAlpha = 1
}

const renderHUD = (canvas, game) => {
    canvas.ctx.globalAlpha = 0.6
    const hudDims = {x: 0, y: canvas.canvas.height - 80, w: canvas.canvas.width, h: 80}

    // Frame
    canvas.ctx.fillStyle = '#FFFFFF'
    canvas.ctx.fillRect(hudDims.x + 1, hudDims.y, hudDims.w - 2, hudDims.h - 1)
    canvas.ctx.fillStyle = '#000000'
    canvas.ctx.fillRect(hudDims.x + 2, hudDims.y + 1, hudDims.w - 4, hudDims.h - 3)

    // HP Bar
    canvas.ctx.fillStyle = '#FF0000'
    canvas.ctx.fillRect(hudDims.x + 10, hudDims.y + 10, 100, 20)
    canvas.ctx.fillStyle = '#000000'
    canvas.ctx.fillRect(hudDims.x + 10 + 1, hudDims.y + 10 + 1, 100 - 2, 20 - 2)
    canvas.ctx.fillStyle = '#FF0000'
    canvas.ctx.fillRect(hudDims.x + 10 + 3, hudDims.y + 10 + 3, Math.floor(100 * game.player.stats.currentLife/game.player.stats.secondary.life()) - 6, 20 - 6)
    canvas.drawText("#FF0000", game.player.stats.currentLife, hudDims.x + 10 + 100 + 20, hudDims.y + 10 + 10)

    // Mana Bar
    canvas.ctx.fillStyle = '#0000FF'
    canvas.ctx.fillRect(hudDims.x + 10, hudDims.y + 40, 100, 20)
    canvas.ctx.fillStyle = '#000000'
    canvas.ctx.fillRect(hudDims.x + 10 + 1, hudDims.y + 40 + 1, 100 - 2, 20 - 2)
    canvas.ctx.fillStyle = '#0000FF'
    canvas.ctx.fillRect(hudDims.x + 10 + 3, hudDims.y + 40 + 3, Math.floor(100 * game.player.stats.currentMana/game.player.stats.secondary.mana()) - 6, 20 - 6)
    canvas.drawText("#0000FF", game.player.stats.currentMana, hudDims.x + 10 + 100 + 20, hudDims.y + 40 + 10)

    // XP Bar
    canvas.ctx.fillStyle = '#FFFF00'
    canvas.ctx.fillRect(hudDims.x + 200, hudDims.y + 10, 100, 20)
    canvas.ctx.fillStyle = '#000000'
    canvas.ctx.fillRect(hudDims.x + 200 + 1, hudDims.y + 10 + 1, 100 - 2, 20 - 2)
    canvas.ctx.fillStyle = '#FFFF00'
    canvas.ctx.fillRect(hudDims.x + 200 + 3, hudDims.y + 10 + 3, Math.floor(100 * game.player.xp/(game.player.level*125)) - 6, 20 - 6)
    canvas.drawText("#FFFF00", `${game.player.xp} / ${game.player.level * 125}`, hudDims.x + 200 + 100 + 40, hudDims.y + 10 + 10)


    canvas.ctx.globalAlpha = 1
}