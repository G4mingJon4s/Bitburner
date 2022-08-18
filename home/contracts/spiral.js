/**
 * @param {import('../../NetscriptDefinitions').NS} ns
 */
export async function main(ns) {
  ns.clearLog();
  ns.disableLog("ALL");
  let host = ns.args[0];
  let name = ns.args[1];
  let input = ns.codingcontract.getData(name, host);
  ns.print(input);
  ns.print("START ", input.length - 1, " ", input[0].length - 1);
  ns.print(await spiral(input));
}

export function spiral(input) {
  let row = input.length - 1;
  let col = input[0].length - 1;

  let pos = [0, 0];
  let dir = [1, 0];
  let prev = [];
  let result = [];
  while (result.length < (row + 1) * (col + 1)) {
    result.push(getValue(input, pos));
    prev.push(pos);

    let newValues = changePos(pos, dir, prev, col, row);
    pos = newValues[0];
    dir = newValues[1];
  }
  return result;
}

function getValue(input, pos) {
  let row = input[pos[1]];
  let value = row[pos[0]];
  return value;
}

function changePos(pos, dir, prev, col, row) {
  let next = [];
  let newDir = [...dir];

  if (isNotPossible(pos, dir, prev, col, row)) {
    newDir = rotateVector(newDir);
  }

  next[0] = pos[0] + newDir[0];
  next[1] = pos[1] + newDir[1];

  return [next, newDir];
}

function isNotPossible(pos, dir, prev, col, row) {
  return (
    pos[0] + dir[0] > col ||
    pos[0] + dir[0] < 0 ||
    pos[1] + dir[1] > row ||
    pos[1] + dir[1] < 0 ||
    prev.includes([pos[0] + dir[0], pos[1] + dir[1]])
  );
}

function rotateVector(vec) {
  let temp = [...vec];
  let out = [];
  out[0] = temp[1] * -1;
  out[1] = temp[0];
  return out;
}
