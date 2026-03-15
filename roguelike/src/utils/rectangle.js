export const isPointInRect = ([x, y], {rx, ry, rw, rh}) =>
    x >= rx && x < (rx + rw) &&
    y >= ry && y < (ry + rh)
