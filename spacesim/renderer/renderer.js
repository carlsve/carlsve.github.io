document.addEventListener('DOMContentLoaded', () => {
    const BACKGROUND = '#000000'
    const FOREGROUND = '#00FF00'
    const game = document.querySelector('#spacesim')
    game.width = 800
    game.height = 800
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
            x: (p.x + 1)/2*game.width,
            y: (1 -(p.y + 1)/2)*game.height,
        }
    }

    function project({x,y,z}) {
        return {
            x: x/z,
            y: y/z,
        }
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
    }

    function cameraTransform(v) {
        let x = v.x - camera.x
        let y = v.y - camera.y
        let z = v.z - camera.z

        let c = Math.cos(camera.yaw)
        let s = Math.sin(camera.yaw)

        let dx = x*c - z*s
        let dz = x*s + z*c

        return { x: dx, y: y, z: dz }
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
            camera.x += Math.cos(camera.yaw) * dt;
            camera.z -= Math.sin(camera.yaw) * dt;
        }
        if (keys["ArrowLeft"])  camera.yaw -= Math.PI*2*dt
        if (keys["ArrowRight"]) camera.yaw += Math.PI*2*dt

        angle += Math.PI*dt
        // dz += 1*dt*Math.sin(angle)
        clear()
        // for (const v of vs) {
        //     point(screen(project(translate_z(rotate_xz(v, angle), dz))))
        // }
        for (const f of fs) {
            for (let i = 0; i < f.length; ++i) {
                const a = vs[f[i]]
                const b = vs[f[(i+1)%f.length]]
                line(
                    screen(project(cameraTransform(translate_z(rotate_xz(a, angle), dz)))),
                    screen(project(cameraTransform(translate_z(rotate_xz(b, angle), dz)))),
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