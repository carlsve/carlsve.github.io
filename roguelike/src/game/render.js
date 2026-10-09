import { camera } from "./camera.js"
import { eq2d, mul2d, sub2d, add2d } from "../utils/vec2d.js"
import { isPointInRect } from "../utils/rectangle.js"

const dungeonTileOfIndex = ["floor", "wall", "stairs"]

export const render = (game) => {
    const canvas = game.canvas
    canvas.ctx.fillStyle = '#000000'
    canvas.ctx.fillRect(0, 0, canvas.gameWindowDims.w, canvas.gameWindowDims.h)
    game.canvas.clearOverlay()
    const entity = game.focusedEntity
    const viewPort = camera(game, entity, canvas.viewPortDims)

    for (let y = 0; y < viewPort.h; y += 1) {
        for (let x = 0; x < viewPort.w; x += 1) {
            if (game.world.exploredAt(x + viewPort.x, y + viewPort.y)) {
                if (game.visible.some((pos => eq2d(pos, [x + viewPort.x, y + viewPort.y])))) {
                    canvas.drawTile(dungeonTileOfIndex[game.world.at(x + viewPort.x, y + viewPort.y)],x*canvas.ts,y*canvas.ts)
                } else {
                    canvas.drawFogTile(dungeonTileOfIndex[game.world.at(x + viewPort.x, y + viewPort.y)],x*canvas.ts,y*canvas.ts)
                }
            }
        }
    }

    for (const item of game.items) {
        if (game.visible.some((pos => eq2d(pos, item.pos)))) {
            canvas.drawTile(item.tile, ...mul2d(canvas.ts, sub2d(item.pos, [viewPort.x, viewPort.y])))
        }
    }

    canvas.drawTile('player', ...mul2d(canvas.ts, sub2d(game.player.pos, [viewPort.x, viewPort.y])))

    for (const enemy of game.enemies) {
        if (game.visible.some((pos => eq2d(pos, enemy.pos)))) {
            const [enemyCameraX, enemyCameraY] = sub2d(enemy.pos, [viewPort.x, viewPort.y])
            canvas.drawTile('enemy', enemyCameraX * canvas.ts, enemyCameraY * canvas.ts)

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
    renderBottomHUD(canvas, game)
    renderRightSideHUD(canvas, game)
    renderOverlay(game, game.mousePos)
}

const renderMinimap = (canvas, game) => {
    canvas.ctx.globalAlpha = 0.6
    const minimapWindowDims = canvas.minimapWindowDims
    const ts = canvas.minimapTs
    canvas.ctx.fillStyle = '#FFFFFF'
    canvas.ctx.fillRect(minimapWindowDims.x, minimapWindowDims.y, minimapWindowDims.w, minimapWindowDims.h)
    canvas.ctx.fillStyle = '#000000'
    canvas.ctx.fillRect(minimapWindowDims.x + 1, minimapWindowDims.y + 1, minimapWindowDims.w - 2, minimapWindowDims.h - 2)
    const minimapDims = canvas.minimapDims
    const minimapViewPort = camera(game, game.focusedEntity, minimapDims)
    canvas.ctx.fillStyle = '#cccccc'
    for (let y = 0; y < minimapViewPort.h; y += 1) {
        for (let x = 0; x < minimapViewPort.w; x += 1) {
            if (game.world.exploredAt(x + minimapViewPort.x, y + minimapViewPort.y)) {
                canvas.ctx.fillRect(minimapWindowDims.x + x*ts,minimapWindowDims.y + y*ts, ts, ts)
            }
        }
    }
    
    canvas.ctx.fillStyle = '#00FF00'
    for (const item of game.items) {
        if (game.visible.some(pos => eq2d(pos, item.pos))) {
            const itemMinimapPos = mul2d(ts, sub2d(item.pos, [minimapViewPort.x, minimapViewPort.y]))
            canvas.ctx.fillRect(...add2d([minimapWindowDims.x, minimapWindowDims.y], itemMinimapPos), ts, ts)
        }
    }

    canvas.ctx.fillStyle = '#FF0000'
    for (const enemy of game.enemies) {
        if (game.visible.some((pos => eq2d(pos, enemy.pos)))) {
            const enemyMinimapPos = mul2d(ts, sub2d(enemy.pos, [minimapViewPort.x, minimapViewPort.y]))
            canvas.ctx.fillRect(...add2d([minimapWindowDims.x, minimapWindowDims.y], enemyMinimapPos), ts, ts)
        }
    }
    
    canvas.ctx.fillStyle = '#0000FF'
    const playerMinimapPos = mul2d(ts, sub2d(game.player.pos, [minimapViewPort.x, minimapViewPort.y]))
    canvas.ctx.fillRect(...add2d([minimapWindowDims.x, minimapWindowDims.y], playerMinimapPos), ts, ts)

    canvas.ctx.globalAlpha = 1.0

}

const renderBottomHUD = (canvas, game) => {
    const hudDims = canvas.bottomHUDDims
    const margin = 5

    // Bottom Frame
    canvas.ctx.fillStyle = '#333333'
    canvas.ctx.fillRect(hudDims.x, hudDims.y, hudDims.w, hudDims.h)

    // Item Quick Bar
    const itemQuickBarDims = canvas.itemQuickBarDims
    for (let y = 0; y < itemQuickBarDims.rows; y += 1) {
        for (let x = 0; x < itemQuickBarDims.cols; x += 1) {
            if (game.itemQuickBar[y * itemQuickBarDims.cols + x]) {
                canvas.drawTile(game.itemQuickBar[y * itemQuickBarDims.cols + x].tile, itemQuickBarDims.x + x*canvas.ts, itemQuickBarDims.y + y*canvas.ts)
            } else {
                canvas.drawTile('emptySlot', itemQuickBarDims.x + x*canvas.ts, itemQuickBarDims.y + y*canvas.ts)
            }
        }
    }

    // Selected Slot
    canvas.drawTile(game.player.selectedSlot !== null ? game.player.selectedSlot.tile : 'emptySlot', canvas.selectedSlot.x, canvas.selectedSlot.y)

    // HP Bar
    const hpBarDims = { x: hudDims.x + 10, y: hudDims.y + 70, w: 100, h: 20 }
    renderBar(canvas, hpBarDims, game.player.stats.secondary.life(), game.player.stats.currentLife, '#FF0000')
    canvas.drawText("#FF0000", game.player.stats.currentLife, hpBarDims.x + hpBarDims.w + margin, hpBarDims.y + Math.floor(hpBarDims.h/2), { align: 'left' })

    // Mana Bar
    const manaBarDims = { x: hudDims.x + 160, y: hudDims.y + 70, w: 100, h: 20 }
    renderBar(canvas, manaBarDims, game.player.stats.secondary.mana(), game.player.stats.currentMana, '#5555FF')
    canvas.drawText("#5555FF", game.player.stats.currentMana, manaBarDims.x + manaBarDims.w + margin, manaBarDims.y + Math.floor(manaBarDims.h/2), { align: 'left' })


    // XP Bar
    const xpBarDims = { x: hudDims.x + 320, y: hudDims.y + 70, w: 100, h: 20 }
    renderBar(canvas, xpBarDims, game.player.level*125, game.player.xp, '#FFFF00')
    canvas.drawText("#FFFF00", `${game.player.xp}/${game.player.level * 125}`, xpBarDims.x + xpBarDims.w + margin, xpBarDims.y + Math.floor(xpBarDims.h/2), { align: 'left' })
    canvas.drawText("#FFFF00", `${game.player.level}`, xpBarDims.x - margin, xpBarDims.y + Math.floor(xpBarDims.h/2), { align: 'right' })
}

const renderBar = (canvas, {x,y,w,h}, max, current, color) => {
    canvas.ctx.fillStyle = color
    canvas.ctx.fillRect(x, y, w, h)
    canvas.ctx.fillStyle = '#000000'
    canvas.ctx.fillRect(x + 1, y + 1, w - 2, h - 2)
    canvas.ctx.fillStyle = color
    canvas.ctx.fillRect(x + 3, y + 3, Math.max(0, Math.floor(w * current/max) - 6), h - 6)
}

const renderRightSideHUD = (canvas, game) => {
    const hudDims = canvas.rightHUDDims

    // Bottom Frame
    canvas.ctx.fillStyle = '#666666'
    canvas.ctx.fillRect(hudDims.x, hudDims.y, hudDims.w, hudDims.h)

    // Primary Stats Section
    const primaryStats = Object.entries(game.player.stats.primary)
    canvas.drawText("#FFFFFF",`Primary Stats`, hudDims.x + 10, hudDims.y + 10, {align: 'left', style: '12px'})
    for (let i = 0; i < primaryStats.length; i += 1) {
        const [stat, value] = primaryStats[i]
        canvas.drawText("#FFFFFF",`${stat}: ${value}`, hudDims.x + 10, hudDims.y + 24 + i*14, {align: 'left', style: '12px'})
    }

    // Secondary Stats Section
    canvas.drawText("#FFFFFF",`Secondary Stats`, hudDims.x + 140, hudDims.y + 10, {align: 'left', style: '12px'})
    const secondaryStats = Object.entries(game.player.stats.secondary)
    for (let i = 0; i < secondaryStats.length; i += 1) {
        const [stat, value] = secondaryStats[i]
        canvas.drawText("#FFFFFF",`${stat}: ${value()}`, hudDims.x + 140, hudDims.y + 24 + i*14, {align: 'left', style: '12px'})
    }

    // Damage Types Section
    canvas.drawText("#FFFFFF",`Damage Types`, hudDims.x + 10, hudDims.y + 130, {align: 'left', style: '12px'})
    const damages = Object.entries(game.player.stats.damages || {})
    for (let i = 0; i < damages.length; i += 1) {
        const [stat, value] = damages[i]
        if (value > 0) {
            canvas.drawText("#FFFFFF",`${stat}: ${value}`, hudDims.x + 10, hudDims.y + 144 + i*14, {align: 'left', style: '12px'})
        }
    }
    
    // Resistance Types Section
    canvas.drawText("#FFFFFF",`Resistance Types`, hudDims.x + 140, hudDims.y + 300, {align: 'left', style: '12px'})
    const resistances = Object.entries(game.player.stats.resistances || {})
    for (let i = 0; i < resistances.length; i += 1) {
        const [stat, value] = resistances[i]
        if (value > 0) {
            canvas.drawText("#FFFFFF",`${stat}: ${value}`, hudDims.x + 140, hudDims.y + 314 + i*14, {align: 'left', style: '12px'})
        }
    }

    
    // Inventory Grid
    const inventoryDims = canvas.inventoryDims
    for (let y = 0; y < inventoryDims.rows; y += 1) {
        for (let x = 0; x < inventoryDims.cols; x += 1) {
            if (game.inventory[y * inventoryDims.cols + x]) {
                canvas.drawTile(game.inventory[y * 10 + x].tile, inventoryDims.x + x*canvas.ts, inventoryDims.y + y*canvas.ts)
            } else {
                canvas.drawTile('emptySlot', inventoryDims.x + x*canvas.ts, inventoryDims.y + y*canvas.ts)
            }
        }
    }

    // Gear Grid
    const gearDims = canvas.gearDims
    canvas.ctx.fillStyle = '#444444'
    canvas.ctx.fillRect(gearDims.x, gearDims.y, gearDims.w, gearDims.h)
    for (const [gearType, gearPos] of Object.entries(canvas.gearSlots)) {
        canvas.drawTile((game.gear[gearType] && game.gear[gearType].tile) || 'emptySlot', ...gearPos)
    }
}

export const renderOverlay = (game, mousePos) => {
    game.canvas.clearOverlay()
    if (game.heldItem !== null) {
        game.canvas.drawOverlayTile(game.heldItem.item.tile, ...mousePos)
        return
    }

    if (isPointInRect(mousePos, game.canvas.inventoryDims)) {
        const inventoryIndex = game.canvas.inventoryIndexAt(mousePos)

        if (game.inventory[inventoryIndex] !== null) {
            game.canvas.overlayCtx.fillStyle = '#FFFFFF'
            game.canvas.overlayCtx.fillRect(...mousePos, 50, 50)
            game.canvas.overlayCtx.fillStyle = '#000000'
            game.canvas.overlayCtx.fillRect(...add2d([1,1],mousePos), 50 - 2, 50 - 2)
        }
    }
}