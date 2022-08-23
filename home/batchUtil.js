import { calculateGrowThreads } from "./lambert";
import { httpPut, httpPost } from "./sendJson";

export const INDEX = {
	H: 0,
	W1: 1,
	G: 2,
	W2: 3,
	W: 1,
};
export const MODE = {
	HWGW: 0,
	GW: 1,
	W: 2,
};
export const MAXLIMIT = 2000;

const scriptWeaken = "c-weaken.js";
const scriptGrow = "c-grow.js";
const scriptHack = "c-hack.js";

/**
 *
 * @param {import('../NetscriptDefinitions').NS} ns netscript interface.
 * @returns {Number[]} Array with Usage of the operation scripts.
 */
export function getOperationRam(ns) {
	let out = [];
	out.push(ns.getScriptRam(scriptHack));
	out.push(ns.getScriptRam(scriptWeaken));
	out.push(ns.getScriptRam(scriptGrow));
	return out;
}

/**
 *
 * @param {import('../NetscriptDefinitions').NS} ns
 * @param {import('../NetscriptDefinitions').Server} server
 * @param {import('../NetscriptDefinitions').Player} player
 * @returns {Number[]} Array with Times of the operation scripts.
 */
export function getOperationTime(ns, server, player = ns.getPlayer()) {
	let out = [];
	if (!ns.fileExists("Formulas.exe", "home")) {
		out.push(ns.getHackTime(server.hostname));
		out.push(ns.getWeakenTime(server.hostname));
		out.push(ns.getGrowTime(server.hostname));
		return out;
	}
	out.push(ns.formulas.hacking.hackTime(server, player));
	out.push(ns.formulas.hacking.weakenTime(server, player));
	out.push(ns.formulas.hacking.growTime(server, player));
	return out;
}

/**
 *
 * @param {import('../NetscriptDefinitions').NS} ns
 * @param {import('../NetscriptDefinitions').Server} server
 * @param {import('../NetscriptDefinitions').Server} target
 * @param {Call[]} operationsIn
 * @param {number} offset
 */
export async function launchOperations(
	ns,
	server,
	target,
	operationsIn,
	start = Date.now(),
	safeWindow = 0,
	debug = false
) {
	let operations = operationsIn.sort((a, b) => a.start - b.start); // low to high
	if (debug) await ns.write("batchDebug.txt", JSON.stringify(operations), "w");
	let sent = [];
	ns.print(`WAIT - Starting launching... (Start: ${Date.now() - start})`);
	for (let operation of operations) {
		let now = Date.now() - start;
		if (now < operation.start) {
			let delay = operation.start - now;
			ns.print(
				`WAIT - waiting for deploy window... (Time: ${tFormatter(
					delay,
					false
				)})`
			);
			await ns.sleep(delay);
			now = Date.now() - start;
		}

		// TODO - Add variable check for safety

		if (
			server.maxRam - ns.getServerUsedRam(server.hostname) <
			getOperationRam(ns)[Call.convertType(operation.type)] * operation.threads
		) {
			ns.print("ERROR - Not enough ram!");
			now = Date.now() - start;
			if (sent.length == 0) return [];
			await ns.sleep(sent[sent.length - 1].end - now);
			return sent;
		}
		const pid = ns.exec(
			operation.getScript(),
			server.hostname,
			operation.threads,
			target.hostname,
			Date.now()
		);
		sent.push({
			type: operation.type,
			start: operation.start,
			end: operation.end,
			threads: operation.threads,
			getScript: operation.getScript,
			pid,
		});
		ns.print(
			"WAIT - launched: ",
			operation.type,
			" ",
			now.toFixed(2),
			" ",
			operation.threads.toFixed(2)
		);
		await ns.sleep(safeWindow);
	}
	ns.print("WAIT - Finished initiating...");
	let now = Date.now() - start;
	ns.print(
		`WAIT - Waiting for calls... (Time: ${tFormatter(
			sent[sent.length - 1].end - now,
			false
		)})`
	);
	await ns.sleep(sent[sent.length - 1].end - now);
	return sent;
}

export function convertType(type) {
	switch (type) {
		case "weaken":
			return INDEX.W;
		case "grow":
			return INDEX.G;
		case "hack":
			return INDEX.H;
	}
}

/**
 *
 * @param {import('../NetscriptDefinitions').NS} ns
 * @param {import('../NetscriptDefinitions').Server} server
 */
