import { apply2d, mul2d, div2d, sub2d } from "../utils/vec2d.js"
import { isPointInRect } from "../utils/rectangle.js"

const promisifyImage = (img) => new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = reject
})

export const getCanvas = async () => {
    const ts = 32
    const minimapTs = 4
    const canvas = document.querySelector('#dungeons-widget__map')

    const overlay = document.createElement('canvas')
    overlay.style.pointerEvents = 'none'
    overlay.style.imageRendering = 'pixelated'
    overlay.width = canvas.width
    overlay.height = canvas.height
    overlay.style.position = 'absolute'
    overlay.style.left = '0px'
    overlay.style.top = '0px'
    canvas.parentNode.appendChild(overlay)
    const overlayCtx = overlay.getContext("2d")
    overlayCtx.imageSmoothingEnabled = false

    const boundingClientRect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext("2d")
    ctx.imageSmoothingEnabled = false
    const tiles = new Image(ts, ts);
    tiles.src = "./tiles/tilemap2-2.png";
    await promisifyImage(tiles)
    const tileMap = {
        floor: [16,0],
        wall: [0,0],
        stairs: [32,0],
        player: [48,0],
        enemy: [0,16],
        sword: [16,16],
        emptySlot: [32,16],
        helmet: [48,16],
        healthPotion: [0, 32],
        crossbow: [16, 32],
        arrows: [32, 32],
        throwingStar: [48, 32],
    }
    const viewPortDims = [20, 15]
    const minimapDims = mul2d(2, viewPortDims)
    const gameWindowDims = {x: 0, y: 0, w: 640, h: 480}
    const minimapWindowDims = {x: gameWindowDims.w - minimapDims[0] * minimapTs, y: gameWindowDims.y, w: minimapDims[0] * minimapTs, h: minimapDims[1] * minimapTs }
    const bottomHUDDims = {x: 0, y: gameWindowDims.h, w: gameWindowDims.w, h: canvas.height - gameWindowDims.h}
    const rightHUDDims = {x: gameWindowDims.w, y: 0, w: canvas.width - gameWindowDims.w, h: canvas.height}
    const inventoryDims = {x: rightHUDDims.x, y: rightHUDDims.y + rightHUDDims.h - 192, w: 320, h: 192, cols: 10, rows: 6}
    const gearDims = {x: rightHUDDims.x, y: rightHUDDims.y + rightHUDDims.h - 192 - 4*ts, w: 3*ts, h: 4*ts}
    const itemQuickBarDims = {x: bottomHUDDims.x, y: bottomHUDDims.y, w: 10*ts, h: ts, cols: 10, rows: 1}
    const selectedSlot = {x:itemQuickBarDims.x + itemQuickBarDims.w + ts, y:itemQuickBarDims.y, w: ts, h: ts}
    const gearSlots = {
        helmet:  [gearDims.x + 1*ts, gearDims.y + 0*ts],
        body:    [gearDims.x + 1*ts, gearDims.y + 1*ts],
        weapon1: [gearDims.x + 2*ts, gearDims.y + 1*ts],
        weapon2: [gearDims.x + 0*ts, gearDims.y + 1*ts],
        legs:    [gearDims.x + 1*ts, gearDims.y + 2*ts],
        feet:   [gearDims.x + 1*ts, gearDims.y + 3*ts],
        hands:   [gearDims.x + 2*ts, gearDims.y + 2*ts],
        ring1:   [gearDims.x + 0*ts, gearDims.y + 2*ts],
        ring2:   [gearDims.x + 0*ts, gearDims.y + 3*ts],
        crossbow: [gearDims.x + 2*ts, gearDims.y + 3*ts]
    }
    return {
        minimapTs,
        minimapWindowDims,
        viewPortDims,
        minimapDims,
        gameWindowDims,
        bottomHUDDims,
        rightHUDDims,
        inventoryDims,
        itemQuickBarDims,
        gearDims,
        gearSlots,
        selectedSlot,
        ts,
        canvas,
        ctx,
        overlayCtx,
        boundingClientRect,
        drawTile(tile, x, y) {
            const [tx, ty] = tileMap[tile]
            ctx.drawImage(tiles,tx,ty,16,16,x,y,ts,ts)
        },
        drawFogTile(tile, x, y) {
            const [tx, ty] = tileMap[tile]
            ctx.globalAlpha = 0.45
            ctx.drawImage(tiles,tx,ty,16,16,x,y,ts,ts)
            ctx.globalAlpha = 1.0
        },
        drawRect(color, x, y) {
            ctx.strokeStyle = color
            ctx.strokeRect(x*ts,y*ts,ts,ts)
        },
        getTilePosAt(x, y) {
            return [
                Math.floor(x / ts),
                Math.floor(y / ts)
            ]
        },
        drawText(color, text, x, y, options = {}) {
            ctx.fillStyle = color
            ctx.font = `${options.style || 'bold 14px'} 'Courier New', Courier, monospace`;
            ctx.textAlign = options.align || 'center'   // 'left' | 'right' | 'center' | 'start' | 'end'
            ctx.textBaseline = 'middle' // 'top' | 'middle' | 'bottom' | 'alphabetic' (default)
            ctx.fillText(text, x, y);
        },
        drawOverlayTile(tile, x, y) {
            const [tx, ty] = tileMap[tile]
            overlayCtx.drawImage(tiles,tx,ty,16,16,x,y,ts,ts)
        },
        clearOverlay() {
            overlayCtx.clearRect(0, 0, overlay.width, overlay.height)
        },
        inventoryIndexAt(mousePos) {
            const [col, row] = apply2d(Math.floor, div2d(sub2d(mousePos, [inventoryDims.x, inventoryDims.y]), ts))
            if (col < 0 || col >= inventoryDims.cols) return -1
            if (row < 0 || row >= inventoryDims.rows) return -1
            return row * inventoryDims.cols + col
        },
        gearSlotAt(mousePos) {
            for (const [slot, slotPos] of Object.entries(gearSlots)) {
                if (isPointInRect(mousePos, { x: slotPos[0], y: slotPos[1], w: ts, h: ts })) {
                    return slot
                }
            }
            return null
        },
        itemQuickBarIndexAt(mousePos) {
            const [col, row] = apply2d(Math.floor, div2d(sub2d(mousePos, [itemQuickBarDims.x, itemQuickBarDims.y]), ts))
            if (col < 0 || col >= itemQuickBarDims.cols) return -1
            if (row < 0 || row >= itemQuickBarDims.rows) return -1
            return row * itemQuickBarDims.cols + col
        }
    }
}