export const add2d = (a,b) => [a[0] + b[0], a[1] + b[1]]
export const sub2d = (a,b) => [a[0] - b[0], a[1] - b[1]]
export const mul2d = (c,a) => [c * a[0], c * a[1]]
export const div2d = (a,c) => [a[0]/c,a[1]/c]
export const apply2d = (f,a) => [f(a[0]), f(a[1])]
export const mulx2d = (a,b) => [a[0] * b[0], a[1] * b[1]]
export const clamp2d = ([x,y], [minX, minY], [maxX, maxY]) => [
    Math.max(minX, Math.min(maxX, x)),
    Math.max(minY, Math.min(maxY, y))
]
export const eq2d = ([x1, y1], [x2, y2]) => x1 === x2 && y1 === y2