export function checkServerVariables(ns, server) {
	return (
		ns.getServerMoneyAvailable(server.hostname) == server.moneyMax &&
		server.minDifficulty == ns.getServerSecurityLevel(server.hostname)
	);
}

/**
 *
 * @param {import('../NetscriptDefinitions').NS} ns
 * @param {import('../NetscriptDefinitions').Server} server
 * @param {"weaken" | "grow" | "hack"} type
 * @param {Number} time
 * @param {import('../NetscriptDefinitions').Player} player
 * @returns
 */
export function checkTimingChange(
	ns,
	server,
	type,
	time,
	player = ns.getPlayer()
) {
	switch (type) {
		case "weaken":
			if (ns.fileExists("Formulas.exe", "home")) {
				return ns.formulas.hacking.weakenTime(server, player) == time;
			} else {
				return ns.getWeakenTime(server.hostname) == time;
			}
		case "grow":
			if (ns.fileExists("Formulas.exe", "home")) {
				return ns.formulas.hacking.growTime(server, player) == time;
			} else {
				return ns.getGrowTime(server.hostname) == time;
			}
		case "hack":
			if (ns.fileExists("Formulas.exe", "home")) {
				return ns.formulas.hacking.hackTime(server, player) == time;
			} else {
				return ns.getHackTime(server.hostname) == time;
			}
	}
}

/**
 * Creates a call array for the set mode and maxmimum ram given.
 * @param {import('../NetscriptDefinitions').NS} ns netscript interface.
 * @param {number} mode mode of calls. can have MODE value as input.
 * @param {number} ram available ram to use.
 * @param {percentage} percentage percentage of calls. if mode is 2 (MODE.W) percentage is ignored.
 * @param {import('../NetscriptDefinitions').Server} server server.
 * @param {import('../NetscriptDefinitions').Player} player player to use.
 * @param {number} offset time between each call.
 * @param {number} safetime offset time between batches.
 * @param {number} start offset time for every call.
 * @returns {Call[]}
 */
