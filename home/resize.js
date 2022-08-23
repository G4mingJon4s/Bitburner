/** @param {import('../NetscriptDefinitions').NS} ns */
export async function main(ns) {
	let name = ns.args[0]
	let width = ns.args[1] ?? 400
	let height = ns.args[2] ?? 400

	resizeTail(name, width, height)

	//name=script name
	function resizeTail(name, width, height) {
		for (const tail of globalThis["document"].querySelectorAll(
			`h6[title*="${name}"]`
		))
			if (tail.parentNode.parentNode.className == "react-resizable")
				tail.parentNode.parentNode.setAttribute(
					"style",
					`width: ${width}px; height: ${height}px;`
				)
	}
}

/** @param {import('../.vscode/NetscriptDefinitions').NS} ns */
export function newWindow(ns, width, height, x = -1, y = -1) {
	let doc = eval("document")
	ns.tail()
	let logArea = [...doc.querySelectorAll(".react-draggable")].pop()
	if (x !== -1) logArea.style.left = x + "px"
	if (y !== -1) logArea.style.top = y + "px"
	logArea.firstChild.style.width = width + "px"
	logArea.firstChild.style.height = height + "px"
}

export function resizeWindow(name, width, height) {
	for (const tail of globalThis["document"].querySelectorAll(
		`h6[title*="${name}"]`
	))
		if (tail.parentNode.parentNode.className == "react-resizable")
			tail.parentNode.parentNode.setAttribute(
				"style",
				`width: ${width}px; height: ${height}px;`
			)
}
