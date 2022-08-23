export function generateIPs(string) {
	const digits = string.split("")
	const maxDots = 3
	const dot = "."

	const possible = []

	for (let i = 0; i < digits.length; i++) {
		for (let j = i + 1; j < digits.length + 1; j++) {
			for (let k = j + 1; k < digits.length + 2; k++) {
				const copy = digits.slice()
				copy.splice(i, 0, dot)
				copy.splice(j, 0, dot)
				copy.splice(k, 0, dot)
				possible.push(copy.join(""))
			}
		}
	}

	const valid = possible.filter((s) => {
		const arr = s.split("")
		let isInvalid = false
		let count = 0
		for (let i = 0; i < arr.length; ) {
			const char = arr[i]
			if (char === dot && arr[i + 1] === dot) {
				isInvalid = true
				break
			}
			if (char === dot) {
				count++
				if (count > maxDots || i === 0) {
					isInvalid = true
					break
				}
				i++
				continue
			}
			const numbers = [char]
			i++
			while (i < arr.length && arr[i] !== dot) {
				numbers.push(arr[i])
				i++
			}
			const number = parseInt(numbers.join(""))
			if (
				isNaN(number) ||
				number > 255 ||
				numbers.length > 3 ||
				(numbers[0] === "0" && numbers.length > 1)
			) {
				isInvalid = true
				break
			}
		}
		return !isInvalid
	})
	return valid
}

export async function main(ns) {
	for (const test of testCases) {
		const input = test.input
		const output = test.output
		const answer = generateIPs(input)
		const failed = answer.some((s, i) => s != output[i])
		ns.tprint(failed ? "FAILED" : "SUCCESS")
	}
}

const testCases = [
	{ input: "135185197181", output: ["135.185.197.181"] },
	{
		input: "04748126",
		output: ["0.47.48.126"],
	},
	{ input: "114227110211", output: ["114.227.110.211"] },
	{ input: "20152128234", output: ["20.152.128.234", "201.52.128.234"] },
	{
		input: "771241193",
		output: [
			"7.71.241.193",
			"77.1.241.193",
			"77.12.41.193",
			"77.124.1.193",
			"77.124.11.93",
			"77.124.119.3",
		],
	},
	{ input: "5822817460", output: ["58.228.174.60"] },
	{ input: "2613314577", output: ["26.133.145.77"] },
	{ input: "42157226192", output: ["42.157.226.192"] },
	{
		input: "23220462",
		output: [
			"2.32.204.62",
			"23.2.204.62",
			"23.220.4.62",
			"23.220.46.2",
			"232.20.4.62",
			"232.20.46.2",
			"232.204.6.2",
		],
	},
]
