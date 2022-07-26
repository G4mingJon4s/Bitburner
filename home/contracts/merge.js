/**@param {number[][]} arr */
export async function mergeOverlap(arr) {
	const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

	while (true) {
		let merged = false;
		for (let i = 0; i < arr.length; i++) {
			for (let j = 0; j < arr.length; j++) {
				if (i === j) continue;
				if (!hasOverlap(arr[i], arr[j])) continue;
				const jValue = arr[j];
				const newEntry = merge(arr[i], jValue);
				arr.splice(i, 1);
				arr.splice(arr.indexOf(jValue), 1);
				arr.push(newEntry);
				merged = true;
				break;
			}
			if (merged) break;
		}
		if (!merged) break;
		await sleep(10);
	}
	return arr.sort((a, b) => a[0] - b[0]);
}

/**
 * @param {number[]} a
 * @param {number[]} b
 * */
function hasOverlap(a, b) {
	if (a[0] === b[0] || a[1] === b[1]) return true;
	return a[0] < b[0] ? b[0] <= a[1] : a[0] <= b[1];
}

/**
 * @param {number[]} a
 * @param {number[]} b
 * */
function merge(a, b) {
	return [Math.min(a[0], b[0]), Math.max(a[1], b[1])];
}

export async function main(ns) {
	await runTests(ns);
}

async function runTests(ns) {
	let data = [
		{
			input: [
				[1, 10],
				[2, 5],
				[11, 17],
				[11, 17],
				[14, 23],
				[23, 33],
				[24, 29],
			],
			output: [
				[1, 10],
				[11, 33],
			],
		},
		{
			input: [
				[1, 11],
				[5, 13],
				[11, 17],
				[12, 22],
				[14, 19],
				[15, 16],
			],
			output: [[1, 22]],
		},
		{
			input: [
				[3, 13],
				[6, 16],
				[8, 13],
				[9, 11],
				[9, 12],
				[9, 18],
				[13, 17],
				[13, 21],
				[16, 19],
				[16, 26],
				[17, 24],
				[17, 27],
				[23, 27],
				[23, 30],
				[24, 30],
				[25, 28],
			],
			output: [[3, 30]],
		},
		{
			input: [
				[1, 7],
				[5, 11],
				[6, 11],
				[6, 11],
				[6, 16],
				[13, 17],
				[15, 25],
				[16, 25],
				[17, 22],
				[17, 25],
				[20, 21],
				[21, 29],
			],
			output: [[1, 29]],
		},
		{
			input: [
				[2, 11],
				[4, 14],
				[5, 15],
				[7, 8],
				[11, 16],
				[16, 22],
				[16, 26],
				[17, 19],
				[17, 26],
				[19, 20],
				[19, 23],
				[20, 22],
				[20, 27],
				[21, 25],
				[22, 25],
				[23, 25],
			],
			output: [[2, 27]],
		},
		{
			input: [
				[2, 7],
				[6, 10],
				[8, 9],
				[10, 19],
				[13, 18],
				[15, 17],
				[19, 29],
				[21, 23],
				[23, 29],
			],
			output: [[2, 29]],
		},
		{
			input: [
				[3, 9],
				[5, 6],
				[13, 22],
				[16, 26],
				[18, 28],
				[23, 28],
				[25, 33],
			],
			output: [
				[3, 9],
				[13, 33],
			],
		},
		{
			input: [
				[2, 12],
				[7, 8],
				[7, 15],
				[7, 16],
				[9, 12],
				[10, 17],
				[12, 16],
				[12, 20],
				[14, 20],
				[16, 24],
				[19, 28],
				[20, 28],
				[24, 33],
				[25, 29],
				[25, 34],
			],
			output: [[2, 34]],
		},
		{
			input: [
				[1, 7],
				[5, 10],
				[6, 8],
				[6, 14],
				[11, 17],
				[13, 16],
				[13, 19],
				[17, 27],
				[19, 26],
				[20, 21],
			],
			output: [[1, 27]],
		},
		{
			input: [
				[2, 11],
				[3, 7],
				[3, 9],
				[3, 10],
				[5, 10],
				[13, 16],
				[14, 17],
				[14, 21],
				[15, 20],
				[20, 22],
				[21, 29],
				[22, 28],
				[23, 25],
				[23, 29],
				[25, 29],
			],
			output: [
				[2, 11],
				[13, 29],
			],
		},
	];
	for (let test of data) {
		const output = test.output;
		const input = test.input;
		const answer = await mergeOverlap(input);
		const failed = answer.some((s, i) => s.some((n, j) => output[i][j] !== n));
		ns.tprint(failed ? "FAILED " : "SUCCESS");
		if (failed) {
			ns.tprint(output);
			ns.tprint(answer);
		}
	}
}
