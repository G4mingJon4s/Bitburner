export function intToHam(int) {
	const bin = int
		.toString(2)
		.split("")
		.map((s) => Number(s));

	const code = [0];
	const parries = [];

	for (let i = 1; bin.length > 0; i++) {
		if (Number.isInteger(Math.log2(i))) parries.push(i);
		code.push(Number.isInteger(Math.log2(i)) ? 0 : bin.shift());
	}

	parries.forEach((p) => {
		code[p] = code
			.map((a, i) => (i & p) > 0)
			.reduce((acc, b, i) => (b && code[i]) ^ acc);
	});

	code[0] = code.reduce((acc, state) => state ^ acc);

	return code.join("");
}

/** @param {string} ham */
export function hamToInt(ham) {
	const code = ham.split("").map((s) => Number(s));

	console.log("conv:", code);

	if (code.reduce((acc, a) => a ^ acc, 0)) {
		const flippedArray = code.reduce(
			(acc, a, i) => (a ? acc.concat([i]) : acc),
			[]
		);

		console.log("flipArr:", flippedArray);

		const flipped = flippedArray.reduce((a, b) => a ^ b);

		console.log("flip:", flipped);

		code[flipped] = (code[flipped] + 1) % 2;

		console.log("change:", code);
	}

	const bin = code.reduce(
		(acc, a, i) =>
			i < 1 || Number.isInteger(Math.log2(i)) ? acc : acc.concat([a]),
		[]
	);

	console.log("bin:", bin);

	return Number.parseInt(bin.join(""), 2);
}

function testHam() {
	const test = Array(100)
		.fill()
		.map(() => Math.floor(Math.random() * 1000000));

	const cases = test.map((n) => {
		const ham = intToHam(n);

		const int = hamToInt(ham);

		const change = ham.split("");
		const index = Math.floor(Math.random() * change.length);
		change[index] = ((Number(change[index]) + 1) % 2).toString();

		const intChanged = hamToInt(change.join(""));

		console.warn(n, ham, int, intChanged, int == intChanged);
		return int == intChanged;
	});
	return cases.some((val) => !val);
}
