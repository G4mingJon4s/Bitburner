export function maxSum(input) {
	let bSum = input[0];
	for (let i = 0; i < input.length; i++) {
		for (let j = i + 1; j <= input.length; j++) {
			let arr = input.slice(i, j);
			let sum = arr.reduce((a, b) => a + b);
			bSum = Math.max(bSum, sum);
		}
	}
	return bSum;
}
