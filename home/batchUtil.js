import { calculateGrowThreads } from './lambert';

import { httpPut, httpPost } from './sendJson';

export const INDEX = {
    H: 0,
    W1: 1,
    G: 2,
    W2: 3,
    W: 1
};
export const MODE = {
    HWGW: 0,
    GW: 1,
    W: 2
};

const scriptWeaken = 'c-weaken.js';
const scriptGrow = 'c-grow.js';
const scriptHack = 'c-hack.js';
const dataJson = 'data.txt';

/** @param {import('../.vscode/NetscriptDefinitions').NS} ns */
export async function main(ns) {
    // ns.disableLog('ALL');
    let calls = await createCalls(ns, ns.args[0], 1048576, 0.05, ns.getServer('the-hub'), ns.getPlayer());
    ns.print(JSON.stringify(calls));
    await httpPost('http://localhost:3000/batchlog', JSON.stringify(calls));
}

/**
 * 
 * @param {import('../.vscode/NetscriptDefinitions').NS} ns netscript interface.
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
 * @param {import('../.vscode/NetscriptDefinitions').NS} ns 
 * @param {import('../.vscode/NetscriptDefinitions').Server} server 
 * @param {import('../.vscode/NetscriptDefinitions').Player} player
 * @returns {Number[]} Array with Times of the operation scripts.
 */
