export const isPointInRect = ([vx, vy], {x, y, w, h}) =>
    vx >= x && vx < (x + w) &&
    vy >= y && vy < (y + h)
