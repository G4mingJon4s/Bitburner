export function jumpI(input) {
	const j = jump(input)
	return j > 0 ? 1 : 0
}

export function jumpII(input) {
	return jump(input)
}

function jump(arrayData) {
	let n = arrayData.length
	let reach = 0
	let jumps = 0
	let lastJump = -1
	while (reach < n - 1) {
		let jumpedFrom = -1
		for (let i = reach; i > lastJump; i--) {
			if (i + arrayData[i] > reach) {
				reach = i + arrayData[i]
				jumpedFrom = i
			}
		}
		if (jumpedFrom === -1) {
			jumps = 0
			break
		}
		lastJump = jumpedFrom
		jumps++
	}
	return jumps
}
