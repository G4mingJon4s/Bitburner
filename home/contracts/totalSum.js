export function totalSum(n) {
	const ways = new Array(n + 1).fill().map(() => 0)
	ways[0] = 1

	for (let i = 1; i < n; i++)
		for (let j = i; j <= n; j++) ways[j] += ways[j - i]

	return ways[n]
}

export function totalSumII(input) {
	input[1] = input[1].filter((n) => n <= input[0])
	const [n, set] = input
	const ways = new Array(n + 1).fill().map(() => 0)
	ways[0] = 1

	for (let i of set) {
		for (let j = i; j <= n; j++) {
			ways[j] += ways[j - i]
		}
	}
	return ways[n]
}
