/**@param {import('../NetscriptDefinitions').NS} ns */
export async function main(ns) {
	const files = [
		"c-weaken.js",
		"c-grow.js",
		"c-hack.js",
		"batchController.js",
		"batchUtil.js",
		"sendJson.js",
		"lambert.js",
		"resize.js",
	];
	for (let target of ns.args) {
		if (ns.serverExists(target)) {
			await ns.scp(files, target, "home");
		}
	}
}

export function autocomplete(data, args) {
	return [...data.servers];
}
