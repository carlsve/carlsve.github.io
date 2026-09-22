export function initDeath(canvas, go) {
    const death = {
        onKey: () => { go('play') },
        onMouse: () => { go('play') }
    }
    canvas.ctx.fillStyle = '#000000'
    canvas.ctx.fillRect(0,0,canvas.canvas.width, canvas.canvas.height)
    canvas.drawText(
        '#FFFFFF', 'Game Over! Press any key to reload',
        canvas.canvas.width/2,
        canvas.canvas.height/2,
    )

    return death
}