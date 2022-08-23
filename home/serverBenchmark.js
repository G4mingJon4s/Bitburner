import { getAllServers } from "./contractFinder"
import { COLOURS } from "./colours"
import { objectToTableArray, table } from "./tables"
import { gbFormatter, nFormatter, tFormatter } from "./serverCalc"
import { getAllRAMValues } from "./serverCalc"
import {
	getBatchCost,
	getCosts,
	getLimit,
	getThreads,
	OFFSET,
	SAFETIME,
} from "./tests/newBatching"

/** @param {import('../NetscriptDefinitions').NS} ns */
export async function main(ns) {
	const mode = ns.args[0] ?? 0
	const second = objectToTableArray(getBestServers(ns, ns.args[1]))
		.sort((a, b) => a[1] - b[1])
		.map((arr) => [arr[0], nFormatter(arr[1]), arr[2]])
	second.unshift(["Server", "Value", "Percentage"])
	switch (mode) {
		case 2:
			ns.tprint(table(second))
			break
		default:
			ns.tprint(table(await benchmarkServerStats(ns), true, false))
			break
	}
}

/** @param {import('../NetscriptDefinitions').NS} ns */
export async function benchmarkServerStats(ns) {
	const servers = getAllServers(ns)

	const data = servers.map((server) => [
		server,
		nFormatter(ns.getServerMaxMoney(server)),
		ns.getServerMinSecurityLevel(server).toString(),
		ns.hasRootAccess(server) ? "Yes" : "No",
		ns.getServerRequiredHackingLevel(server).toString(),
		ns.hackAnalyzeChance(server).toFixed(2),
		tFormatter(ns.getWeakenTime(server), false),
	])
	data.unshift([
		"Server",
		"Money",
		"Security",
		"Access",
		"Level",
		"Chance",
		"Time",
	])
	return data
}

/**
 * @param {import('../NetscriptDefinitions').NS} ns
 */
export function benchmarkServerBatch(ns) {
	const player = ns.getPlayer()
	const serverObjects = getAllServers(ns)
		.map((name) => {
			const obj = ns.getServer(name)
			obj.hackDifficulty = obj.minDifficulty
			obj.moneyAvailable = obj.moneyMax
			return obj
		})
		.filter(
			(obj) =>
				obj.hasAdminRights &&
				obj.requiredHackingSkill <= player.skills.hacking &&
				obj.moneyMax > 0
		)
	const ramValues = getAllRAMValues(ns)
	const percentageValues = [
		0.01, 0.02, 0.03, 0.04, 0.05, 0.07, 0.1, 0.15, 0.25, 0.45, 0.55, 0.75, 0.85,
		0.9, 0.91, 0.92, 0.93, 0.94, 0.95, 0.96, 0.97, 0.98, 0.99, 1.0,
	]

	const data = ramValues.map((ram) => ({
		ram,
		percentages: percentageValues.map((percentage) => ({
			percentage,
			servers: serverObjects.map((server) => {
				const threads = getThreads(
					ns,
					server.hostname,
					percentage,
					ns.getHostname()
				)
				const costs = getCosts(ns)
				const batchCost = getBatchCost(threads, costs)
				const time = ns.fileExists("Formulas.exe", "home")
					? ns.formulas.hacking.weakenTime(server, player)
					: ns.getWeakenTime(server.hostname)
				const chance = ns.fileExists("Formulas.exe", "home")
					? ns.formulas.hacking.hackChance(server, player)
					: ns.hackAnalyzeChance(server.hostname)
				const batchCount = getLimit(
					ns,
					server.hostname,
					ram * 0.98,
					batchCost,
					false,
					time,
					OFFSET,
					SAFETIME
				)
				const score =
					((batchCount * chance * server.moneyMax * percentage) / time) *
					Math.log(batchCost)
				if (!Number.isFinite(score))
					return { server: server.hostname, score: 0 }
				return { server: server.hostname, score }
			}),
		})),
	}))
	return data
}

/** @param {import('../NetscriptDefinitions').NS} ns */
export function getBestServers(ns, ramIn) {
	const ram = nearestPowerOf2(ramIn)
	const data = benchmarkServerBatch(ns)
		.reverse()
		.find((entry) => entry.ram <= ram)
	if (typeof data === "undefined") return []

	const serverScores = data.percentages[0].servers.reduce(
		(acc, entry) => ({
			...acc,
			[entry.server]: { score: 0, percentage: 0 },
		}),
		{}
	)

	data.percentages.forEach((entry) => {
		entry.servers.forEach((scoreEntry) => {
			if (serverScores[scoreEntry.server].score < scoreEntry.score)
				serverScores[scoreEntry.server] = {
					score: scoreEntry.score,
					percentage: entry.percentage,
				}
		})
	})
	return serverScores
}

export function nearestPowerOf2(n) {
	return 1 << (31 - Math.clz32(n))
}

export function map(value, low1, high1, low2, high2) {
	return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1)
}
