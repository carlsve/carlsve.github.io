import { add2d } from '../../utils/vec2d.js'

export const ghost = {
    pos: [0,0],
    perform (action) {
        const isMoveAction = ['up', 'down', 'left', 'right'].includes(action)

        if (isMoveAction) {
            const dpos = {
                up: [0, -1],
                down: [0, 1],
                left: [-1, 0],
                right: [1, 0],
            }[action]

            this.pos = add2d(this.pos, dpos)

            return true
        }

        throw new Error(`action "${action}" not implemented`)
    }
}