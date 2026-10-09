export const isPointInRect = ([vx, vy], {x, y, w, h}) =>
    vx >= x && vx < (x + w) &&
    vy >= y && vy < (y + h)

export const randomPointInRect = (rng, {x, y, w, h}) =>
    [ rng.randInRange(x, x + w), rng.randInRange(y, y + h) ]