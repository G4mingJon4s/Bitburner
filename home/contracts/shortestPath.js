export function shortestPath(arr) {
  const row = arr.length - 1;
  const col = arr[0].length - 1;

  const queue = [{ x: 0, y: 0, path: "" }];
  const went = [];
  let current = { x: 0, y: 0, path: "" };
  while (queue.length > 0) {
    current = queue.shift();
    console.log(current);
    if (current.x === col && current.y === row) return current.path;
    went.push(current);

    let dir = { x: 1, y: 0 };
    for (let i = 0; i < 4; i++) {
      const newX = current.x + dir.x;
      const newY = current.y + dir.y;

      console.log(
        i,
        { x: newX, y: newY },
        newX >= 0 &&
          newX <= col &&
          newY >= 0 &&
          newY <= row &&
          arr[newY][newX] === 0 &&
          !went.some((entry) => entry.x === newX && entry.y === newY),
        { x: newX, y: newY, path: current.path + vecToChar(dir) }
      );

      if (
        newX >= 0 &&
        newX <= col &&
        newY >= 0 &&
        newY <= row &&
        arr[newY][newX] == 0 &&
        !went.some((entry) => entry.x === newX && entry.y === newY)
      )
        queue.push({ x: newX, y: newY, path: vecToChar(dir) + current.path });
      dir = rotateVector90ClockWise(dir);
    }
  }
  return "";
}

function rotateVector90ClockWise({ x, y }) {
  return { x: y * -1, y: x };
}

function vecToChar(vec) {
  if (vec.y === -1) return "U";
  if (vec.x === 1) return "R";
  if (vec.y === 1) return "D";
  if (vec.x === -1) return "L";
}
