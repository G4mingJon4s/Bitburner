import { getAllContracts, getAllServers } from "./contractFinder"
import { newWindow } from "./resize"

import { intToHam, hamToInt } from "/contracts/ham.js"
import { generateIPs } from "/contracts/ip.js"
import { maxSum } from "/contracts/maxSum.js"
import { traderI, traderII, traderIII, traderIV } from "/contracts/trader.js"
import { mergeOverlap } from "/contracts/merge.js"
import { sumPathsI, sumPathsII } from "/contracts/uniquePaths.js"
import { triangle } from "/contracts/triangle.js"
import { spiral } from "/contracts/spiral.js"
import { RLEEncode } from "/contracts/rle.js"
import { findFactor } from "contracts/prim.js"
import { strToSalad } from "contracts/caesar.js"
import { jumpI, jumpII } from "contracts/jump.js"
import { shortestPath } from "contracts/shortestPath.js"
import { distilVinegar } from "contracts/vinegar.js"
import { totalSum, totalSumII } from "contracts/totalSum.js"

export const availableSolvers = {
	"Compression I: RLE Compression": RLEEncode,
	"Algorithmic Stock Trader I": traderI,
	"Algorithmic Stock Trader II": traderII,
	"Algorithmic Stock Trader III": traderIII,
	"Algorithmic Stock Trader IV": traderIV,
	"Minimum Path Sum in a Triangle": triangle,
	"Find Largest Prime Factor": findFactor,
	"Spiralize Matrix": spiral,
	"Unique Paths in a Grid I": sumPathsI,
	"Unique Paths in a Grid II": sumPathsII,
	"Generate IP Addresses": generateIPs,
	"Merge Overlapping Intervals": mergeOverlap,
	"Subarray with Maximum Sum": maxSum,
	"HammingCodes: Integer to Encoded Binary": intToHam,
	"HammingCodes: Encoded Binary to Integer": hamToInt,
	"Encryption I: Caesar Cipher": strToSalad,
	"Array Jumping Game": jumpI,
	"Array Jumping Game II": jumpII,
	"Shortest Path in a Grid": shortestPath,
	"Encryption II: Vigenère Cipher": distilVinegar,
	"Total Ways to Sum": totalSum,
	"Total Ways to Sum II": totalSumII,
}

export const CONTRACTFILES = {
	error: "contractError.txt",
	missing: "contractMissing.txt",
	finished: "contractFinished.txt",
}

/** @param {import('../NetscriptDefinitions').NS} ns */
export async function main(ns) {
	ns.disableLog("ALL")
	newWindow(ns, 2500, 1000, 10, 10)
	await ns.sleep(100)

	const list = getAllContracts(ns, getAllServers(ns), true, false)

	const contracts = list
		.map((entry) =>
			entry.contracts.map((name) => ({ name, server: entry.name }))
		)
		.reduce((acc, current) => acc.concat(current), [])

	const contractsData = contracts.map((contract) => ({
		name: contract.name,
		server: contract.server,
		type: ns.codingcontract.getContractType(contract.name, contract.server),
		input: ns.codingcontract.getData(contract.name, contract.server),
		answer: undefined,
	}))

	ns.print(`INFO: Found ${contractsData.length} contracts.`)

	for (const contract of contractsData) {
		try {
			contract.answer = await solveContract(ns, contract)
		} catch {
			contract.answer = undefined
			contract.failure = "tryCatch"
			addError(ns, contract)
		}

		if (contract.answer === undefined || !canDoContract(ns, contract)) {
			ns.print(
				`WARNING: Skipping ${contract.type} (${contract.name} on ${
					contract.server
				}), because ${
					!canDoContract(ns, contract)
						? "the type solver isnt working"
						: "the type solver doesnt exist"
				}!`
			)
			continue
		}

		ns.print(
			`INFO: Attempting ${contract.name} on ${contract.server}. Type: ${
				contract.type
			}. Input: ${JSON.stringify(contract.input)}. Answer: ${contract.answer}.`
		)

		const result = ns.codingcontract.attempt(
			contract.answer,
			contract.name,
			contract.server
		)

		if (result) {
			ns.print("SUCCESS!")
			await addFinished(ns, contract)
		} else {
			ns.print(`ERROR! Removing ${contract.type}`)
			contract.failure = "value"
			await addError(ns, contract)
		}
		await ns.sleep(1000)
	}
}

/** @param {import('../NetscriptDefinitions').NS} ns */
export async function solveContract(ns, { input, type }) {
	const answer = await availableSolvers[type]?.(input)
	if (typeof answer === "undefined") await addMissing(ns, { type })
	return answer
}

/** @param {import('../NetscriptDefinitions').NS} ns */
export function canDoContract(ns, { type }) {
	const data = JSON.parse(ns.read(CONTRACTFILES.error))
	return !data.some((error) => error.type === type)
}

/** @param {import('../NetscriptDefinitions').NS} ns */
export async function addError(ns, contract) {
	const data = JSON.parse(ns.read(CONTRACTFILES.error))
	data.push(contract)
	await ns.write(CONTRACTFILES.error, JSON.stringify(data), "w")
}

/** @param {import('../NetscriptDefinitions').NS} ns */
export async function addFinished(ns, { type, input, answer }) {
	const data = JSON.parse(ns.read(CONTRACTFILES.finished))
	if (!data[type]) data[type] = []
	data[type].push({ input, output: answer })
	await ns.write(CONTRACTFILES.finished, JSON.stringify(data), "w")
}

/** @param {import('../NetscriptDefinitions').NS} ns */
export async function addMissing(ns, { type }) {
	const data = JSON.parse(ns.read(CONTRACTFILES.missing))
	if (data.includes(type)) return
	data.push(type)
	await ns.write(CONTRACTFILES.missing, JSON.stringify(data), "w")
}
