/** @param {import('../NetscriptDefinitions').NS} ns */
export async function main(ns) {
	const data = [
		["Keys", "Values"],
		[
			"123Aca",
			"thisIsGoingToBePrettyLong",
			"Im here to test if others fill up too",
		],
		["Immakeepgoing", "Ithink"],
		["lets put something weird here", "or not i guess"],
		["12412412412412", "asdfj49xm349yß$%\\"],
	]
	ns.tprint(table(data, false, false))
}

export function table(data, header = true, divisor = true) {
	const style = DefaultStyle()

	data = data.map((val) => val.map((s) => s.toString()))

	let col = Math.max(...data.map((a) => a.length))

	data.forEach((a) =>
		a.splice(a.length, 0, ...new Array(col - a.length).fill(""))
	)

	const lengths = data.reduce((acc, row) => {
		row.forEach(
			(val, i) =>
				(acc[i] = Math.max(
					acc[i] ?? 0,
					val.replace(/^\\x1b\[[0-9]{1,2};[0-9]{1,2};[0-9]{1,2}m$/, "").length
				))
		)
		return acc
	}, [])

	const headSep = [style[0][0], style[0][1], style[0][2], style[0][3]]
	const divisorSep = [style[1][0], style[1][1], style[1][2], style[1][3]]
	const buttSep = [style[2][0], style[2][1], style[2][2], style[2][3]]
	const lineSep = [style[1][4], style[1][4], style[1][4]]
	const headerMeta = header ? data[0] : new Array(col).fill("")

	const head = makeLine(lengths, headSep, headerMeta)
	const butt = makeLine(lengths, buttSep, new Array(col).fill(""))
	const divisorLine = makeLine(lengths, divisorSep, new Array(col).fill(""))

	const lines = []
	for (let i = header ? 1 : 0; i < data.length; i++) {
		lines.push(makeLine(lengths, lineSep, data[i]))
		if (divisor && i + 1 < data.length) lines.push(divisorLine)
	}

	return "\n" + [head, ...lines, butt].join("\n")
}

function makeLine(lengths, [prefix, middix, suffix, filler = " "], row) {
	let line = prefix
	for (let j = 0; j < row.length; j++) {
		line += row[j].padEnd(lengths[j], filler)
		line += j + 1 >= row.length ? suffix : middix
	}
	return line
}

export function objectToTableArray(object) {
	if (typeof object !== "object") return []
	const array = Object.entries(object)
	if (typeof array?.[0]?.[1] !== "object") return array
	const final = array.map((arr) => [arr[0], ...Object.values(arr[1])])
	return final
}

export function DefaultStyle() {
	return [
		["┌", "┬", "┐", "─", "│"],
		["├", "┼", "┤", "─", "│"],
		["└", "┴", "┘", "─", "│"],
	]
}
