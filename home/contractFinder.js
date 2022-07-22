/**
 * @param {import('../.vscode/NetscriptDefinitions').NS} ns 
 */
export async function main(ns) {
    let servers = await getAllServers(ns);
    let result = getAllContracts(ns, servers, true);
    let rows = table(result, true);
    for (const row of rows) {
        ns.tprint(row);
    }
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
function getAllContracts(ns, servers, red = true) {
    let result = [];
    for (let server of servers) {
        if (ns.ls(server, '.cct')){
            let found = ns.ls(server, '.cct');
            if (red && found.length == 0) continue;
            result.push([server, ...found]);
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

/**
 * Creates a table for the given entries.
 * @param {string[][]} values A 2-dimensional array, where each array represents one column.
 * @param {boolean} sep Wether or not the table should have row divisors.
 * @returns A string aray, ready to be printed.
 */
export function table(values, div = false) {
    let style = DefaultStyle();

    let col = values[0].length;
    for (let value of values) {
        col = Math.max(col, value.length);
    }

    for (let i = 0; i < values.length; i++) {
        if (col - values[i].length > 0){
            values[i].push(...Array(col - values[i].length).fill(' '));
        }
    }

    let lengths = Array(col).fill(0);
    for (let i = 0; i < values.length; i++) {
        let data = values[i];
        for (let j = 0; j < data.length; j++) {
            lengths[j] = Math.max(lengths[j], data[j].length);
        }
    }

    let head = makeSeperator(lengths, style[0][0], style[0][1], style[0][2], style[0][3]);
    let lines = makeLine(lengths, style[1][4], values);
    let butt = makeSeperator(lengths, style[2][0], style[2][1], style[2][2], style[2][3]);
    let sep = makeSeperator(lengths, style[1][0], style[1][1], style[1][2], style[1][3]);

    if (div) {
        let out = [head];
        for (let line of lines) {
            out.push(line);
            if (lines.indexOf(line) >= lines.length - 1) break;
            out.push(sep);
        }
        out.push(butt);
        return out;
   }

    return [head, ...lines, butt];
}

/**
 * Creates lines for each entry in `data`.
 * @param {number[]} lengths Maximum length of each array inside `data`.
 * @param {string} sep The seperator char between entries.
 * @param {string[][]} data A 2-dimensional array, where each array represents one column.
 * @returns An array with strings, for each entry inside `data`.
 */
function makeLine(lengths, sep, data) {
    let lines = [];
    for (let row of data) {
        let line = sep;
        for (let j = 0; j < row.length; j++) {
            let value = row[j];
            value = value.padEnd(lengths[j]);
            line += value;
            line += sep;
        }
        lines.push(line);
    }
    return lines;
}

/**
 * Creates a line, with a prefix, a suffix and a middle part, seperating each entry.
 * @param {number[]} lengths Lengths of each entry.
 * @param {string} prefix Prefix of the line.
 * @param {string} middle Middle part of the line.
 * @param {string} suffix Suffix of the line.
 * @param {string} line Segment to be used for filling entries in.
 * @returns A string representing a divisor of entries.
 */
function makeSeperator(lengths, prefix, middle, suffix, line) {
    let head = prefix;
    for (const length of lengths) {
        head = head.padEnd(head.length + length, line);
        if (lengths.indexOf(length) >= lengths.length - 1) {
            head += suffix;
            break;
        }
        head += middle;
    }
    return head;
}

export function DefaultStyle() {
	return [
		['┌', '┬', '┐', '─', '│'],
		['├', '┼', '┤', '─', '│'],
		['└', '┴', '┘', '─', '│']
	];
}