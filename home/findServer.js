import {getAllServers} from './contractFinder';

/**
 * @param {import('../.vscode/NetscriptDefinitions').NS} ns 
 */
 export async function main(ns) {
    let target = ns.args[0];
    if (target == 1) {
        for(let name of await getAllServers(ns)){
            ns.tprint(name);
        }
        return;
    }
    if (target == 2) {
        for (let name of await getAllServers(ns)){
            if (ns.hasRootAccess(name)) ns.tprint(name);
        }
        return;
    }
    try {ns.getServer( target); } catch { ns.alert(`Target is not a valid server!`); return; }
    let route = await findServer(ns, target);
    ns.tprint(convertToConnect(route));
}

/**
 * @param {import('../.vscode/NetscriptDefinitions').NS} ns 
 * @param {String} target
 */
export async function findServer(ns, target) {
    /**
     * @param {import('../.vscode/NetscriptDefinitions').NS} ns 
     * @param {String} current
     * @param {String} target
     * @returns {String[] | undefined}
     */
    async function perm(ns, current, target, path = []) {
        await ns.sleep(1);
        path.push(current);
        if (path.includes(target)) return path;
        let next = await ns.scan(current);
        next = next.filter(s => !path.includes(s));
        if (next.length == 0) return undefined;
        for (let s of next) {
            let res = await perm(ns, s, target, [...path]);
            if (typeof res !== "undefined") {
                return res;
            }
        }
    }
    return await perm(ns, 'home', target);
}

/**
 * Converts an array of server names to a copy-able connect route
 * @param {string[]} arr
 * @returns {String} printed array
 */
export function convertToConnect(arr) {
    let out = '';
    let prefix = 'connect ';
    let suffix = '; ';
    for(let name of arr) {
        if (name == 'home') {
            out += name;
            out += suffix;
            continue;
        }
        out += prefix;
        out += name;
        out += suffix;
    }
    return out;
}

export function autocomplete(data, args) {
    return [...data.servers];
}