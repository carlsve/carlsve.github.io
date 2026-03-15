const bsp = {
    roomFillPercentageMin: 0.5,
    roomFillPercentageMax: 0.8,
    depth: 4,
    corridorWidth: 2,
    splitWithinPercentage: 0.4,
    whratio: 1.25
}

export const generateBSP = (world, { random, randInRange }) => {
    const divide = (depth, x, y, w, h) => {
        if (depth === 0) {
            const roomFillPercentage = random.next() * (bsp.roomFillPercentageMax - bsp.roomFillPercentageMin) + bsp.roomFillPercentageMin

            const rW = Math.floor(w * roomFillPercentage)
            const rH = Math.floor(h * roomFillPercentage)
            const rX = Math.floor(x + w/2 - rW/2)
            const rY = Math.floor(y + h/2 - rH/2)

            world.rooms.push({ x: rX, y: rY, w: rW, h: rH})

            for (let i = 0; i < rH; i += 1) {
                for (let j = 0; j < rW; j += 1) {
                    world.set(rX + j, rY + i, 0)
                }
            }
        } else {
            if (w/h > bsp.whratio) {
                // Split vertically ( | )
                const splitRangeOfRoom = Math.floor(w * bsp.splitWithinPercentage)
                const middleOfRoom = Math.floor(w/2)
                const rangeMin = Math.floor(middleOfRoom - splitRangeOfRoom/2)
                const rangeMax = Math.floor(middleOfRoom + splitRangeOfRoom/2)
                const splitAt = randInRange(rangeMin, rangeMax)

                divide(depth - 1, x, y, splitAt, h)
                divide(depth - 1, x + splitAt, y, w - splitAt, h)

                const cX = Math.floor(x + splitAt/2)
                const cY = Math.floor(y + h/2 - bsp.corridorWidth/2)
                const cW = Math.floor(w/2)
                const cH = Math.floor(bsp.corridorWidth)
                for (let i = 0; i < cH; i += 1) {
                    for (let j = 0; j < cW; j += 1) {
                        world.set(cX + j, cY + i, 0)
                    }
                }
            } else {
                // Split horizontally (---)
                const splitRangeOfRoom = Math.floor(h * bsp.splitWithinPercentage)
                const middleOfRoom = Math.floor(h/2)
                const rangeMin = Math.floor(middleOfRoom - splitRangeOfRoom/2)
                const rangeMax = Math.floor(middleOfRoom + splitRangeOfRoom/2)
                const splitAt = randInRange(rangeMin, rangeMax)
                
                divide(depth - 1, x, y, w, splitAt)
                divide(depth - 1, x, y + splitAt, w, h - splitAt)

                const cX = Math.floor(x + w/2 - bsp.corridorWidth/2)
                const cY = Math.floor(y + splitAt/2)
                const cW = Math.floor(bsp.corridorWidth)
                const cH = Math.floor(h/2)
                for (let i = 0; i < cH; i += 1) {
                    for (let j = 0; j < cW; j += 1) {
                        world.set(cX + j, cY + i, 0)
                    }
                }
            }
        }
    }
    divide(bsp.depth, 0, 0, ...world.dims)
}
