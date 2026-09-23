const promisifyImage = (img) => new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = reject
})

export const getCanvas = async () => {
    const ts = 32
    const canvas = document.querySelector('#dungeons-widget__map')
    const ctx = canvas.getContext("2d")
    ctx.imageSmoothingEnabled = false
    const tiles = new Image(ts, ts);
    tiles.src = "./tiles/tilemap2-1-1-1.png";
    await promisifyImage(tiles)
    const tileMap = {
        floor: [16,0],
        wall: [0,0],
        stairs: [32,0],
        player: [48,0],
        enemy: [0,16],
        sword: [16,16],
        emptyInventorySlot: [32,16],
        helmet: [48,16],
        healthPotion: [0, 32]
    }
    const gameWindowDims = {x: 0, y: 0, w: 640, h: 480}
    const bottomHUDDims = {x: 0, y: gameWindowDims.h, w: gameWindowDims.w, h: canvas.height - gameWindowDims.h}
    const rightHUDDims = {x: gameWindowDims.w, y: 0, w: canvas.width - gameWindowDims.w, h: canvas.height}
    const inventoryDims = {x: rightHUDDims.x, y: rightHUDDims.y + rightHUDDims.h - 192, w: 320, h: 192, cols: 10, rows: 6}
    const gearDims = {x: rightHUDDims.x, y: rightHUDDims.y + rightHUDDims.h - 192 - 4*ts, w: 3*ts, h: 4*ts}
    const gearSlots = {
        helmet:  [gearDims.x + 1*ts, gearDims.y + 0*ts],
        body:    [gearDims.x + 1*ts, gearDims.y + 1*ts],
        weapon1: [gearDims.x + 0*ts, gearDims.y + 1*ts],
        weapon2: [gearDims.x + 2*ts, gearDims.y + 1*ts],
        legs:    [gearDims.x + 1*ts, gearDims.y + 2*ts],
        boots:   [gearDims.x + 1*ts, gearDims.y + 3*ts],
        hands:   [gearDims.x + 0*ts, gearDims.y + 3*ts],
        ring1:   [gearDims.x + 2*ts, gearDims.y + 2*ts],
        ring2:   [gearDims.x + 2*ts, gearDims.y + 3*ts],
    }
    return {
        gameWindowDims,
        bottomHUDDims,
        rightHUDDims,
        inventoryDims,
        gearDims,
        gearSlots,
        ts,
        canvas,
        ctx,
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
    }
}