import { initGame } from "../game/init.js"

export function initPlay(canvas, rng, go) {
    const onDeath = () => {
        console.log("GAME OVER")
        go('death')
        return
    }

    return initGame(canvas, rng, onDeath)
}