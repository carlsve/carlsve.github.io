
function cross(u, v) {
    return {
        x: u.y*v.z - u.z*v.y,
        y: u.z*v.x - u.x*v.z,
        z: u.x*v.y - u.y*v.x
    }
}

function add(a,b) {
    return {
        x: a.x-b.x,
        y: a.y-b.y,
        z: a.z-b.z
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


export const M3 = (v) => {
  return {
    val: () => v,
    dot: b => dot(v, b),
    add: b => M3(add(v, b)),
    sub: b => M3(sub(v, b)),
    cross: b => M3(cross(v, b)),
  };
}