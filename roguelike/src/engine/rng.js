export const getRNG = (seed) => {
    class Mulberry32 {
        constructor(seed) {
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

    let random = new Mulberry32(seed)
    const randCol = () => '#' + random.next().toString(16).slice(-6)
    const randInRange = (min, max) => {
        const minCeiled = Math.ceil(min)
        const maxFloored = Math.floor(max)
        return Math.floor(random.next() * (maxFloored - minCeiled) + minCeiled)
    }

    return {
        random,
        randCol,
        randInRange
    }
}
