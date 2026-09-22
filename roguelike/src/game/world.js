export const world = {
    dims: null,
    board: null,
    explored: null,
    rooms: [],
    corridors: [],
    init (dims) {
        this.dims = dims
        this.rooms = []
        this.corridors = []
        this.board = Array.from({ length: dims[1] }, () => Array(dims[0]).fill(1))
        this.explored = Array.from({ length: dims[1] }, () => Array(dims[0]).fill(false))
    },
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
    }
}