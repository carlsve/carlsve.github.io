class Mulberry32 {
  constructor(seed = Date.now()) {
    this.seed = seed;
  }
  
  next() {
    let t = this.seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  
  setSeed(seed) {
    this.seed = seed;
  }
}

let random = new Mulberry32(Date.now())
const randCol = () => '#' + random.next().toString(16).slice(-6)
const randInRange = (min, max) => {
    const minCeiled = Math.ceil(min)
    const maxFloored = Math.floor(max)
    return Math.floor(random.next() * (maxFloored - minCeiled) + minCeiled)
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('#dungeons-widget__canvas')
    const ctx = canvas.getContext("2d")
    const width = 640
    const height = 480

    const controls = {
        drawRooms: true,
        drawCorridors: true,
        drawSectorMap: false,
        depth: 4,
        whratio: 1.25,
        roomFillPercentageMin: 0.6,
        roomFillPercentageMax: 0.8,
        splitWithinPercentage: 0.4,
        seed: Date.now(),
        corridorWidth: 10,
    }
    let drawQueue = []
    document.querySelector('#dungeons-widget__whthreshold-value').textContent = controls.whratio
    document.querySelector('#dungeons-widget__depth-value').textContent = controls.depth
    document.querySelector('#dungeons-widget__roomfillpercentagemin-value').textContent = controls.roomFillPercentageMin
    document.querySelector('#dungeons-widget__roomfillpercentagemax-value').textContent = controls.roomFillPercentageMax
    document.querySelector('#dungeons-widget__corridorwidth-value').textContent = controls.corridorWidth
    document.querySelector('#dungeons-widget__splitwithinpercentage-value').textContent = controls.splitWithinPercentage
    document.querySelector('#dungeons-widget__seed').value = controls.seed
    /**
     * Generate BSP Tree
     * 
     * The draw queue is reset
     * canvas draw events are added to drawQueue in the divide function
     */
    const generateBSP = () => {
        drawQueue = []
        drawQueue.push(() => {
            ctx.strokeStyle = "#000000";
            ctx.strokeRect(0, 0, width, height);
            ctx.fillStyle = "#000000"
            ctx.fillRect(0, 0, width, height)
        })
        random.setSeed(controls.seed)
        divide(controls.depth, 0, 0, width, height)
    }

    /**
     * draw the BSP generated tree
     * 
     * reset the seed to the start value
     * iterate through the draw queue
     */
    const drawBSP = () => {
        random.setSeed(controls.seed)
        drawQueue.forEach(code => {
            code()
        })
    }

    /**
     * divide
     * call the recursive sector dividing algorithm
     * BSP - Binary Space Partition
     * 
     * When divide is down to leaf nodes (max depth is reached)
     * Rooms will be generated
     * 
     * After room generation, each recursive call
     * adds corridors between the center point of the two sectors,
     * down to root
     * 
     * @param {*} depth 
     * @param {*} x 
     * @param {*} y 
     * @param {*} w 
     * @param {*} h 
     */
    const divide = (depth, x, y, w, h) => {
        drawQueue.push(() => {
            if (controls.drawSectorMap) {
                ctx.fillStyle = randCol()
                ctx.fillRect(x, y, w, h)
            }
        })
        if (depth === 0) {
            // generate room inside rectangle
            // room should be 60-80% of rectangle
            // if width is 100 -> roomWidth is 80
            // same for height
            // and it must be placed in the middle

            drawQueue.push(() => {
                const roomFillPercentage = random.next() * (Number(controls.roomFillPercentageMax)- Number(controls.roomFillPercentageMin)) + Number(controls.roomFillPercentageMin)
                if (controls.drawRooms) {
                    const fillW = Math.floor(w * roomFillPercentage)
                    const fillH = Math.floor(h * roomFillPercentage)
                    const fillX = Math.floor(x + w/2 - fillW/2)
                    const fillY = Math.floor(y + h/2 - fillH/2)
                    ctx.fillStyle = "#CCCCCC"
                    ctx.fillRect(fillX, fillY, fillW, fillH)
                }
            })
        } else {
            if (w/h > controls.whratio) {
                const splitWithinPercentage = controls.splitWithinPercentage
                const splitRangeOfRoom = Math.floor(w * splitWithinPercentage)
                const middleOfRoom = Math.floor(w/2)
                const rangeMin = Math.floor(middleOfRoom - splitRangeOfRoom/2)
                const rangeMax = Math.floor(middleOfRoom + splitRangeOfRoom/2)
                const splitAt = randInRange(rangeMin, rangeMax)

                divide(depth - 1, x, y, splitAt, h)
                divide(depth - 1, x + splitAt, y, w - splitAt, h)

                drawQueue.push(() => {
                    if (controls.drawCorridors) {
                        const corridorWidth = controls.corridorWidth
                        const r1centerX = x + splitAt/2
                        const r1centerY = y + h/2
                        const r2centerX = splitAt/2 + (w - splitAt)/2
                        const r2centerY = y + h/2
                        ctx.fillStyle = "#CCCCCC"
                        ctx.fillRect(r1centerX, r1centerY - corridorWidth/2, r2centerX, corridorWidth)
                    }
                })
            } else {
                const splitWithinPercentage = controls.splitWithinPercentage
                const splitRangeOfRoom = Math.floor(h * splitWithinPercentage)
                const middleOfRoom = Math.floor(h/2)
                const rangeMin = Math.floor(middleOfRoom - splitRangeOfRoom/2)
                const rangeMax = Math.floor(middleOfRoom + splitRangeOfRoom/2)
                const splitAt = randInRange(rangeMin, rangeMax)

                divide(depth - 1, x, y, w, splitAt)
                divide(depth - 1, x, y + splitAt, w, h - splitAt)

                drawQueue.push(() => {
                    if (controls.drawCorridors) {
                        const corridorWidth = controls.corridorWidth
                        const r1centerX = x + w/2
                        const r1centerY = y + splitAt/2
                        const r2centerX = x + w/2
                        const r2centerY = splitAt/2 + (h - splitAt)/2

                        ctx.fillStyle = "#CCCCCC"
                        ctx.fillRect(r1centerX - corridorWidth/2, r1centerY, corridorWidth, r2centerY)
                    }
                })
            }
        }
    }

    generateBSP()
    drawBSP()

    /**
     * UI Logic
     */
    const toggleSectorMap = document.querySelector("#dungeons-widget__sector-map")
    toggleSectorMap.addEventListener('click', (e) => {
        controls.drawSectorMap = e.target.checked
        console.log(controls.drawSectorMap)
        drawBSP()
    })
    const toggleRooms = document.querySelector("#dungeons-widget__rooms")
    toggleRooms.addEventListener('click', (e) => {
        controls.drawRooms = e.target.checked
        drawBSP()  
    })
    const toggleCorridors = document.querySelector("#dungeons-widget__corridors")
    toggleCorridors.addEventListener('click', (e) => {
        controls.drawCorridors = e.target.checked
        drawBSP()  
    })
    const depthSlider = document.querySelector("#dungeons-widget__depth")
    depthSlider.addEventListener('input', (e) => {
        controls.depth = e.target.value
        document.querySelector('#dungeons-widget__depth-value').textContent = controls.depth
        generateBSP()
        drawBSP()
    })
    const whThresholdRatioSlider = document.querySelector("#dungeons-widget__whthreshold")
    whThresholdRatioSlider.addEventListener('input', (e) => {
        controls.whratio = e.target.value
        document.querySelector('#dungeons-widget__whthreshold-value').textContent = controls.whratio
        generateBSP()
        drawBSP()
    })
    const splitWithinPercentageSlider = document.querySelector("#dungeons-widget__splitwithinpercentage")
    splitWithinPercentageSlider.addEventListener('input', (e) => {
        controls.splitWithinPercentage = e.target.value
        document.querySelector('#dungeons-widget__splitwithinpercentage-value').textContent = controls.splitWithinPercentage
        generateBSP()
        drawBSP()
    })
    const roomFillPercentageMinSlider = document.querySelector("#dungeons-widget__roomfillpercentagemin")
    roomFillPercentageMinSlider.addEventListener('input', (e) => {
        controls.roomFillPercentageMin = e.target.value
        document.querySelector('#dungeons-widget__roomfillpercentagemin-value').textContent = controls.roomFillPercentageMin
        drawBSP()
    })
    const roomFillPercentageMaxSlider = document.querySelector("#dungeons-widget__roomfillpercentagemax")
    roomFillPercentageMaxSlider.addEventListener('input', (e) => {
        controls.roomFillPercentageMax = e.target.value
        document.querySelector('#dungeons-widget__roomfillpercentagemax-value').textContent = controls.roomFillPercentageMax
        drawBSP()
    })
    const corridorWidth = document.querySelector("#dungeons-widget__corridorwidth")
    corridorWidth.addEventListener('input', (e) => {
        controls.corridorWidth = e.target.value
        document.querySelector('#dungeons-widget__corridorwidth-value').textContent = controls.corridorWidth
        drawBSP()
    })
    const generate = document.querySelector("#dungeons-widget__generate")
    generate.addEventListener('click', () => {
        generateBSP()
        drawBSP()
    })
    const generateRandom = document.querySelector("#dungeons-widget__generaterandom")
    generateRandom.addEventListener('click', () => {
        controls.seed = Date.now()
        document.querySelector('#dungeons-widget__seed').value = controls.seed  
        generateBSP()
        drawBSP()
    })
    const seed = document.querySelector("#dungeons-widget__seed")
    seed.addEventListener('click', (e) => {
        controls.seed = e.target.value
    })

    const log = document.querySelector("#dungeons-widget__log")
    log.addEventListener('click', () => {
        console.log(controls)
    })
})
