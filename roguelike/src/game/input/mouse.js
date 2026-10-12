import { sub2d } from '../../utils/vec2d.js'
import { renderOverlay } from '../render.js'
import { walkTo } from '../autowalk.js'
import { hitTest } from './hitTest.js'
import { resolveClick } from './click.js'

export const mouseHandler = (turn, game) => async (e) => {
    const rect = game.canvas.boundingClientRect
    const mousePos = sub2d([e.clientX, e.clientY], [rect.left, rect.top])
    console.log(`click position: ${mousePos}, shift: ${game.downInput.shift}`)

    const target = hitTest(game, mousePos)
    console.log(JSON.stringify(target))
    const action = resolveClick(game, { target, button: 'left', shift: game.downInput.shift })
    console.log(JSON.stringify(action || {}))

    if (action === null) {
        return
    }

    if (action.command) {
        turn(action.command)
        game.mousePos = mousePos
        return
    }

    if (action.walk) {
        await walkTo(game, turn, action.walk.worldPos)
        return
    }
}

export const rightClickHandler = (turn, game) => (e) => {
    e.preventDefault()
    
    const rect = game.canvas.boundingClientRect
    const mousePos = sub2d([e.clientX, e.clientY], [rect.left, rect.top])
    console.log(`right click position: ${mousePos}`)

    const target = hitTest(game, mousePos)
    console.log(JSON.stringify(target))
    const action = resolveClick(game, { target, button: 'right', shift: false })
    console.log(JSON.stringify(action || {}))

    if (action === null) {
        return
    }

    if (action.command) {
        turn(action.command)
        game.mousePos = mousePos
        return
    }
}

let raf = 0
export const mouseMoveHandler = (game) => (e) => {
    if (!raf) {
        raf = requestAnimationFrame(() => {
            raf = 0
            const rect = game.canvas.boundingClientRect
            const mousePos = sub2d([e.clientX, e.clientY], [rect.left, rect.top])
            game.mousePos = mousePos
            renderOverlay(game, mousePos)
        })
    }
}