export async function createCalls(
	ns,
	mode = MODE.HWGW,
	ram,
	percentage,
	server,
	player = ns.getPlayer(),
	offset = 30,
	safetime = 4 * offset,
	start = 0
) {
	let calls = [];

	const operationTime = getOperationTime(ns, server, player);
	const operationRam = getOperationRam(ns);

	switch (mode) {
		case MODE.HWGW: {
			let threadHack = Math.max(
				Math.ceil(
					percentage /
						(ns.fileExists("Formulas.exe", "home")
							? ns.formulas.hacking.hackPercent(server, player)
							: ns.hackAnalyze(server.hostname))
				),
				1
			);
			let potentialMoney =
				threadHack *
				(ns.fileExists("Formulas.exe", "home")
					? ns.formulas.hacking.hackPercent(server, player)
					: ns.hackAnalyze(server.hostname)) *
				server.moneyMax;
			let threadGrow =
				Math.max(
					Math.ceil(
						calculateGrowThreads(
							ns,
							server.hostname,
							server.moneyMax - potentialMoney
						)
					),
					1
				) + 1;

			let threadWeaken1 = Math.ceil(ns.hackAnalyzeSecurity(threadHack) / 0.05);
			let threadWeaken2 = Math.ceil(
				ns.growthAnalyzeSecurity(threadGrow) / 0.05
			);
			let operationThread = [
				threadHack,
				threadWeaken1,
				threadGrow,
				threadWeaken2,
			];

			let timeLimit = Math.floor(
				operationTime[INDEX.W] / (offset * 4 + safetime)
			);
			let ramBatch = [...operationRam];
			ramBatch.push(operationRam[INDEX.W]);
			if (ram / [...ramBatch].reduce((a, b) => a + b) < 1)
				throw new Error("Not enough ram!");

			ramBatch = ramBatch.map((v, i) => v * operationThread[i]);

			let ramLimit = Math.floor(ram / [...ramBatch].reduce((a, b) => a + b));
			let limit = Math.min(ramLimit, timeLimit, MAXLIMIT);

			let finishWeaken2 = 2 * offset + operationTime[INDEX.W];
			let finishHack = operationTime[INDEX.W] - offset;
			let finishGrow = operationTime[INDEX.W] + offset;

			let startWeaken2 = 2 * offset;
			let startHack = finishHack - operationTime[INDEX.H];
			let startGrow = finishGrow - operationTime[INDEX.G];

			ns.print("DEBUG:");
			ns.print("Limit: ", limit);
			ns.print("timeLimit: ", timeLimit);
			ns.print("ram Limit: ", ramLimit);
			ns.print(
				"Ram: ",
				ramBatch.reduce((a, b) => a + b)
			);
			ns.print("threads: ", operationThread);
			ns.print(
				"Percentage/Thread: ",
				ns.fileExists("Formulas.exe", "home")
					? ns.formulas.hacking.hackPercent(server, player)
					: ns.hackAnalyze(server.hostname)
			);

			for (let i = 0; i < limit; i++) {
				let weakenCall1 = new Call(
					"weaken",
					start + i * safetime,
					operationTime[INDEX.W] + start + i * safetime,
					threadWeaken1
				);
				let weakenCall2 = new Call(
					"weaken",
					startWeaken2 + start + i * safetime,
					finishWeaken2 + start + i * safetime,
					threadWeaken2
				);
				let hackCall = new Call(
					"hack",
					startHack + start + i * safetime,
					finishHack + start + i * safetime,
					threadHack
				);
				let growCall = new Call(
					"grow",
					startGrow + start + i * safetime,
					finishGrow + start + i * safetime,
					threadGrow
				);

				calls.push(...[weakenCall1, weakenCall2, hackCall, growCall]);
				ns.print("WAIT - Adding HWGW...");
				await ns.sleep(0);
			}
			break;
		}
		case MODE.GW: {
			let threadGrow = Math.max(
				Math.ceil(
					calculateGrowThreads(
						ns,
						server.hostname,
						server.moneyMax * percentage,
						server.cpuCores
					)
				),
				1
			);
			let threadWeaken = Math.ceil(ns.growthAnalyzeSecurity(threadGrow) / 0.05);

			let timeLimit = Math.floor(
				operationTime[INDEX.W] / (offset * 2 + safetime)
			);
			let ramBatch = [...operationRam];
			ramBatch.shift();
			if (ram / [...ramBatch].reduce((a, b) => a + b) < 1)
				throw new Error("Not enough ram!");
			let operationThread = [threadWeaken, threadGrow];

			ramBatch = ramBatch.map((v, i) => v * operationThread[i]);

			let ramLimit = Math.floor(ram / ramBatch.reduce((a, b) => a + b));
			let limit = Math.min(ramLimit, timeLimit, MAXLIMIT);

			let finishGrow = operationTime[INDEX.W] - offset;
			let startGrow = finishGrow - operationTime[INDEX.G];

			ns.print("DEBUG:");
			ns.print("Limit: ", limit);
			ns.print("timeLimit: ", timeLimit);
			ns.print("ram Limit: ", ramLimit);
			ns.print(
				"Ram: ",
				ramBatch.reduce((a, b) => a + b)
			);

			for (let i = 0; i < limit; i++) {
				let weakenCall = new Call(
					"weaken",
					start + i * safetime,
					operationTime[INDEX.W] + start + i * safetime,
					threadWeaken
				);
				let growCall = new Call(
					"grow",
					startGrow + start + i * safetime,
					finishGrow + start + i * safetime,
					threadGrow
				);
				calls.push(...[weakenCall, growCall]);
				ns.print("WAIT - Adding GW...");
				await ns.sleep(0);
			}
			break;
		}
		case MODE.W: {
			if (ram < operationRam[INDEX.W]) throw new Error("Not enough ram!");
			let threadWeaken = Math.max(
				Math.ceil(
					(ns.getServerSecurityLevel(server.hostname) - server.minDifficulty) /
						0.05
				),
				1
			);
			let timeLimit = Math.floor(operationTime[INDEX.W] / safetime);
			let ramLimit = Math.floor(ram / (operationRam[INDEX.W] * threadWeaken));
			let limit = Math.min(timeLimit, ramLimit, MAXLIMIT);

			ns.print("DEBUG:");
			ns.print("Limit: ", limit);
			ns.print("timeLimit: ", timeLimit);
			ns.print("ramLimit: ", ramLimit);
			ns.print("Ram: ", operationRam[INDEX.W] * threadWeaken);

			for (let i = 0; i < limit; i++) {
				let weakenCall = new Call(
					"weaken",
					start + i * safetime,
					operationTime[INDEX.W] + start + i * safetime,
					threadWeaken
				);
				calls.push(weakenCall);
				ns.print("WAIT - Adding W...");
				await ns.sleep(0);
			}
			break;
		}
	}
	ns.print("WAIT - Finished creating calls...");
	return calls;
}

