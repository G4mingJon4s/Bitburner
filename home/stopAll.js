import { getAllServers } from "./contractFinder"

/**
 * @param {import('../NetscriptDefinitions').NS} ns
 */
export async function main(ns) {
	let script = ns.args[0]
	let servers = await getAllServers(ns)
	for (let name of servers) {
		ns.kill(script, name)
	}
}
