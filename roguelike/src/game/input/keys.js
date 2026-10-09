export const downInput = {
    shift: false,
    left: false,
    right: false,
    up: false,
    down: false,
    space: false,
    [1]: false,
    [2]: false,
    [3]: false,
    [4]: false,
    [5]: false,
    [6]: false,
    [7]: false,
    [8]: false,
    [9]: false,
    [0]: false,
}

const inputToAction = (key) => {
    switch (key) {
        case 'up': return { action: 'step', stepTo: [0, -1] }
        case 'down': return { action: 'step', stepTo: [0, 1] }
        case 'left': return { action: 'step', stepTo: [-1, 0] }
        case 'right': return { action: 'step', stepTo: [1, 0] }
        case 'space': return { action: 'wait' }
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
        case 0:
            if (downInput.shift) {
                return { action: 'useItemQuickBar', index: (key + 10 - 1) % 10 }
            } else {
                // TODO: skill quick bar
                console.log("todo: skill quick bar")
            }
        default:
            return null
    }
}

const keysToInput = (e) => {
    switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
            return 'up'
        case 'ArrowDown':
        case 'KeyS':
            return 'down'
        case 'ArrowLeft': 
        case 'KeyA':
            return 'left'
        case 'ArrowRight':
        case 'KeyD':
            return 'right'
        case 'Space':
            return 'space'
        case 'ShiftLeft':
        case 'ShiftRight':
            return 'shift'
        case 'Digit1':
            return 1
        case 'Digit2':
            return 2
        case 'Digit3':
            return 3
        case 'Digit4':
            return 4
        case 'Digit5':
            return 5
        case 'Digit6':
            return 6
        case 'Digit7':
            return 7
        case 'Digit8':
            return 8
        case 'Digit9':
            return 9
        case 'Digit0':
            return 0
        default:
            return null
    }
}

export const keyDownHandler = (turn, game) => (e) => {
    const input = keysToInput(e)
    if (input !== null && !downInput[input]) {
        downInput[input] = true
        const action = inputToAction(input)
        if (action) {
            game.walkId += 1
            turn(action)
        }
    }
}

export const keyUpHandler = () => (e) => {
    const input = keysToInput(e)
    if (input !== null) {
        downInput[input] = false
    }

}
