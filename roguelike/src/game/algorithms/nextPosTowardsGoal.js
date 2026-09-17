export function nextPosTowardGoal(rng, board, from, to) {
    let [x, y] = from
    const [x1, y1] = to

    let dx = Math.abs(x1 - x)
    let dy = Math.abs(y1 - y)
    let sx = Math.sign(x1 - x)
    let sy = Math.sign(y1 - y)

    if (dx === 0 && dy === 0) {
        return from
    }

    let err = dx - dy
    let e2 = 2 * err
    let wantX = (dx > 0) && (e2 > -dy)
    let wantY = (dy > 0) && (e2 < dx)

    if (wantX && wantY) {
        if (dx > dy) {
            wantX = false
        } else {
            wantY = false
        }
    }

    if ((dy !== 0 && dx !== 0) && rng.random.next() < 0.30) {
        wantX = !wantX
        wantY = !wantY
    }

    if (wantX) {
        return [x + sx, y]
    }

    if (wantY) {
        return [x, y + sy]
    }
}