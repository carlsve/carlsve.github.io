import { M3 } from "../math/matrix.js"

export function initRender(game, camera, meshes) {
    const BACKGROUND = '#000000'
    const FOREGROUND = '#00FF00'
    const ASPECT = game.width / game.height
    const ctx = game.getContext('2d')
    function clear() {
        ctx.fillStyle = BACKGROUND
        ctx.fillRect(0,0,game.width,game.height)
    }
    
    function point({x, y}, i) {
        const s = 20
        ctx.fillStyle = FOREGROUND
        ctx.fillRect(x - s/2, y - s/2, s, s)

        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.font = "14px monospace"
        ctx.fillStyle = BACKGROUND
        ctx.fillText(i.toString(), x, y)
    }
    
    function triangle(p1, p2, p3, col) {
        ctx.fillStyle = col
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.lineTo(p3.x, p3.y)
        ctx.closePath()
        ctx.fill()
    }

    function wireframe(p1, p2, p3) {
        ctx.lineWidth = 3
        ctx.strokeStyle = FOREGROUND
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.lineTo(p3.x, p3.y)
        ctx.closePath()
        ctx.stroke()
    }
    
    function screen(p) {
        return {
            x: (p.x / ASPECT + 1)/2*game.width,
            y: (1 - (p.y + 1)/2)*game.height,
        }
    }
    
    function project({x,y,z}) {
        return {
            x: x/z,
            y: y/z,
        }
    }
    
    function intersectNear(a, b, NEAR) {
        const t = (NEAR - a.z) / (b.z - a.z)
    
        return {
            x: a.x + t * (b.x - a.x),
            y: a.y + t * (b.y - a.y),
            z: NEAR
        }
    }
    
    function clipTriangleNear(a, b, c, NEAR) {
        const inside = [a, b, c].filter(v => v.z > NEAR)
        const outside = [a, b, c].filter(v => v.z <= NEAR)
    
        if (inside.length === 0) return []
    
        if (inside.length === 3)
            return [[a, b, c]]
    
        if (inside.length === 1) {
            const A = inside[0]
            const B = outside[0]
            const C = outside[1]
    
            const AB = intersectNear(A, B, NEAR)
            const AC = intersectNear(A, C, NEAR)
    
            return [[A, AB, AC]]
        }
    
        if (inside.length === 2) {
            const A = inside[0]
            const B = inside[1]
            const C = outside[0]
    
            const AC = intersectNear(A, C, NEAR)
            const BC = intersectNear(B, C, NEAR)
    
            return [
                [A, B, BC],
                [A, BC, AC]
            ]
        }
    }

    function cameraTransform(v) {
        return M3(v)
            .sub(camera)
            .rot_xz(camera.yaw)
            .rot_yz(camera.pitch)
            .rot_xy(camera.roll)
            .val()
    }

    function backface(a,b,c) {
        const ab = M3(b).sub(a).val()
        const ac = M3(c).sub(a).val()
    
        return M3(ab).cross(ac).dot(a) > 0
    }

    function renderFrame(entities) {    
        clear()

        entities.forEach(e => {
            e.depth = cameraTransform(e.p).z
        })
        entities.sort((a, b) => b.depth - a.depth)
        for (const {p, type} of entities) {
            const {vs, fs} = meshes[type]

            let tvs = vs.map(v => cameraTransform(M3(v).add(p).val()))

            const tris = []
            for (const t of fs) {
                const t1 = tvs[t[0]]
                const t2 = tvs[t[1]]
                const t3 = tvs[t[2]]

                if (backface(t1, t2, t3)) continue

                const clipped = clipTriangleNear(t1, t2, t3, 0.1)
                if (!clipped) continue
                for (const [c1, c2, c3] of clipped) {
                    const depth = (c1.z + c2.z + c3.z) / 3
                    tris.push({
                        p1: screen(project(c1)),
                        p2: screen(project(c2)),
                        p3: screen(project(c3)),
                        col: t[3],
                        depth
                    })
                }
            }

            tris.sort((a, b) => b.depth - a.depth)
            for (const t of tris) {                
                if (window.designer.settings.renderTriangles) {
                    triangle(t.p1, t.p2, t.p3, t.col)
                }
                if (window.designer.settings.renderWireframe) {
                    wireframe(t.p1, t.p2, t.p3, t.col)
                }

            }

            if (window.designer.settings.renderPoints) {
                for (let i = 0; i < tvs.length; ++i) {
                    const c = tvs[i]
                    if (c.z <= 0) continue
                    point(screen(project(c)), i)
                }
            }
        }

    }

    return { renderFrame }
}