export function getOperationTime(ns, server, player = ns.getPlayer()) {
    let out = [];
    if (!ns.fileExists('Formulas.exe', 'home')){
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
 * @param {import('../.vscode/NetscriptDefinitions').NS} ns 
 * @param {import('../.vscode/NetscriptDefinitions').Server} server 
 * @param {import('../.vscode/NetscriptDefinitions').Server} target 
 * @param {Call[]} operationsIn
 * @param {number} offset 
 */
export async function launchOperations(ns, server, target, operationsIn, start = Date.now(), safeWindow = 0, debug = false) {
    let operations = operationsIn.sort((a,b) => (a.start - b.start)); // low to high
    if (debug) await ns.write('batchDebug.txt', JSON.stringify(operations), 'w');
    let sent = [];
    ns.print(`WAIT - Starting launching... (Start: ${Date.now() - start})`)
    for (let operation of operations) {
        let now = Date.now() - start;
        if (now + 10 < operation.start) {
            let delay = operation.start - now;
            ns.print(`WAIT - waiting for deploy window... (Time: ${delay.toFixed(2)})`);
            await ns.sleep(delay);
            now = Date.now() - start;
        }
        let time = 2;
        let count = 0;
        while (!checkServerVariables(server)) {
            ns.sleep(time);
            ns.print('WAIT - not safe to deploy...');
            now = Date.now() - start;
            if(count > 1000) ns.print('WARNING - Long checking time...');
            count++;
        };
        Series.updateTimings(operations, time * count);
        if (server.maxRam - ns.getServerUsedRam(server.hostname) < getOperationRam(ns)[Call.convertType(operation.type)] * operation.threads) {
            ns.print('ERROR - Not enough ram!');
            now = Date.now() - start;
            if (sent.length == 0) return [];
            await ns.sleep(sent[sent.length - 1].end - now);
            return sent;
        }
        sent.push(operation);
        ns.exec(operation.getScript(), server.hostname, operation.threads, target.hostname, Date.now());
        ns.print('WAIT - launched: ', operation.type, ' ', now.toFixed(2), ' ', operation.threads.toFixed(2));
        await ns.sleep(safeWindow);
    }
    ns.print('WAIT - Finished initiating...');
    let now = Date.now() - start;
    ns.print(`WAIT - Waiting for calls... (Time: ${(sent[sent.length - 1].end - now).toFixed(2)})`)
    await ns.sleep(sent[sent.length - 1].end - now);
    return sent;
}

export function convertType(type){
    switch (type) {
        case 'weaken':
            return INDEX.W;
        case 'grow':
            return INDEX.G;
        case 'hack':
            return INDEX.H;
    }
}

/**
 * 
 * @param {import('../.vscode/NetscriptDefinitions').Server} server 
 */
export function checkServerVariables(server) {
    return server.moneyAvailable == server.moneyMax && server.minDifficulty == server.hackDifficulty;
}

/**
 * 
 * @param {import('../.vscode/NetscriptDefinitions').NS} ns 
 * @param {import('../.vscode/NetscriptDefinitions').Server} server 
 * @param {"weaken" | "grow" | "hack"} type 
 * @param {Number} time 
 * @param {import('../.vscode/NetscriptDefinitions').Player} player 
 * @returns 
 */
export function checkTimingChange(ns, server, type, time, player = ns.getPlayer()){
    switch (type) {
        case 'weaken':
            if (ns.fileExists('Formulas.exe','home')){
                return ns.formulas.hacking.weakenTime(server, player) == time;
            } else {
                return ns.getWeakenTime(server.hostname) == time;
            }
        case 'grow':
            if (ns.fileExists('Formulas.exe','home')){
                return ns.formulas.hacking.growTime(server, player) == time;
            } else {
                return ns.getGrowTime(server.hostname) == time;
            }
        case 'hack':
            if (ns.fileExists('Formulas.exe','home')){
                return ns.formulas.hacking.hackTime(server, player) == time;
            } else {
                return ns.getHackTime(server.hostname) == time;
            }
    }
}

/**
 * Creates a call array for the set mode and maxmimum ram given.
 * @param {import('../.vscode/NetscriptDefinitions').NS} ns netscript interface.
 * @param {number} mode mode of calls. can have MODE value as input.
 * @param {number} ram available ram to use.
 * @param {percentage} percentage percentage of calls. if mode is 2 (MODE.W) percentage is ignored.
 * @param {import('../.vscode/NetscriptDefinitions').Server} target server.
 * @param {import('../.vscode/NetscriptDefinitions').Player} player player to use.
 * @param {number} offset time between each call.
 * @param {number} safetime offset time between batches.
 * @param {number} start offset time for every call.
 * @returns {Call[]}
 */
export async function createCalls(ns, mode = MODE.HWGW, ram, percentage, server, player = ns.getPlayer(), offset = 30, safetime = 2 * offset, start = 0) {
    let calls = [];

    const operationTime = getOperationTime(ns, server, player);
    const operationRam = getOperationRam(ns);

    switch (mode) {
        case MODE.HWGW: {
            let threadHack;
            if (ns.fileExists('Formulas.exe', 'home')){
                threadHack = Math.floor(ns.formulas.hacking.hackPercent(server, player) / percentage) >= 1 ? Math.floor(ns.formulas.hacking.hackPercent(server, player) / percentage) : 1;
            } else {
                threadHack = Math.floor(ns.hackAnalyze(server.hostname) / percentage) >= 1 ? Math.floor(ns.hackAnalyze(server.hostname) / percentage) : 1;
            }
            let potentialMoney = threadHack * ns.hackAnalyze(server.hostname);
            let threadGrow = Math.ceil(calculateGrowThreads(ns, server.hostname, potentialMoney)) + 1;

            let threadWeaken1 = Math.ceil(threadHack * 0.002 / 0.05);
            let threadWeaken2 = Math.ceil(threadGrow * 0.004 / 0.05);
            let operationThread = [threadHack, threadWeaken1, threadGrow, threadWeaken2];

            let timeLimit = Math.floor(operationTime[INDEX.W] / (offset * 4 + safetime));
            let ramBatch = [...operationRam];
            ramBatch.push(operationRam[INDEX.W]);
            if (server.maxRam - ns.getServerUsedRam(server.hostname) < ramBatch) throw new Error('Not enough ram!');

            for (let i = 0; i < ramBatch.length; i++) ramBatch[i] *= operationThread[i];

            let ramLimit = Math.floor(ram / [...ramBatch].reduce((a,b) => (a + b)));
            let limit = timeLimit > ramLimit ? ramLimit : timeLimit;
            while (limit * [...ramBatch].reduce((a,b) => (a + b)) > ram && limit - 1 > 0){
                limit--;
                ns.print('WAIT - Lowering limit...');
            }

            let finishWeaken2 = 2 * offset + operationTime[INDEX.W];
            let finishHack = operationTime[INDEX.W] - offset;
            let finishGrow = operationTime[INDEX.W] + offset;

            let startWeaken2 = 2 * offset;
            let startHack = finishHack - operationTime[INDEX.H];
            let startGrow = finishGrow - operationTime[INDEX.G];

            ns.print('DEBUG:');
            ns.print('Limit: ', limit);
            ns.print('timeLimit: ', timeLimit);
            ns.print('ram Limit: ', ramLimit);
            ns.print('ramBatch: ', operationRam);

            for (let i = 0; i < limit; i++) {
                let weakenCall1 = new Call('weaken', start + (i * safetime), operationTime[INDEX.W] + start + (i * safetime), threadWeaken1);
                let weakenCall2 = new Call('weaken', startWeaken2 + start + (i * safetime), finishWeaken2 + start + (i * safetime), threadWeaken2);
                let hackCall = new Call('hack', startHack + start + (i * safetime), finishHack + start + (i * safetime), threadHack);
                let growCall = new Call('grow', startGrow + start + (i * safetime), finishGrow + start + (i * safetime), threadGrow);

                calls.push(...[weakenCall1, weakenCall2, hackCall, growCall]);
                ns.print('WAIT - Adding HWGW...');
                await ns.sleep(0);
            }
            break;
        }
        case MODE.GW: {
            let threadGrow = ns.growthAnalyze(server.hostname, 1 + percentage, server.cpuCores);
            threadGrow = threadGrow >= 1 ? Math.ceil(threadGrow) : 1;
            let threadWeaken = Math.ceil(threadGrow * 0.004 / 0.05);

            let timeLimit = Math.floor(operationTime[INDEX.W] / (offset * 2 + safetime));
            let ramBatch = [...operationRam];
            ramBatch.shift();
            if (server.maxRam - ns.getServerUsedRam(server.hostname) < ramBatch) throw new Error('Not enough ram!');
            let operationThread = [threadWeaken, threadGrow];

            for (let i = 0; i < ramBatch.length; i++) ramBatch[i] *= operationThread[i];

            let ramLimit = Math.floor(ram / [...ramBatch].reduce((a,b) => (a + b)));
            let limit = timeLimit > ramLimit ? ramLimit : timeLimit;
            while (limit * [...ramBatch].reduce((a,b) => (a + b)) > ram && limit - 1 > 0){
                limit--;
                ns.print('WAIT - Lowering limit...');
            }

            let finishGrow = operationTime[INDEX.W] - offset;
            let startGrow = finishGrow - operationTime[INDEX.G];

            ns.print('DEBUG:');
            ns.print('Limit: ', limit);
            ns.print('timeLimit: ', timeLimit);
            ns.print('ram Limit: ', ramLimit);
            ns.print('ramBatch: ', operationRam);

            for (let i = 0; i < limit; i++) {
                let weakenCall = new Call('weaken', start + (i * safetime), operationTime[INDEX.W] + start + (i * safetime), threadWeaken);
                let growCall = new Call('grow', startGrow + start + (i * safetime), finishGrow + start + (i * safetime), threadGrow);
                calls.push(...[weakenCall, growCall]);
                ns.print('WAIT - Adding GW...');
                await ns.sleep(0);
            }
            break;
        }
        case MODE.W: {
            let timeLimit = Math.floor(operationTime[INDEX.W] / safetime);
            let valueLimit = Math.ceil((ns.getServerSecurityLevel(server.hostname) - server.minDifficulty) / 0.05);
            let limit = Math.min(timeLimit, valueLimit);
            if (server.maxRam - ns.getServerUsedRam(server.hostname) < operationRam[INDEX.W]) throw new Error('Not enough ram!');
            let threadWeaken = Math.max(Math.floor((ram / operationRam[INDEX.W]) / limit), 1);
            while (limit * threadWeaken * operationRam[INDEX.W] > ram && limit - 1 > 0) {
                limit--;
                ns.print('WAIT - Lowering limit...');
            }

            ns.print('DEBUG:');
            ns.print('Limit: ', limit);
            ns.print('timeLimit: ', timeLimit);
            ns.print('valueLimit: ', valueLimit);
            ns.print('ramBatch: ', operationRam);

            for (let i = 0; i < limit; i++) {
                let weakenCall = new Call('weaken', start + (i * safetime), operationTime[INDEX.W] + start + (i * safetime), threadWeaken);
                calls.push(weakenCall);
                ns.print('WAIT - Adding W...');
                await ns.sleep(0);
            }
            break;
        }
    }
    ns.print('WAIT - Finished creating calls...');
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
            case 'weaken':
                return scriptWeaken;
            case 'grow':
                return scriptGrow;
            case 'hack':
                return scriptHack;
        }
    }

    getScript() {
        switch (this.type) {
            case 'weaken':
                return scriptWeaken;
            case 'grow':
                return scriptGrow;
            case 'hack':
                return scriptHack;
        }
    }

    static convertType(type) {
        switch (type) {
            case 'hack': return 0
            case 'weaken': return 1
            case 'grow': return 2
        }
    }
}

