import { initRender } from './renderer/renderer.js'
import { cube } from './meshes/cube.js'
import { ship } from './meshes/ship.js'
import { station } from './meshes/station.js'
import { rewireMesh } from './utils/rewireMesh.js'
import { M3 } from "./math/matrix.js"
import { teapot } from './meshes/teapot.js'

document.addEventListener('DOMContentLoaded', function() {
    const keys = {}
    const camera = {
        x: 0,
        y: 0,
        z: 0,
        yaw: 0,
        pitch: 0,
        roll: 0,
        thrust: 0,
        maxThrust: 0.4,
        velocity: 0.1,
        forwardThrust: 0,
        backwardThrust: 0,
        leftThrust: 0,
        rightThrust: 0
    }
    const meshes = {
        cube: rewireMesh(cube),
        ship,
        station,
        teapot: rewireMesh(teapot)
    }
    meshes.teapot.vs = meshes.teapot.vs.map(v => M3(v).rot_yz(-Math.PI/2).val())
    const vowels = ['a','e','i','o','u','y']
    const consonants = ['b','c','d','f','g','h','j','k','l','m','n','p','q','r','s','t','v','w','x','z']
    const planetColors = [
        [[0,1,0], [0,0,1]],
        [[1,0,1], [0,0,1]],
        [[0,0,1], [0,1,1]],
        [[0,1,1], [1,0,1]],
        [[1,1,0], [1,0,1]],
    ]

    function makePlanet(isSun = false) {
        let [col1, col2] = isSun ? [[1,0,0],[1,1,0]] :
            planetColors[Math.floor(Math.random()*planetColors.length)]
        return {
            name: isSun ? vowels[Math.floor(Math.random()*vowels.length)] + consonants[Math.floor(Math.random()*consonants.length)] + consonants[Math.floor(Math.random()*consonants.length)] + vowels[Math.floor(Math.random()*vowels.length)] + consonants[Math.floor(Math.random()*consonants.length)] : consonants[Math.floor(Math.random()*consonants.length)] + vowels[Math.floor(Math.random()*vowels.length)] + consonants[Math.floor(Math.random()*consonants.length)] + consonants[Math.floor(Math.random()*consonants.length)] + vowels[Math.floor(Math.random()*vowels.length)] + consonants[Math.floor(Math.random()*consonants.length)],
            type: 'planet',
            p: {
                x: -3000 + Math.random()*6000,
                y: -1000 + Math.random()*2000,
                z: -3000 + Math.random()*6000,
            },
            radius: isSun ? 15000 + Math.random()*15000: 5000 + Math.random()*5000,
            col1,
            col2,
            isSun,
        }
    }

    const entities = [
        { p: {x:5,y:0,z:5}, type: 'teapot' },
        makePlanet(true),
        ...Array.from({ length: 20 }, _ => makePlanet())
    ]

    const ui = {
        renderPoints: document.querySelector('#renderPoints'),
        renderTriangles: document.querySelector('#renderTriangles'),
        renderWireframe: document.querySelector('#renderWireframe'),
        game: document.querySelector('#spacesim'),
    }

    // Create FPS display if it doesn't exist (helpful for DevTools shadowing)
    function makeDiv(id, top = 10, left = 10) {
        const div = document.createElement('div');
        div.id = id;
        div.style.position = 'absolute';
        div.style.top = top+'px';
        div.style.left = left+'px';
        div.style.color = 'lime';
        div.style.fontFamily = 'monospace';
        document.body.appendChild(div);
        return div
    }
    
    if (!ui.fpsDisplay) {
        ui.fpsDisplay = makeDiv('fps');
    }

    if (!ui.cameraPos) {
        ui.cameraPos = makeDiv('camera_pos', 28)
    }
    
    // 1. Create the container (the outline)
    if (!ui.speedContainer) {
        ui.speedContainer = makeDiv('speed-container', 300, 10); // Placed below FPS
        ui.speedContainer.style.width = '200px';
        ui.speedContainer.style.height = '20px';
        ui.speedContainer.style.border = '1px solid lime';
        ui.speedContainer.style.padding = '2px';

        // 2. Create the inner fill
        ui.speedBar = document.createElement('div');
        ui.speedBar.style.height = '100%';
        ui.speedBar.style.width = '0%'; // Starts at zero
        ui.speedBar.style.backgroundColor = 'lime';
        ui.speedContainer.appendChild(ui.speedBar);    
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
    ui.game.width = 800
    ui.game.height = 600

    window.addEventListener("keydown", (e) => {
        keys[e.key] = true
    })

    window.addEventListener("keyup", (e) => {
        keys[e.key] = false
    })

    const { renderFrame } = initRender(ui.game, camera, meshes)
    let lastTime = performance.now()
    let frameCount = 0;


    function loop(currentTime) {
        
        const dt = (currentTime - lastTime) / 1000
        lastTime = currentTime
        camera.forwardThrust = camera.forwardThrust <= 0 ? 0 : camera.forwardThrust - dt*Math.sqrt(camera.velocity)/10
        camera.backwardThrust = camera.backwardThrust <= 0 ? 0 : camera.backwardThrust - dt*Math.sqrt(camera.velocity)/10
        camera.leftThrust = camera.leftThrust <= 0 ? 0 : camera.leftThrust - dt*Math.sqrt(camera.velocity)/10
        camera.rightThrust = camera.rightThrust <= 0 ? 0 : camera.rightThrust - dt*Math.sqrt(camera.velocity)/10
        meshes.teapot.vs = meshes.teapot.vs.map(v => M3(v).rot_xz(dt/4).val())

        if (keys["w"]) {
            camera.forwardThrust = camera.forwardThrust >= camera.maxThrust ? camera.maxThrust : camera.forwardThrust + dt * camera.velocity
        }
        if (keys["s"]) {
            camera.backwardThrust = camera.backwardThrust >= camera.maxThrust ? camera.maxThrust : camera.backwardThrust + dt * camera.velocity
        }
        if (keys["a"]) {
            camera.leftThrust = camera.leftThrust >= camera.maxThrust ? camera.maxThrust : camera.leftThrust + dt * camera.velocity
        }
        if (keys["d"]) {
            camera.rightThrust = camera.rightThrust >= camera.maxThrust ? camera.maxThrust : camera.rightThrust + dt * camera.velocity
        }
        camera.x += Math.sin(camera.yaw) * camera.forwardThrust - Math.sin(camera.yaw) * camera.backwardThrust - Math.cos(camera.yaw) * camera.leftThrust + Math.cos(camera.yaw) * camera.rightThrust
        camera.y += Math.sin(camera.pitch) * camera.forwardThrust - Math.sin(camera.pitch) * camera.backwardThrust
        camera.z += Math.cos(camera.yaw) * camera.forwardThrust - Math.cos(camera.yaw) * camera.backwardThrust + Math.sin(camera.yaw) * camera.leftThrust - Math.sin(camera.yaw) * camera.rightThrust

        if (keys["e"]) {
            camera.roll += Math.PI*dt/2 * 0.3
        }
        if (keys["q"]) {
            camera.roll -= Math.PI*dt/2 * 0.3
        }
        if (keys["z"]) {
            camera.y -= dt
        }
        if (keys["x"]) {
            camera.y += dt;
        }
        if (keys["ArrowLeft"]) {
            camera.yaw -= Math.cos(camera.roll) * Math.PI*dt/2 * 0.3
            camera.pitch += Math.sin(camera.roll) * Math.PI*dt/2 * 0.3
            
        }
        if (keys["ArrowRight"]) {
            camera.yaw += Math.cos(camera.roll) * Math.PI*dt/2 * 0.3
            camera.pitch -= Math.sin(camera.roll) * Math.PI*dt/2 * 0.3
        }
        if (keys["ArrowUp"]) {
            camera.yaw += Math.sin(camera.roll) * Math.PI*dt/2 * 0.6
            camera.pitch += Math.cos(camera.roll) * Math.PI*dt/2 * 0.6
        }
        if (keys["ArrowDown"]) {
            camera.yaw -= Math.sin(camera.roll) * Math.PI*dt/2 * 0.6
            camera.pitch -= Math.cos(camera.roll) * Math.PI*dt/2 * 0.6
        }
        if (keys["r"]) {
            camera.roll -= (0.4*dt*Math.sign(camera.roll))
            
            
        }
        if (keys["t"]) {
            camera.pitch -= (0.4*dt*Math.sign(camera.pitch))
        }
        // --- FPS Calculation ---
        frameCount++;
        if (frameCount % 30 === 0) { // Update every 10 frames
            ui.fpsDisplay.innerText = `FPS: ${Math.round(1 / dt)}`;
            ui.cameraPos.innerText = `seconds per frame: ${dt.toFixed(4)}\nCamera Pos:\n${Object.entries(window.designer.camera).map(([k,v]) => `${k}: ${v.toFixed(2)}`).join('\n')}`;
            const pct = Math.min(Math.max(Math.max(...[camera.forwardThrust,camera.backwardThrust,camera.leftThrust,camera.rightThrust]) / camera.maxThrust * 100, 0), 100);

            ui.speedBar.style.width = pct + '%';
        }

        renderFrame(entities, dt, frameCount)

        requestAnimationFrame(loop)
    }

    requestAnimationFrame(loop)
})