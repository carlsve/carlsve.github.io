document.addEventListener('DOMContentLoaded', () => {
    const BACKGROUND = '#000000'
    const FOREGROUND = '#00FF00'
    const game = document.querySelector('#spacesim')
    game.width = 640
    game.height = 480
    const ASPECT = game.width / game.height
    const ctx = game.getContext('2d')
    function clear() {
        ctx.fillStyle = BACKGROUND
        ctx.fillRect(0,0,game.width,game.height)
    }

    function point({x, y}) {
        const s = 20
        ctx.fillStyle = FOREGROUND
        ctx.fillRect(x - s/2, y - s/2, s, s)
    }

    function line(p1, p2) {
        ctx.lineWidth = 3
        ctx.strokeStyle = FOREGROUND
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.stroke()
    }

    function screen(p) {
        return {
            x: (p.x / ASPECT + 1)/2*game.width,
            y: (1 -(p.y + 1)/2)*game.height,
        }
    }

    function project({x,y,z}) {
        return {
            x: x/z,
            y: y/z,
        }
    }

    function clipLineNear(v1, v2, NEAR = 0.1) {
        const z1 = v1.z
        const z2 = v2.z

        // both points behind camera → discard
        if (z1 <= NEAR && z2 <= NEAR) return null;

        // both points in front → keep line
        if (z1 > NEAR && z2 > NEAR) return [v1, v2];

        // one point behind → clip
        const t = (NEAR - z1) / (z2 - z1); // interpolation factor
        const clipPoint = {
            x: v1.x + t * (v2.x - v1.x),
            y: v1.y + t * (v2.y - v1.y),
            z: NEAR
        };

        if (z1 < NEAR) return [clipPoint, v2]; // v1 clipped
        else return [v1, clipPoint];           // v2 clipped
    }

    function translate_z({x, y, z}, dz) {
        return {x, y, z: z + dz}
    }

    function rotate_xz({x, y, z}, angle) {
        const s = Math.sin(angle)
        const c = Math.cos(angle)
        return {
            x: x*c - z*s,
            y,
            z: x*s + z*c,
        }
    }

    const keys = {}
    const camera = {
        x: 0,
        y: 0,
        z: 0,
        yaw: 0,
        pitch: 0,
        roll: 0
    }

    function cameraTransform(v) {
        let x = v.x - camera.x
        let y = v.y - camera.y
        let z = v.z - camera.z

        let yc = Math.cos(camera.yaw)
        let ys = Math.sin(camera.yaw)

        let x1 = x*yc - z*ys
        let y1 = y
        let z1 = x*ys + z*yc

        let pc = Math.cos(camera.pitch)
        let ps = Math.sin(camera.pitch)

        let x2 = x1
        let y2 = y1*pc - z1*ps
        let z2 = y1*ps + z1*pc

        let rc = Math.cos(camera.roll)
        let rs = Math.sin(camera.roll)

        let x3 = x2*rc - y2*rs
        let y3 = x2*rs + y2*rc
        let z3 = z2

        return { x: x3, y: y3, z: z3 }
    }
    const vs = [
        {x: -0.25, y:  0.25, z:  0.25},
        {x:  0.25, y:  0.25, z:  0.25},
        {x:  0.25, y: -0.25, z:  0.25},
        {x: -0.25, y: -0.25, z:  0.25},

        {x: -0.25, y:  0.25, z: -0.25},
        {x:  0.25, y:  0.25, z: -0.25},
        {x:  0.25, y: -0.25, z: -0.25},
        {x: -0.25, y: -0.25, z: -0.25},
    ]

    const fs = [
        [0, 1, 2, 3],
        [4, 5, 6, 7],
        [0, 4],
        [1, 5],
        [2, 6],
        [3, 7],
    ]

    const FPS = 60
    let dz = 1
    let angle = 0

    function frame() {
        const dt = 1/FPS
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

        let tvs = vs.map(v => cameraTransform(translate_z(v, 1)))

        // angle += Math.PI*dt
        // dz += 1*dt*Math.sin(angle)
        clear()
        // for (const v of vs) {
        //     point(screen(project(translate_z(rotate_xz(v, angle), dz))))
        // }
        for (const f of fs) {
            for (let i = 0; i < f.length; ++i) {
                const a = tvs[f[i]]
                const b = tvs[f[(i+1)%f.length]]

                const clipped = clipLineNear(a, b, 0.1)
                if (!clipped) continue
                const [c1, c2] = clipped

                line(
                    screen(project(c1)),
                    screen(project(c2))
                )

            }
        }

        window.setTimeout(frame, 1000/FPS)
    }

    window.addEventListener("keydown", (e) => {
        keys[e.key] = true
    })

    window.addEventListener("keyup", (e) => {
        keys[e.key] = false
    })

    window.setTimeout(frame, 1000/FPS)
})