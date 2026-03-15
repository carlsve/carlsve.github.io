// Simple A* pathfinding on a 2D grid

const MAX_DISTANCE = 50

export function aStar(grid, start, goal) {
  const rows = grid.length;
  const cols = grid[0].length;

  // Helper: Manhattan distance heuristic (for 4-directional movement)
  const heuristic = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

  // Helper: valid neighbor coordinates (4 directions)
  function getNeighbors(node) {
    const dirs = [
      { x: 1, y: 0 }, { x: -1, y: 0 },
      { x: 0, y: 1 }, { x: 0, y: -1 }
    ];
    const result = [];
    for (const d of dirs) {
      const nx = node.x + d.x;
      const ny = node.y + d.y;
      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && grid[ny][nx] === 0) {
        result.push({ x: nx, y: ny });
      }
    }
    return result;
  }

  // To reconstruct the final path
  function reconstructPath(cameFrom, current) {
    const path = [current];
    while (cameFrom[`${current.x},${current.y}`]) {
      current = cameFrom[`${current.x},${current.y}`];
      path.push(current);
    }
    return path.reverse();
  }

  // The open set (nodes to explore)
  const openSet = [start];

  // Maps of cost so far (g) and total estimated cost (f)
  const gScore = {};
  const fScore = {};
  const cameFrom = {};

  gScore[`${start.x},${start.y}`] = 0;
  fScore[`${start.x},${start.y}`] = heuristic(start, goal);

  while (openSet.length > 0) {
    // Find node with the lowest fScore
    let currentIndex = 0;
    for (let i = 0; i < openSet.length; i++) {
      const a = openSet[i];
      const b = openSet[currentIndex];
      if ((fScore[`${a.x},${a.y}`] ?? Infinity) < (fScore[`${b.x},${b.y}`] ?? Infinity)) {
        currentIndex = i;
      }
    }
    const current = openSet[currentIndex];

    if ((gScore[`${current.x},${current.y}`] ?? Infinity) > MAX_DISTANCE) {
        console.log("Search radius exceeded")
        return reconstructPath(cameFrom, current)
    }

    // Goal reached
    if (current.x === goal.x && current.y === goal.y) {
      return reconstructPath(cameFrom, current);
    }

    // Remove from open set
    openSet.splice(currentIndex, 1);

    for (const neighbor of getNeighbors(current)) {
      const tentative_g = (gScore[`${current.x},${current.y}`] ?? Infinity) + 1;
      const neighborKey = `${neighbor.x},${neighbor.y}`;

      if (tentative_g < (gScore[neighborKey] ?? Infinity)) {
        cameFrom[neighborKey] = current;
        gScore[neighborKey] = tentative_g;
        fScore[neighborKey] = tentative_g + heuristic(neighbor, goal);

        // Add to open set if not already there
        if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  // No path found
  return null;
}
