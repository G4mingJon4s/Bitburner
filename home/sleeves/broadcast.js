/**@param {import('../../NetscriptDefinitions').NS} ns */
export async function main(ns) {
	[...Array(ns.sleeve.getNumSleeves()).keys()].forEach((a, i) =>
		ns.sleeve.setToCommitCrime(i, ns.args[0])
	);
}
