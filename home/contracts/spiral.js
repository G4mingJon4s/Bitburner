/**
 * @param {import('../../NetscriptDefinitions').NS} ns
 */
export async function main(ns) {
	ns.clearLog();
	ns.disableLog("ALL");
	let input = ns.args[0];
	ns.print(input);
	ns.print(spiral(input));
}

export function spiral(input) {
	const length = input.reduce((acc, arr) => acc.concat(arr), []).length;
	const row = input.length - 1;
	const col = input[0].length - 1;

	let pos = { x: 0, y: 0 };
	let dir = { x: 1, y: 0 };
	const prev = [];
	const result = [];
	while (result.length < length) {
		result.push(getValue(input, pos));
		prev.push({ ...pos });
		changePos(pos, dir, prev, col, row);
	}
	return result;
}

function getValue(input, pos) {
	return input[pos.y][pos.x];
}

function changePos(pos, dir, prev, col, row) {
	if (!canMoveTo(pos, dir, prev, col, row)) {
		const temp = rotateVector90ClockWise(dir);
		dir.x = temp.x;
		dir.y = temp.y;
	}
	pos.x += dir.x;
	pos.y += dir.y;
}

function canMoveTo(pos, dir, prev, col, row) {
	return (
		pos.x + dir.x <= col &&
		pos.x + dir.x >= 0 &&
		pos.y + dir.y <= row &&
		pos.y + dir.y >= 0 &&
		!prev.some((p) => p.x === pos.x + dir.x && p.y === pos.y + dir.y)
	);
}

function rotateVector90ClockWise({ x, y }) {
	return { x: y * -1, y: x };
}
