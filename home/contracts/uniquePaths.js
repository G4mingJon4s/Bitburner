export function sumPathsI(x, y) {
  let val = fact(x + y - 2);
  return val / (fact(x - 1) * fact(y - 1));
}

export function fact(n) {
  if (n < 2) return 1;
  return n * fact(n - 1);
}

export function sumPathsII(input) {
  let pos = {
    x: 0,
    y: 0,
  };

  function perm(pos, grid, paths = 0) {
    if (pos.x === grid[pos.y].length - 1 && pos.y === grid.length - 1)
      return true;
    if (canMoveRight(pos, grid))
      paths += perm(
        {
          x: pos.x + 1,
          y: pos.y,
        },
        grid
      );
    if (canMoveDown(pos, grid))
      paths += perm(
        {
          x: pos.x,
          y: pos.y + 1,
        },
        grid
      );
    return paths;
  }
  let paths = perm(pos, input);
  return paths;
}

function canMoveRight(pos, grid) {
  let colM = grid[pos.y].length - 1;
  if (pos.x + 1 > colM) return false;
  let right = grid[pos.y][pos.x + 1];
  return right === 0;
}

function canMoveDown(pos, grid) {
  let rowM = grid.length - 1;
  if (pos.y + 1 > rowM) return false;
  let down = grid[pos.y + 1][pos.x];
  return down === 0;
}

/**
 *
 * @param {import('../../NetscriptDefinitions').NS} ns
 */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();
  ns.tail();
  let tests = [
    {
      input: [
        [0, 0, 0],
        [0, 0, 0],
        [1, 0, 0],
      ],
      output: 5,
    },
    {
      input: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 0],
        [0, 0, 0, 1, 0, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 0],
      ],
      output: 202,
    },
    {
      input: [
        [0, 0],
        [0, 0],
        [0, 1],
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 1],
        [0, 0],
        [0, 0],
        [1, 0],
        [0, 0],
      ],
      output: 2,
    },
    {
      input: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 0, 1, 0],
        [1, 1, 0, 1, 1, 0, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 1],
        [0, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 1],
        [0, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 1, 0, 0, 1, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      output: 240,
    },
    {
      input: [
        [0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        [1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
        [1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
      ],
      output: 102,
    },
  ];
  for (const data of tests) {
    let input = data.input;
    let output = data.output;
    let answer = sumPathsII(input);
    ns.tprint(answer);
    ns.tprint(output);
    ns.tprint("-");
  }
}
