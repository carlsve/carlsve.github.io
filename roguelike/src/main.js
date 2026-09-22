import { initPlay } from './scenes/play.js'
import { initDeath } from './scenes/death.js'
import { getRNG } from './engine/rng.js'
import { getCanvas } from './engine/canvas.js'


document.addEventListener('DOMContentLoaded', async () => {
    const canvas = await getCanvas()
    
    const sceneControl = {
        current: {
            onKey: () => {},
            onMouse: () => {},
            onMouseMove: () => {},
        },
        setScene(scene) {
            this.current = scene
        }
    }
    
    document.addEventListener('keydown', (e) => sceneControl.current.onKey(e))
    canvas.canvas.addEventListener('click', (e) => sceneControl.current.onMouse(e))
    canvas.canvas.addEventListener('mousemove', (e) => sceneControl.current.onMouseMove(e))
    
    function go(name) {
        switch (name) {
            case 'play': {
                sceneControl.setScene(initPlay(canvas, getRNG(Date.now()), go))
                break
            }
            case 'death': {
                sceneControl.setScene(initDeath(canvas, go))
                break
            }
            default:
                throw new Error(`Scene with name ${name} not recognized`)
        }
    }
    go('play')
})