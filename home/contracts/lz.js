export function lz77Decode(input) {
	let data = input.split("")
	let out = []
	let count = 0
	while (data.length > 0 && count < 100000) {
		count++
		let digit = parseInt(data[0])
		if (isNaN(digit)) return NaN
		if (digit === 0) {
			data.shift()
			continue
		}
		if (isNaN(parseInt(data[1]))) {
			for (let char of data.slice(1, digit + 1)) out.push(char)
			data.splice(0, 1 + digit)
		} else {
			let second = parseInt(data[1])
			data.splice(0, 2)
			out.push(
				...out.slice(out.length - second, out.length - second + digit + 1)
			)
		}
	}
	return out.join("")
}

// Missing:
// - alternating type
// - checking if last block -> allow testing for both types
