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
        maxThrust: 20,
        velocity: 5,
        forward: { s: 0, maxS: 20, v: 5, a: 1 },
        side:    { s: 0, maxS: 10, v: 3, a: 1 },
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
        [[0,255,0], [0,0,255]],
        [[255,0,255], [0,0,255]],
        [[0,0,255], [0,255,255]],
        [[0,255,255], [255,0,255]],
        [[255,255,0], [255,0,255]],
    ]

    function makePlanet(isSun = false) {
        let [col1, col2] = isSun ? [[255,0,0],[255,255,0]] :
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

    function makeNPC() {
        return {
            type: 'ship',
            p: {
                x: -30 + Math.random()*60,
                y: -10 + Math.random()*20,
                z: -30 + Math.random()*60,
            },
            yaw:   Math.random() * Math.PI * 2,
            pitch: 0,
            roll:  0,
            forward: { s: 0, maxS: 20, v: 10 },
            goalIdx:   null,
            waitTimer: Math.random() * 3, // stagger initial departures
        }
    }

    const entities = [
        { p: {x:5,y:0,z:5}, type: 'teapot' },
        makePlanet(true),
        ...Array.from({ length: 20 }, _ => makePlanet()),
        ...Array.from({ length: 400 }, _ => makeNPC()),
    ]
    const planets = entities.filter(e => e.type === 'planet')

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
    
    // Laser cooldown bar
    if (!ui.laserCooldownContainer) {
        ui.laserCooldownContainer = makeDiv('laser-cooldown-container', 500, 10);
        ui.laserCooldownContainer.style.width = '200px';
        ui.laserCooldownContainer.style.height = '20px';
        ui.laserCooldownContainer.style.border = '1px solid red';
        ui.laserCooldownContainer.style.padding = '2px';

        ui.laserCooldownBar = document.createElement('div');
        ui.laserCooldownBar.style.height = '100%';
        ui.laserCooldownBar.style.width = '100%';
        ui.laserCooldownBar.style.backgroundColor = 'red';
        ui.laserCooldownContainer.appendChild(ui.laserCooldownBar);
    }

    // 1. Create the container (the outline)
    if (!ui.speedContainer) {
        ui.speedContainer = makeDiv('speed-container', 450, 10); // Placed below FPS
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

    const lasers = []
    window.designer.lasers = lasers
    const LASER_COOLDOWN = 1.0;
    let laserCooldown = 0;
    const { renderFrame } = initRender(ui.game, camera, meshes)
    let lastTime = performance.now()
    let frameCount = 0;


    function updateNPCs(dt) {
        if (planets.length === 0) return;
        for (const npc of entities) {
            if (npc.type !== 'ship') continue;

            // Lazy goal assignment
            if (npc.goalIdx === null) {
                npc.goalIdx = Math.floor(Math.random() * planets.length);
            }

            // Waiting at destination
            if (npc.waitTimer > 0) {
                npc.waitTimer -= dt;
                npc.forward.s = Math.max(0, npc.forward.s - npc.forward.v * dt);
                continue;
            }

            const goal = planets[npc.goalIdx];
            const dx = goal.p.x - npc.p.x;
            const dy = goal.p.y - npc.p.y;
            const dz = goal.p.z - npc.p.z;
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

            // Arrival check
            if (dist < 500) {
                npc.waitTimer = 3 + Math.random() * 5;
                let next;
                do { next = Math.floor(Math.random() * planets.length); }
                while (planets.length > 1 && next === npc.goalIdx);
                npc.goalIdx = next;
                continue;
            }

            // Steer toward goal — same yaw/pitch convention as camera movement
            const targetYaw = Math.atan2(dx, dz);
            const targetPitch = Math.atan2(dy, Math.sqrt(dx*dx + dz*dz));
            const TURN_RATE = Math.PI * 0.8 * dt;

            let dyaw = ((targetYaw - npc.yaw) % (Math.PI*2) + Math.PI*3) % (Math.PI*2) - Math.PI;
            npc.yaw += Math.sign(dyaw) * Math.min(Math.abs(dyaw), TURN_RATE);

            let dpitch = ((targetPitch - npc.pitch) % (Math.PI*2) + Math.PI*3) % (Math.PI*2) - Math.PI;
            npc.pitch += Math.sign(dpitch) * Math.min(Math.abs(dpitch), TURN_RATE);

            // Accelerate up to maxS
            npc.forward.s = Math.min(npc.forward.maxS, npc.forward.s + npc.forward.v * dt);

            // Move — same formula as player
            npc.p.x += Math.sin(npc.yaw)   * npc.forward.s * dt;
            npc.p.y += Math.sin(npc.pitch)  * npc.forward.s * dt;
            npc.p.z += Math.cos(npc.yaw)    * npc.forward.s * dt;
        }
    }

    function fireLaser(camera) {
        const dir = {
            x: Math.sin(camera.yaw) * Math.cos(camera.pitch),
            y: Math.sin(camera.pitch),
            z: Math.cos(camera.yaw) * Math.cos(camera.pitch)
        };

        // Right vector perpendicular to the forward direction (in the yaw plane)
        const right = {
            x: Math.cos(camera.yaw),
            y: 0,
            z: -Math.sin(camera.yaw)
        };

        const GUN_OFFSET = 0.3;
        const GUN_DROP = 0.2;

        const p1 = {
            x: camera.x - right.x * GUN_OFFSET,
            y: camera.y - GUN_DROP,
            z: camera.z - right.z * GUN_OFFSET,
        }
        const p2 = {
            x: camera.x + right.x * GUN_OFFSET,
            y: camera.y - GUN_DROP,
            z: camera.z + right.z * GUN_OFFSET,
        }

        // Left lower gun
        lasers.push({ p: p1, v: dir, speed: 200, life: 1.0 });
        lasers.push({ p: p2, v: dir, speed: 200, life: 1.0 });

        console.log(lasers)
    }

    function loop(currentTime) {
        
        const dt = (currentTime - lastTime) / 1000
        lastTime = currentTime

        // dampen
        camera.forward.s -= Math.sign(camera.forward.s) * dt * Math.sqrt(camera.forward.v)/10
        camera.side.s -= Math.sign(camera.side.s) * dt * Math.sqrt(camera.side.v)/10
        if (Math.abs(camera.forward.s) < 0.01) {
            camera.forward.s = 0
        }
        if (Math.abs(camera.side.s) < 0.01) {
            camera.side.s = 0
        }

        meshes.teapot.vs = meshes.teapot.vs.map(v => M3(v).rot_xz(dt/4).val())

        if (keys["w"]) {
            camera.forward.s = camera.forward.s >= camera.forward.maxS ? camera.forward.maxS : camera.forward.s + dt * camera.forward.v
        }
        if (keys["s"]) {
            camera.forward.s = camera.forward.s <= -camera.forward.maxS ? -camera.forward.maxS : camera.forward.s - dt * camera.forward.v
        }
        if (keys["a"]) {
            camera.side.s = camera.side.s >= camera.side.maxS ? camera.side.maxS : camera.side.s + dt * camera.side.v
        }
        if (keys["d"]) {
            camera.side.s = camera.side.s <= -camera.side.maxS ? -camera.side.maxS : camera.side.s - dt * camera.side.v
        }
        if (keys["f"]) {
            camera.forward.s -= Math.sign(camera.forward.s) * dt * Math.sqrt(camera.forward.v)
            camera.side.s -= Math.sign(camera.side.s) * dt * Math.sqrt(camera.side.v)
        }
        camera.x += (Math.sin(camera.yaw) * camera.forward.s - Math.cos(camera.yaw) * camera.side.s) * dt
        camera.y += (Math.sin(camera.pitch) * camera.forward.s) * dt
        camera.z += (Math.cos(camera.yaw) * camera.forward.s + Math.sin(camera.yaw) * camera.side.s) * dt
        laserCooldown = Math.max(0, laserCooldown - dt);
        if (keys[" "] && laserCooldown === 0) {
            fireLaser(camera);
            laserCooldown = LASER_COOLDOWN;
        }
        ui.laserCooldownBar.style.width = ((1 - laserCooldown / LASER_COOLDOWN) * 100) + '%';
        ui.laserCooldownBar.style.backgroundColor = laserCooldown === 0 ? 'red' : 'darkred';
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
            ui.cameraPos.innerText = `seconds per frame: ${dt.toFixed(4)}\nCamera Pos:\n${JSON.stringify(camera, null, 2)}`;
            const pct = Math.min(Math.max(Math.sign(camera.forward.s) * camera.forward.s / camera.forward.maxS * 100, 0), 100);

            ui.speedBar.style.width = pct + '%';
        }
            // Update Lasers
        for (let i = lasers.length - 1; i >= 0; i--) {
            const l = lasers[i];
            l.life -= dt;
            
            // Move laser: Position = Position + (Direction * Speed * dt)
            l.p.x += l.v.x * l.speed * dt;
            l.p.y += l.v.y * l.speed * dt;
            l.p.z += l.v.z * l.speed * dt;

            if (l.life <= 0) lasers.splice(i, 1);
        }

        updateNPCs(dt)
        renderFrame(entities, dt, frameCount, lasers)

        requestAnimationFrame(loop)
    }

    requestAnimationFrame(loop)
})