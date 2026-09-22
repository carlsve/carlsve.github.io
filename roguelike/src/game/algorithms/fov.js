import { hasLOS } from "./hasLOS.js"
import { hypot2d } from "../../utils/vec2d.js"

export function fov(grid, origin, radius) {
    const visible = []
    const [x0, y0] = origin
    const [cols, rows] = [grid[0].length, grid.length]

    const xMin = Math.max(0, x0 - radius)
    const xMax = Math.min(cols - 1, x0 + radius)
    const yMin = Math.max(0, y0 - radius)
    const yMax = Math.min(rows - 1, y0 + radius)

    for (let y = yMin; y <= yMax; y += 1) {
        for (let x = xMin; x <= xMax; x += 1) {
            if (Math.round(hypot2d([x - x0, y - y0])) > radius) {
                continue
            }
            if (hasLOS(grid, origin, [x,y])) {
                visible.push([x, y])
            }
        }
    }

    return visible
}