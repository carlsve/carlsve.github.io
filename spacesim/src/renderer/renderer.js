import { M3 } from "../math/matrix.js"

export function initRender(game, camera, meshes) {
    const BACKGROUND = '#000000'
    const FOREGROUND = '#00FF00'
    const ASPECT = game.width / game.height
    const ctx = game.getContext('2d')

    // --- Starfield Initialization (Infinite Sphere) ---
    const STAR_COUNT = 1500;
    const stars = Array.from({ length: STAR_COUNT }, () => {
        // Place stars on a giant sphere around the origin
        const theta = Math.random() * Math.PI * 2; // Horizontal angle
        const phi = Math.acos((Math.random() * 2) - 1); // Vertical angle
        const r = 1000; // Fixed distance (arbitrary)

        return {
            x: r * Math.sin(phi) * Math.cos(theta),
            y: r * Math.sin(phi) * Math.sin(theta),
            z: r * Math.cos(phi),
            seed: Math.random() * 10
        };
    });

    function clear() {
        ctx.fillStyle = BACKGROUND
        ctx.fillRect(0, 0, game.width, game.height)
    }

    function renderStars() {
        // Note: Stars ignore camera translation (x,y,z) to appear infinitely far
        for (let star of stars) {
            const p = M3(star)
                .rot_xz(camera.yaw)
                .rot_yz(camera.pitch)
                .rot_xy(camera.roll)
                .val();

            if (p.z <= 0) continue;

            const { x, y } = project_screen(p);

            if (x >= 0 && x <= game.width && y >= 0 && y <= game.height) {
                // Subtle twinkle using global time and local seed
                const twinkle = 0.6 + Math.sin(time * 3 + star.seed) * 0.4;
                const val = Math.floor(255 * twinkle);
                
                ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
                // Smaller 1x1 rects for "infinite" feel
                ctx.fillRect(x, y, 1, 1);
            }
        }
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

    function circle(p, radius, depth, col, name) {
        let r = Math.abs(radius / depth)

        const { x, y } = project_screen(cameraTransform(p))
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.fill();
        ctx.closePath();
        ctx.lineWidth = 1


        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.font = "14px monospace"
        const distance = M3(p).dist(camera)
        const fullName = name.toUpperCase() + ': ' + distance.toFixed(1)

        const tbox = ctx.measureText(fullName)
    
        
        if (distance < 2000) {
            r = r * 1.2
            ctx.strokeStyle = FOREGROUND
            ctx.strokeRect(x - r, y - r, r * 2, r * 2)
    
            ctx.fillStyle = BACKGROUND
            ctx.fillRect(x - r - tbox.width * 1.2, y - r, tbox.width * 1.2, 14 * 1.2);
            ctx.strokeRect(x - r - tbox.width * 1.2, y - r, tbox.width * 1.2, 14 * 1.2)
            
            ctx.fillStyle = FOREGROUND
            ctx.fillText(fullName, x + tbox.width * 1.2 / 2 - r - tbox.width * 1.2, y + (16 * 1.2) / 2 - r)
        }
    }

    function project_screen(p) {
        return {
            x: ((p.x / p.z) / ASPECT + 1) / 2 * game.width,
            y: (1 - ((p.y / p.z) + 1) / 2) * game.height,
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

    function backface(a, b, c) {
        const ab = M3(b).sub(a).val()
        const ac = M3(c).sub(a).val()
        return M3(ab).cross(ac).dot(a) > 0
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
        if (inside.length === 3) return [[a, b, c]]
        if (inside.length === 1) {
            const A = inside[0]; const B = outside[0]; const C = outside[1]
            const AB = intersectNear(A, B, NEAR); const AC = intersectNear(A, C, NEAR)
            return [[A, AB, AC]]
        }
        if (inside.length === 2) {
            const A = inside[0]; const B = inside[1]; const C = outside[0]
            const AC = intersectNear(A, C, NEAR); const BC = intersectNear(B, C, NEAR)
            return [[A, B, BC], [A, BC, AC]]
        }
    }

    function wireframe(p1, p2, p3) {
        ctx.lineWidth = 1
        ctx.strokeStyle = FOREGROUND
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.lineTo(p3.x, p3.y)
        ctx.closePath()
        ctx.stroke()
    }

    let time = 0

    function renderFrame(entities, dt, playerStats = { thrust: 0, maxSpeed: 100 }) {
        time += dt
        clear()

        // 1. Draw Background Stars (Rotation only)
        renderStars();

        // 2. Process Entities (Rotation + Translation)
        entities.forEach(e => {
            e.depth = cameraTransform(e.p).z
        })
        entities.sort((a, b) => b.depth - a.depth)

        for (const e of entities) {
            if (e.type === 'planet') {
                if (e.depth <= 0) continue;
                const t_ = (Math.sin(time) + 1) / 2
                const [r, g, b] = e.col1.map((c1, i) => Math.floor(255 * (((1 - t_) * c1) + t_ * e.col2[i])))
                circle(e.p, e.radius, e.depth, `rgb(${r},${g},${b})`, e.name)
                continue
            }

            if (e.depth > 1000 || e.depth <= 0) continue;
            
            const { vs, fs } = meshes[e.type]
            let tvs = vs.map(v => cameraTransform(M3(v).add(e.p).val()))
            const tris = []

            for (const t of fs) {
                const t1 = tvs[t[0]]; const t2 = tvs[t[1]]; const t3 = tvs[t[2]];
                if (backface(t1, t2, t3)) continue

                const clipped = clipTriangleNear(t1, t2, t3, 0.1)
                for (const [c1, c2, c3] of clipped) {
                    tris.push({
                        p1: project_screen(c1),
                        p2: project_screen(c2),
                        p3: project_screen(c3),
                        col: t[3],
                        depth: (c1.z + c2.z + c3.z) / 3
                    })
                }
            }

            tris.sort((a, b) => b.depth - a.depth)
            for (const t of tris) {
                if (window.designer.settings.renderTriangles) triangle(t.p1, t.p2, t.p3, t.col)
                if (window.designer.settings.renderWireframe) wireframe(t.p1, t.p2, t.p3)
            }
        }        
    }

    return { renderFrame }
}