/* Raycaster, Carl Petter Svensson */

var gridSize  = 16
    mapWidth  = 20
    mapHeight = 15

// set size
// html canvas interaction stuff.
var mapCanvas = document.getElementById("minimap");
mapCanvas.width  = mapWidth * gridSize
mapCanvas.height = mapHeight * gridSize
var mapContext = mapCanvas.getContext("2d");

var viewCanvas = document.getElementById("playerview");
viewCanvas.width = 320;
viewCanvas.height = 240
var viewContext = viewCanvas.getContext("2d")

var player = {
    pos: {x:2 * gridSize,y:5 * gridSize},
    color: 'rgb(160,160,160)',
    dir: 0.0
}

var viewAbsVals = []

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
    mapContext.fillStyle = 'rgb(200,200,200)'
    for (var y = 0; y < mapHeight; ++y) {
        for (var x = 0; x < mapWidth; ++x) {
            if (map[y][x]) {
                mapContext.fillRect(x * gridSize, y * gridSize, gridSize, gridSize)
            }
        }
    }
}

function drawViewFrame() {
    viewContext.fillStyle = 'rgb(200,200,200)';
    viewContext.fillRect(0, 0, 320, 240)
}

//
function drawPlayer() {
    var linepos;
    var i;
    var formula;

    mapContext.fillStyle = player.color
    mapContext.fillRect(player.pos.x, player.pos.y, gridSize, gridSize)
    mapContext.beginPath();
    viewAbsVals = []
    for (i = 0; i < 320; i += 1) {
        formula = player.dir + (-1*Math.PI/6 + 2*i/320 * Math.PI/6);
        mapContext.moveTo(player.pos.x + gridSize / 2, player.pos.y + gridSize / 2);
        linepos = castRay(player.pos, formula)
        mapContext.lineTo(linepos.x, linepos.y);
        mapContext.stroke();
        viewAbsVals.push(
            Math.sqrt(
                (player.pos.x - linepos.x)*(player.pos.x - linepos.x) +
                (player.pos.y - linepos.y)*(player.pos.y - linepos.y)
            )
        )
    }
}

function drawView() {
    var i;
    var dist;

    viewContext.beginPath();
    for (i = 0; i < 320; i += 1) {
        dist = viewAbsVals[i];
        viewContext.moveTo(i, 240/2 - (dist / 2))
        viewContext.lineTo(i, 240/2 + (dist / 2))
        viewContext.stroke();
    }
}

function castRay(pos, dir) {
    var stepPos = {};
    var i;

    for (i = 0; i < 320; i += 1) {
        stepPos = {
            x: pos.x + gridSize / 2 + i * Math.cos(dir),
            y: pos.y + gridSize / 2 + i * Math.sin(dir)
        }

        if (map[Math.floor(stepPos.y / gridSize)][Math.floor(stepPos.x / gridSize)] === 1) {
            return stepPos;
        }
    }
    return {
        x: pos.x + gridSize / 2 + i * Math.cos(dir),
        y: pos.y + gridSize / 2 + i * Math.sin(dir)
    }
}

function clear(c) { c.width = c.width }

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
    clear(mapCanvas)
    clear(viewCanvas)
    drawMap()
    drawViewFrame()
    drawPlayer()
    drawView();
}

setInterval(gameLoop, 33);
