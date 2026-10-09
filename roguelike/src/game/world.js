import { generateBSP } from "./generation/bsp.js"

export const getWorld = (dims) => {
    const board = Array.from({ length: dims[1] }, () => Array(dims[0]).fill(1))
    const explored = Array.from({ length: dims[1] }, () => Array(dims[0]).fill(false))
    const rooms = []
    const corridors = []
    return {
        board,
        explored,
        rooms,
        corridors,
        dims,
        at (x, y) {
            return this.board[y][x]
        },
        set (x, y, v) {
            this.board[y][x] = v
        },
        exploredAt (x, y) {
            return this.explored[y][x]
        },
        setExplored (x, y) {
            this.explored[y][x] = true
        },
        generate(rng) {
            generateBSP(this, rng)
        },
        getRandomRoom(rng) {
            const spawnRoomIndex = rng.randInRange(0, rooms.length)
            return rooms[spawnRoomIndex]
        }
    }
}