export class Call {
	/** Creates a new call with a type, a thread count and a start and end time.
	 * @param {"weaken" | "grow" | "hack"} type Type of call
	 * @param {number} start Time of start.
	 * @param {number} end Time of end.
	 * @param {number} threads Count of threads.
	 */
	constructor(type, start, end, threads) {
		this.type = type;
		this.start = start;
		this.end = end;
		this.threads = threads;
	}

	/** @param {Call} operation */
	static getOperationScript(operation) {
		switch (operation.type) {
			case "weaken":
				return scriptWeaken;
			case "grow":
				return scriptGrow;
			case "hack":
				return scriptHack;
		}
	}

	getScript() {
		switch (this.type) {
			case "weaken":
				return scriptWeaken;
			case "grow":
				return scriptGrow;
			case "hack":
				return scriptHack;
		}
	}

	static convertType(type) {
		switch (type) {
			case "hack":
				return 0;
			case "weaken":
				return 1;
			case "grow":
				return 2;
		}
	}
}

export class Series {
	/**
	 * @param {number} start Time to start.
	 * @param {number} mode mode of series.
	 * @param {number} ram Amount of ram to use.
	 * @param {percentage} percentage Hacking percentage to use.
	 * @param {import('../NetscriptDefinitions').Server} server launch server.
	 * @param {import('../NetscriptDefinitions').Server} server target server.
	 * @param {number} offset Time between operations
	 */
	constructor(
		start = Date.now(),
		mode = MODE.HWGW,
		ram,
		server,
		target,
		percentage,
		offset = 30
	) {
		this.calls = [];
		this.start = start;
		this.mode = mode;
		this.server = server;
		this.target = target;
		this.end = undefined;
		this.ram = ram;
		this.percentage = percentage;
		this.offset = offset;
		this.built = false;
	}

	async build(ns) {
		ns.print("WAIT - Building series...");
		this.calls = await createCalls(
			ns,
			this.mode,
			this.ram,
			this.percentage,
			this.target,
			ns.getPlayer(),
			this.offset,
			5 * this.offset,
			this.start
		);
		this.built = typeof this.calls !== "undefined" && this.calls.length != 0;
		if (!this.built) throw new Error(`Building series failed! (${this.calls})`);
		return this.getEnd();
	}

	getEnd() {
		if (!this.built) throw new Error("Series is not built!");
		let sorted = [...this.calls].sort((a, b) => b.end - a.end); // high to low
		this.end = sorted[0].end;
		return this.end;
	}

	async init(ns, debug = false) {
		ns.print("WAIT - Initiating series...");
		if (!this.built) throw new Error("Series is not built!");
		this.start = Date.now();
		return await launchOperations(
			ns,
			this.server,
			this.target,
			this.calls,
			this.start,
			0,
			debug
		);
	}

	static updateTimings(operations, offset) {
		for (let operation of operations) {
			operation.start += offset;
			operation.end += offset;
		}
	}
}

export function nFormatter(num, digits = 2) {
	const neg = num < 0;
	if (neg) {
		num = -1 * num;
	}
	const lookup = [
		{
			value: 1,
			symbol: "",
		},
		{
			value: 1e3,
			symbol: "k",
		},
		{
			value: 1e6,
			symbol: "m",
		},
		{
			value: 1e9,
			symbol: "b",
		},
		{
			value: 1e12,
			symbol: "t",
		},
		{
			value: 1e15,
			symbol: "q",
		},
		{
			value: 1e18,
			symbol: "Q",
		},
	];
	const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
	var item = lookup
		.slice()
		.reverse()
		.find(function (item) {
			return num >= item.value;
		});
	let result = item
		? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol
		: "0";
	if (neg) {
		return "-" + result;
	}
	return result;
}

export function tFormatter(ticks, simple = true) {
	let seconds = ticks / 1000;
	if (seconds < 1) return ticks.toFixed(0) + "t";
	if (!simple && seconds > 60) {
		let minutes = Math.floor(seconds / 60);
		seconds -= minutes * 60;
		if (minutes > 60) {
			let hour = Math.floor(minutes / 60);
			minutes -= hour * 60;
			return (
				hour.toString() +
				"h " +
				minutes.toString() +
				"m " +
				seconds.toFixed(2) +
				"s"
			);
		}
		return minutes.toString() + "m " + seconds.toFixed(2) + "s";
	}
	return seconds.toFixed(2) + "s";
}
