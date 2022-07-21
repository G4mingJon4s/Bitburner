/**
 * @param {import('../.vscode/NetscriptDefinitions').NS} ns 
 */
export async function main(ns) {
    let servers = await getAllServers(ns);
    let table = getAllContracts(ns, servers);
    log(ns, table);
    // nice terminal table here
}

/**
 * Gets all servers.
 * @param {import('../.vscode/NetscriptDefinitions').NS} ns netscript interface.
 * @returns {String[]} Array of all server names.
 */
export async function getAllServers(ns){
    let queue = ['home'];
    let result = [];
    while (queue.length > 0) {
        let current = queue.shift();
        result.push(current);
        let found = ns.scan(current);
        for(let poss of found) {
            if (!result.includes(poss)){
                queue.push(poss);
            }
        }
        await ns.sleep(0);
    }
    return result;
}

/**
 * @param {import('../.vscode/NetscriptDefinitions').NS} ns 
 */
function getAllContracts(ns, servers) {
    let result = [];
    for (let server of servers) {
        if (ns.ls(server, '.cct')){
            let found = ns.ls(server, '.cct');
            result.push({name: server, contracts: found});
        }
    }
    return result;
}

/**
 * @param {import('../.vscode/NetscriptDefinitions').NS} ns 
 */
function log(ns, table) {
    let length1 = 0;
    let length2 = 0;
    let names = [];
    let values = [];
    let rows = [];
    for(let data of table) {
        length1 = length1 > data.name.length ? length1 : data.name.length;
        length2 = length2 > data.contracts.toString().replace(',',', ').length ? length2 : data.contracts.toString().replace(',',', ').length;
    }
    for(let data of table) {
        let name = data.name.padEnd(length1,' ');
        let value = data.contracts.toString().replace(',',', ').padEnd(length2, ' ');
        names.push(name);
        values.push(value);
    }
    let head = "┌";
    head = head.padEnd(length1 + 1, '-');
    head += '┬';
    head = head.padEnd(head.length + length2, '-');
    head += '┐';
    let butt = "└";
    butt = butt.padEnd(length1 + 1, '-');
    butt += '┴';
    butt = butt.padEnd(butt.length + length2, '-');
    butt += '┘';
    rows.push(head);
    for(let i = 0; i < names.length; i++){
        let name = names[i];
        let value = values[i];
        rows.push('|' + name + '|' + value + '|');
    }
    rows.push(butt);
    for(let row of rows){
        ns.tprint(row);
    }
}

export function DefaultStyle() {
	return [
		['┌', '┬', '┐', '─', '│'],
		['├', '┼', '┤', '─', '│'],
		['└', '┴', '┘', '─', '│']
	];
}