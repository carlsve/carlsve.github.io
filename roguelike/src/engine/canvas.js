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
    tiles.src = "./tiles/tilemap2.png";
    await promisifyImage(tiles)
    const tileMap = {
        floor: [16,0],
        wall: [0,0],
        stairs: [32,0],
        player: [48,0],
        enemy: [0,16],
    }

    return {
        ts,
        canvas,
        ctx,
        drawTile(tile, x, y) {
            const [tx, ty] = tileMap[tile]
            ctx.drawImage(tiles,tx,ty,16,16,x*ts,y*ts,ts,ts)
        },
        drawFogTile(tile, x, y) {
            const [tx, ty] = tileMap[tile]
            ctx.globalAlpha = 0.45
            ctx.drawImage(tiles,tx,ty,16,16,x*ts,y*ts,ts,ts)
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
        drawText(color, text, x, y) {
            ctx.fillStyle = color
            ctx.font = "bold 14px 'Courier New', Courier, monospace";
            ctx.textAlign = 'center'   // 'left' | 'right' | 'center' | 'start' | 'end'
            ctx.textBaseline = 'middle' // 'top' | 'middle' | 'bottom' | 'alphabetic' (default)
            ctx.fillText(text, x, y);
        },
    }
}