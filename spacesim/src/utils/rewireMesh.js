import { M3 } from "../math/matrix.js"

export function rewireMesh({vs, fs}) {
    const wiredfs = fs.map(([ai,bi,ci,col]) => {
        const a = vs[ai]
        const b = vs[bi]
        const c = vs[ci]
        const ab = M3(b).sub(a).val()
        const ac = M3(c).sub(a).val()
        return [ai,ci,bi,col]
    
        if (M3(ab).cross(ac).dot(a) < 0) {
            return [ai,ci,bi,col] // flip
        }
        return [ai,bi,ci,col]
    })
    return {vs, fs: wiredfs}
}