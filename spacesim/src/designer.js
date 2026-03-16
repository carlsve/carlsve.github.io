import { initRender } from './renderer/renderer.js'
import { cube } from './meshes/cube.js'
import { ship } from './meshes/ship.js'
import { station } from './meshes/station.js'
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
        cube: rewireMesh(cube),
        ship,
        station,
    }
    const entities = [
        { p: {x:2,y:0,z:1}, type: 'cube' },
        { p: {x:-2,y:0,z:2}, type: 'cube' },
        { p: {x:0,y:0,z:3}, type: 'ship' },
        { p: {x:0,y:0,z:1}, type: 'station' },
    ]

    const ui = {
        renderPoints: document.querySelector('#renderPoints'),
        renderTriangles: document.querySelector('#renderTriangles'),
        renderWireframe: document.querySelector('#renderWireframe'),
        game: document.querySelector('#spacesim'),
    }

    window.designer = {
        ui,
        settings: {
            renderPoints: ui.renderPoints.checked,
            renderTriangles: ui.renderTriangles.checked,
            renderWireframe: ui.renderWireframe.checked,
        },
        camera,
        keys,
        meshes,
        entities,
    }
    ui.renderPoints.addEventListener('click', function() {
        window.designer.settings.renderPoints = ui.renderPoints.checked
    })
    ui.renderTriangles.addEventListener('click', function() {
        window.designer.settings.renderTriangles = ui.renderTriangles.checked
    })
    ui.renderWireframe.addEventListener('click', function() {
        window.designer.settings.renderWireframe = ui.renderWireframe.checked
    })
    ui.game.width = 640
    ui.game.height = 480

    window.addEventListener("keydown", (e) => {
        keys[e.key] = true
    })
    
    window.addEventListener("keyup", (e) => {
        keys[e.key] = false
    })

    const { renderFrame } = initRender(ui.game, camera, meshes)
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
            camera.roll += Math.PI*dt/2
        }
        if (keys["q"]) {
            camera.roll -= Math.PI*dt/2
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