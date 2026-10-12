import { isPointInRect } from "../../utils/rectangle.js"
import { add2d } from "../../utils/vec2d.js"
import { camera } from "../camera.js"

export const hitTest = (game, mousePos) => {
    if (isPointInRect(mousePos, game.canvas.inventoryDims)) {
        const index = game.canvas.inventoryIndexAt(mousePos)

        return { kind: 'inventory', index }
    }

    if (isPointInRect(mousePos, game.canvas.gameWindowDims)) {
        const viewPortPos = game.canvas.getTilePosAt(...mousePos)
        const viewPort = camera(game, game.focusedEntity, game.canvas.viewPortDims)
        const worldPos = add2d([viewPort.x, viewPort.y], viewPortPos)

        return { kind: 'map', worldPos }
    }

    if (isPointInRect(mousePos, game.canvas.gearDims)) {
        const slot = game.canvas.gearSlotAt(mousePos)

        return { kind: 'gear', slot }
    }

    if (isPointInRect(mousePos, game.canvas.itemQuickBarDims)) {
        const index = game.canvas.itemQuickBarIndexAt(mousePos)

        return { kind: 'itemQuickBar', index }
    }

    return { kind: 'outside' }
}