export class Series {
    /**
     * @param {number} start Time to start.
     * @param {number} mode mode of series.
     * @param {number} ram Amount of ram to use.
     * @param {percentage} percentage Hacking percentage to use.
     * @param {import('../.vscode/NetscriptDefinitions').Server} server launch server.
     * @param {import('../.vscode/NetscriptDefinitions').Server} server target server.
     * @param {number} offset Time between operations
     */
    constructor(start = Date.now(), mode = MODE.HWGW, ram, server, target, percentage, offset = 30) {
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
        ns.print('WAIT - Building series...');
        this.calls = await createCalls(ns, this.mode, this.ram, this.percentage, this.target, ns.getPlayer(), this.offset, 5 * this.offset, this.start);
        this.built = typeof this.calls !== "undefined" && this.calls.length != 0;
        if (!this.built) throw new Error(`Building series failed! (${this.calls})`);
        return this.getEnd();
    }

    getEnd() {
        if (!this.built) throw new Error('Series is not built!');
        let sorted = [...this.calls].sort((a,b) => (b.end - a.end)); // high to low
        this.end = sorted[0].end;
        return this.end;
    }

    async init(ns, debug = false) {
        ns.print('WAIT - Initiating series...');
        if (!this.built) throw new Error('Series is not built!');
        this.start = Date.now();
        return await launchOperations(ns, this.server, this.target, this.calls, this.start, 0, debug);
    }

    static updateTimings(operations, offset) {
        for(let operation of operations) {
            operation.start += offset;
            operation.end += offset;
        }
    }
}