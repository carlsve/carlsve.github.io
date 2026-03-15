import { sub2d, apply2d, div2d, clamp2d } from "../utils/vec2d.js"

const viewport = {
    dims: [20, 15]
}

export const camera = (entity, world) => {
    const wdims = world.dims
    const vdims = viewport.dims
    const offset = sub2d(entity.pos, apply2d(Math.floor, div2d(viewport.dims, 2)))
    const [vx, vy] = clamp2d(offset, [0,0], sub2d(wdims, vdims))
    const [vw, vh] = vdims

    return {vx, vy, vw, vh}
}
