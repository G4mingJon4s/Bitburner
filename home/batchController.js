import {
    Series,
    MODE,
    checkServerVariables
} from './batchUtil';
import { newWindow } from 'resize';

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL'); newWindow(ns, 800, 250);
    let host = ns.getHostname();
    let player = ns.getPlayer();
    let target = ns.args[0];
    let percentage = ns.args[1];
    let debug = ns.args[2];
    let plot = ns.args[3];

    // let dummy = {
    //     data: [[{"type":"weaken","start":0,"end":0,"threads:": 0}]]
    // }
    // await ns.write('batchData.txt', JSON.stringify(dummy));
    let next = 0;
    while (true) {
        let data = [];
        while (ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target)) {
            ns.print('PREP - Weakening...');
            let series = new Series(0, MODE.W, ns.getServerMaxRam(host) - ns.getServerUsedRam(host), ns.getServer(host), ns.getServer(target), percentage, 30); // TODO - Add Timing starting from script start instead of reset each series
            next = await series.build(ns);
            data.push(await series.init(ns, debug));
            await ns.sleep(500);
        }
        while (ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target)) {
            ns.print('PREP - Growing...');
            let series = new Series(0, MODE.GW, ns.getServerMaxRam(host) - ns.getServerUsedRam(host), ns.getServer(host), ns.getServer(target), percentage, 30); // TODO - Add Timing starting from script start instead of reset each series
            next = await series.build(ns);
            data.push(await series.init(ns, debug));
            await ns.sleep(500);
        }
        while (checkServerVariables(ns, ns.getServer(target))) {
            ns.print('FARM - Hacking...');
            let series = new Series(0, MODE.HWGW, ns.getServerMaxRam(host) - ns.getServerUsedRam(host), ns.getServer(host), ns.getServer(target), percentage, 30); // TODO - Add Timing starting from script start instead of reset each series
            next = await series.build(ns);
            data.push(await series.init(ns, debug));
            await ns.sleep(500);
        }
        // ns.print('DATA - Getting data...');
        // let stored = JSON.parse(await ns.read('batchData.txt'));
        // ns.print(stored);
        // stored.data.push(data);
        // ns.print(stored);
        // await ns.write('batchData.txt', JSON.stringify(stored));
    }
}

export function autocomplete(data, args){
    return [...data.servers];
}