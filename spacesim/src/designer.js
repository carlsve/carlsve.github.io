import { initRender } from './renderer/renderer.js'
import { cube } from './meshes/cube.js'
import { rewireMesh } from './utils/rewireMesh.js'

document.addEventListener('DOMContentLoaded', function() {
    const keys = {}
    const camera = {
        x: 0,
        y: 0,
        z: 0,
        yaw: 0,
        pitch: 0,
        roll: 0    
    }
    const meshes = {
        cube: rewireMesh(cube)
    }
    const entities = [{ p: {x:0,y:0,z:1}, type: 'cube' }]

    window.designer = {
        render: {
            drawPoints: true,
            drawTriangles: true
        },
        camera,
        keys,
        meshes,
        entities,
    }

    const game = document.querySelector('#spacesim')
    game.width = 640
    game.height = 480

    window.addEventListener("keydown", (e) => {
        keys[e.key] = true
    })
    
    window.addEventListener("keyup", (e) => {
        keys[e.key] = false
    })

    const { renderFrame } = initRender(game, camera, meshes)
    let lastTime = performance.now()
    
    function loop(currentTime) {
        const dt = (currentTime - lastTime) / 1000
        lastTime = currentTime    
    
        if (keys["w"]) {
            camera.x += Math.sin(camera.yaw) * dt
            camera.z += Math.cos(camera.yaw) * dt
        }
        if (keys["s"]) {
            camera.x -= Math.sin(camera.yaw) * dt
            camera.z -= Math.cos(camera.yaw) * dt
        }
        if (keys["a"]) {
            camera.x -= Math.cos(camera.yaw) * dt
            camera.z += Math.sin(camera.yaw) * dt
        }
        if (keys["d"]) {
            camera.x += Math.cos(camera.yaw) * dt
            camera.z -= Math.sin(camera.yaw) * dt
        }
        if (keys["e"]) {
            camera.roll -= Math.PI*dt/2
        }
        if (keys["q"]) {
            camera.roll += Math.PI*dt/2
        }
        if (keys["z"]) {
            camera.y -= dt
        }
        if (keys["x"]) {
            camera.y += dt;
        }
        if (keys["ArrowLeft"])  camera.yaw -= Math.PI*dt/2
        if (keys["ArrowRight"]) camera.yaw += Math.PI*dt/2
        if (keys["ArrowUp"])  camera.pitch += Math.PI*dt/2
        if (keys["ArrowDown"]) camera.pitch -= Math.PI*dt/2
        if (keys["r"]) {
            camera.pitch = camera.roll = camera.yaw = 0
        }
        if (keys["t"]) {
            camera.x = camera.y = camera.z = 0
        }

        renderFrame(entities)

        requestAnimationFrame(loop)
    }

    requestAnimationFrame(loop)
})