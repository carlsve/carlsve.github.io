import { apply2d, eq2d, sub2d } from "../../utils/vec2d.js"

// line of sight calculator
export function hasLOS(grid, from, to) {
    const [x0, y0] = from
    const [x1, y1] = to

    let [dx, dy] = apply2d(Math.abs, sub2d(to, from))
    let [sx, sy] = apply2d(Math.sign, sub2d(to, from))

    let err = dx - dy
    let [x, y] = [x0, y0]

    while (true) {
        if (x === x1 && y === y1) {
            return true
        }

        if (!eq2d([x,y], from) && grid[y][x] !== 0) {
            return false
        }

        const e2 = 2 * err
        if (e2 > -dy) {
            err = err - dy
            x = x + sx
        }
        if (e2 < dx) {
            err = err + dx
            y = y + sy
        }
    }
}