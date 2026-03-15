export const world = {
    dims: null,
    board: null,
    rooms: [],
    corridors: [],
    init (dims) {
        this.dims = dims
        this.board = Array.from({ length: dims[1] }, () => Array(dims[0]).fill(1))
    },
    at (x, y) {
        return this.board[y][x]
    },
    set (x, y, v) {
        this.board[y][x] = v
    }
}