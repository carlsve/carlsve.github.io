import { initGame } from './scenes/game.js'
import { getRNG } from './engine/rng.js'
import { getCanvas } from './engine/canvas.js'

document.addEventListener('DOMContentLoaded', async () => {
    const canvas = await getCanvas()
    const rng = getRNG(Date.now())

    initGame(canvas, rng)
})