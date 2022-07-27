import {getAllServers} from './contractFinder';

/**
 * @param {import('../.vscode/NetscriptDefinitions').NS} ns 
 */
 export async function main(ns) {
    let exclude = [...ns.args];
    let servers = await getAllServers(ns);
    servers = servers.filter((name) => (!exclude.includes(name)));
    let sum = 0;
    for (let name of servers) {
        let threads = Math.floor((ns.getServerMaxRam(name) - ns.getServerUsedRam(name)) / ns.getScriptRam('sharing.js', 'home'));
        if (threads == 0 || !ns.hasRootAccess(name)) continue;
        sum += threads;
        await ns.scp('sharing.js', name);
        ns.tprint(`sharing on ${name} with ${threads} threads.`);
        ns.exec('sharing.js', name, threads);
    }
    let power = 1 + Math.log(sum) / 25;
    ns.tprint(`Total threads: ${sum}, resulting in a power of ${(power * 100).toFixed(2)}%`)
}