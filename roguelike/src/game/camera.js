import { sub2d, apply2d, div2d, clamp2d } from "../utils/vec2d.js"

export const camera = (game, entity, dims) => {
    const offset = sub2d(entity.pos, apply2d(Math.floor, div2d(dims, 2)))
    const [x, y] = clamp2d(offset, [0,0], sub2d(game.world.dims, dims))
    const [w, h] = dims

    return {x, y, w, h}
}
