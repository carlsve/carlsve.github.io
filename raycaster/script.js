/* Raycaster, Carl Petter Svensson */

var gridSize  = 16
    mapWidth  = 20
    mapHeight = 15

// set size
// html canvas interaction stuff.
var c = document.getElementById("minimap");
c.width = mapWidth * gridSize
c.height = mapHeight * gridSize
var ctx = c.getContext("2d");

var player = {
    pos: {x:2 * gridSize,y:5 * gridSize},
    color: 'rgb(160,160,160)',
    dir: 0.0
}

var map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,1,0,0,1,1,1,1,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
]


// for keyboard, we have an object with all relevant keys.
// values are 0 (not pressed) or 1 (pressed).
// This separates the code responsible for checking keyboard events
// from the code responsible for moving the player,
var keyboard = {
    arrowDown:  0,
    arrowUp:    0,
    arrowLeft:  0,
    arrowRight: 0
}

document.addEventListener('keydown', function(event) {
    var key = (event || window.event).keyCode

    if      (key == 37) { keyboard.arrowLeft  = 1; }
    else if (key == 38) { keyboard.arrowUp    = 1; }
    else if (key == 39) { keyboard.arrowRight = 1; }
    else if (key == 40) { keyboard.arrowDown  = 1; }
})

document.addEventListener('keyup', function(event) {
    var key = (event || window.event).keyCode

    if      (key == 37) { keyboard.arrowLeft  = 0; }
    else if (key == 38) { keyboard.arrowUp    = 0; }
    else if (key == 39) { keyboard.arrowRight = 0; }
    else if (key == 40) { keyboard.arrowDown  = 0; }
})

// Draws block if map[y][x] == 1
function drawMap() {
    ctx.fillStyle = 'rgb(200,200,200)'
    for (var y = 0; y < mapHeight; ++y) {
        for (var x = 0; x < mapWidth; ++x) {
            if (map[y][x]) {
                ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize)
            }
        }
    }
}

//
function drawPlayer() {
    ctx.fillStyle = player.color
    ctx.fillRect(player.pos.x, player.pos.y, gridSize, gridSize)
    ctx.beginPath();
    ctx.moveTo(player.pos.x + gridSize / 2, player.pos.y + gridSize / 2);
    var linepos = castRay(player.pos, player.dir)
    ctx.lineTo(linepos.x, linepos.y);
    ctx.stroke();

    //ctx.lineTo(player.pos.x + gridSize / 2 + 100 * Math.cos(player.dir + Math.PI/6), player.pos.y + gridSize / 2 + 100 * Math.sin(player.dir + Math.PI/6));
    //ctx.stroke();
    //ctx.moveTo(player.pos.x + gridSize / 2, player.pos.y + gridSize / 2);
    //ctx.lineTo(player.pos.x + gridSize / 2 + 100 * Math.cos(player.dir - Math.PI/6), player.pos.y + gridSize / 2 + 100 * Math.sin(player.dir - Math.PI/6));
    //ctx.stroke();
}

function castRay(pos, dir) {
    for (var i = 0; i < 20; i += 1) {
        if (collisionCheck({
            x: pos.x + gridSize / 2 + i*16 * Math.cos(dir),
            y: pos.y + gridSize / 2 + i*16 * Math.sin(dir)
        })) {
            return {
                x: pos.x + gridSize / 2 + i*16 * Math.cos(dir),
                y: pos.y + gridSize / 2 + i*16 * Math.sin(dir)
            }
        }
    }
    return {
        x: pos.x + gridSize / 2 + i*16 * Math.cos(dir),
        y: pos.y + gridSize / 2 + i*16 * Math.sin(dir)
    }
}

function clear() { c.width = c.width }

function movePlayer() {
    var move = keyboard.arrowUp    + (-1 * keyboard.arrowDown);
    var turn = keyboard.arrowRight + (-1 * keyboard.arrowLeft);

    var newDir = player.dir + turn * (6.5*Math.PI / 180);
    var dx = move * 3.2 * Math.cos(newDir);
    var dy = move * 3.2 * Math.sin(newDir);

    // separate checking of vertical and horizontal collisions.
    // we want the player to be able to glide along a wall horizontally or vertically.
    // collision checking is actually pretty dang complicated.
    var horizontalCollision = collisionCheck({ x: player.pos.x + dx, y: player.pos.y      })
    var verticalCollision   = collisionCheck({ x: player.pos.x,      y: player.pos.y + dy })

    var newPos = {
        x: player.pos.x + dx,
        y: player.pos.y + dy
    }

    if (horizontalCollision) { newPos.x = Math.round(newPos.x / gridSize) * gridSize; }
    if (verticalCollision)   { newPos.y = Math.round(newPos.y / gridSize) * gridSize; }

    Object.assign(player, { pos: newPos }, { dir: newDir })
}

// This is just som maths to check for collisions.
function collisionCheck(pos) {
    var x1 = Math.floor(pos.x / gridSize)
    var x2 = Math.ceil(pos.x / gridSize)
    var y1 = Math.floor(pos.y / gridSize)
    var y2 = Math.ceil(pos.y / gridSize)

    var positions = []
    if (map[y1][x1] !== 0) { positions.push({ x: x1 * gridSize, y: y1 * gridSize }) }
    if (map[y1][x2] !== 0) { positions.push({ x: x2 * gridSize, y: y1 * gridSize }) }
    if (map[y2][x1] !== 0) { positions.push({ x: x1 * gridSize, y: y2 * gridSize }) }
    if (map[y2][x2] !== 0) { positions.push({ x: x2 * gridSize, y: y2 * gridSize }) }

    return positions.map(function(_pos) {
        return intersects(pos, _pos)
      })
      .some(function(intersects) {
          return intersects;
      })
}

function intersects(pos1, pos2) {
    return (pos1.x < pos2.x + gridSize && pos1.x + gridSize > pos2.x && pos1.y < pos2.y + gridSize && pos1.y + gridSize > pos2.y)
}

function gameLoop() {
    movePlayer()
    clear()
    drawMap()
    drawPlayer()
}

setInterval(gameLoop, 33);
