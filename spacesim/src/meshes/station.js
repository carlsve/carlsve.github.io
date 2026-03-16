import { rewireMesh } from "../utils/rewireMesh.js"

function makeCylinder(segments, radius, height) {
    const vs = []
    const fs = []

    const half = height / 2

    // top ring
    for (let i = 0; i < segments; i++) {
        const a = i * Math.PI * 2 / segments
        vs.push({
            x: Math.cos(a) * radius,
            y: half,
            z: Math.sin(a) * radius
        })
    }

    // bottom ring
    for (let i = 0; i < segments; i++) {
        const a = i * Math.PI * 2 / segments
        vs.push({
            x: Math.cos(a) * radius,
            y: -half,
            z: Math.sin(a) * radius
        })
    }

    const topCenter = vs.length
    vs.push({x:0,y:half,z:0})

    const bottomCenter = vs.length
    vs.push({x:0,y:-half,z:0})

    for (let i = 0; i < segments; i++) {
        const next = (i+1)%segments

        const topA = i
        const topB = next
        const botA = i + segments
        const botB = next + segments

        // top cap
        fs.push([topCenter, topA, topB, '#aaa'])

        // bottom cap
        fs.push([bottomCenter, botB, botA, '#888'])

        // side
        fs.push([topA, botA, botB, '#ccc'])
        fs.push([topA, botB, topB, '#ccc'])
    }

    return {vs, fs}
}

export const station = rewireMesh(makeCylinder(6, 0.2, 0.8))