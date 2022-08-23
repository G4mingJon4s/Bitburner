/**
 *
 * @param {import('../NetscriptDefinitions').NS} ns
 */
export async function main(ns) {
	let server = ns.args[0]
	let name = ns.args[1]

	ns.print(await httpGet("http://localhost:3000/batchlog").status)

	let data = "["
	data += await getContent(ns, server, name, 1)
	data = data.slice(0, -1)
	data += "]"
	ns.print(
		`Sending: ${data.slice(0, 5000)}     ...     ${data.slice(
			data.length - 100
		)}`
	)
	let res = await httpPut("http://localhost:3000/batchlog", data)
	ns.print(res.status)
}

/**
 * sends json data to a url - PUT request
 * @param {URL} url url to send data to
 * @param {JSON} data data to send to url
 * @returns response from http fetch
 */
export async function httpPut(url, data) {
	return await fetch(url, {
		method: "PUT",
		body: data,
		headers: { "Content-Type": "application/json; charset=utf-8" },
	})
}

/**
 * sends json data to a url - POST request
 * @param {URL} url url to send data to
 * @param {JSON} data data to send to url
 * @returns response from http fetch
 */
export async function httpPost(url, data) {
	return await fetch(url, {
		method: "POST",
		body: data,
		headers: { "Content-Type": "application/json; charset=utf-8" },
	})
}

/**
 * tries to fetch json data from a url
 * @param {URL} url url to fetch data from
 * @returns data retrieved from url
 */
export async function httpGet(url) {
	return await fetch(url, {
		method: "GET",
	})
}

/**
 *
 * @param {import('../NetscriptDefinitions').NS} ns
 * @param {import('../NetscriptDefinitions').Server} server
 * @param {string} name file name
 * @param {number} port port number from 1-20
 * @returns
 */
export async function getContent(ns, server, name, port) {
	let portHandle = ns.getPortHandle(port)
	await ns.scp("getter.js", "home", server)
	await ns.exec("getter.js", server, 1, name, port)
	while (portHandle.empty()) {
		await ns.sleep(1000)
	}
	let data = portHandle.read()
	portHandle.clear()
	return data
}
