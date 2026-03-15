
function cross(u, v) {
    return {
        x: u.y*v.z - u.z*v.y,
        y: u.z*v.x - u.x*v.z,
        z: u.x*v.y - u.y*v.x
    }
}

function add(a,b) {
    return {
        x: a.x+b.x,
        y: a.y+b.y,
        z: a.z+b.z
    }
}

function sub(a,b) {
    return {
        x: a.x-b.x,
        y: a.y-b.y,
        z: a.z-b.z
    }
}

function dot(a,b) {
    return a.x*b.x + a.y*b.y + a.z*b.z
}

function rotate_xz(v, angle) {
    const c = Math.cos(angle)
    const s = Math.sin(angle)
    return {
        x: v.x*c - v.z*s,
        y: v.y,
        z: v.x*s + v.z*c,
    }
}

function rotate_xy(v, angle) {
    const c = Math.cos(angle)
    const s = Math.sin(angle)
    return {
        x: v.x*c - v.y*s,
        y: v.x*s + v.y*c,
        z: v.z,
    }
}

function rotate_yz(v, angle) {
    const c = Math.cos(angle)
    const s = Math.sin(angle)
    return {
        x: v.x,
        y: v.y*c - v.z*s,
        z: v.y*s + v.z*c,
    }
}

export const M3 = (v) => {
  return {
    val: () => v,
    dot: b => dot(v, b),
    add: b => M3(add(v, b)),
    sub: b => M3(sub(v, b)),
    cross: b => M3(cross(v, b)),
    rot_xy: angle => M3(rotate_xy(v, angle)),
    rot_xz: angle => M3(rotate_xz(v, angle)),
    rot_yz: angle => M3(rotate_yz(v, angle)),
  };
}