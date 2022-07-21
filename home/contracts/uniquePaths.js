export function sumPathsI(x, y) {
    let val = fact(x+y-2);
    return val / (fact(x-1) * fact(y-1));
}

export function fact(n) {
    if (n < 2) return 1;
    return n * fact(n - 1);
}

export function sumPathsII(ns, input) {
    let pos = {x: 0, y: 0};

    function perm(pos, grid, paths = [], path = []) {
        path.push(pos);
        ns.print(JSON.stringify(pos));
        if (pos.x === grid[pos.y].length - 1 && pos.y === grid.length - 1) {
            return path;
        }
        if (canMoveRight(pos, grid)) {
            let result = perm({x: pos.x + 1,y: pos.y}, grid, paths, path);
            ns.print(result, 1);
            if (result.length != 0) paths.push(result);
        }
        if (canMoveDown(pos, grid)) {
            let result = perm({x: pos.x,y: pos.y + 1}, grid, paths, path);
            ns.print(result, 2);
            if (result.length != 0) paths.push(result);
        }
        return paths;
    }
    let paths = perm(pos, input);
    ns.print(paths);
    return paths.length;
}

function canMoveRight(pos, grid) {
    let colM  = grid[pos.y].length - 1;
    if (pos.x + 1 >= colM) return false;
    let right = grid[pos.y][pos.x + 1];
    return right === 0;
}

function canMoveDown(pos, grid) {
    let rowM = grid.length - 1;
    if (pos.y + 1 >= rowM) return false;
    let down = grid[pos.y + 1][pos.x];
    return down === 0;
}

/**
 * 
 * @param {import('../../.vscode/NetscriptDefinitions').NS} ns
 */
export async function main(ns) {
    ns.disableLog('ALL'); ns.clearLog(); ns.tail();
    let tests = [{input: [[0, 0, 0],[0, 0, 0],[1, 0, 0],],output: 5,},{input: [[0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 1, 0, 0, 0],[0, 0, 0, 0, 0, 1, 0, 0],[0, 0, 0, 0, 0, 0, 1, 0],[0, 0, 0, 1, 0, 1, 0, 0],[0, 0, 0, 0, 0, 0, 0, 1],[0, 0, 0, 0, 0, 0, 0, 0],],output: 202,},{input: [[0, 0],[0, 0],[0, 1],[0, 0],[0, 0],[0, 0],[0, 1],[0, 0],[0, 0],[1, 0],[0, 0],],output: 2,},{input: [[0, 0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 1, 0, 0, 0, 0, 1, 0],[1, 1, 0, 1, 1, 0, 1, 0, 0],[0, 0, 0, 0, 0, 0, 0, 1, 1],[0, 0, 0, 0, 1, 0, 0, 0, 0],[0, 0, 0, 0, 1, 0, 0, 0, 1],[0, 0, 0, 0, 1, 0, 0, 0, 0],[0, 1, 0, 0, 1, 0, 0, 1, 0],[0, 0, 0, 0, 0, 0, 0, 1, 0],[0, 0, 0, 0, 0, 0, 0, 0, 0],],output: 240,},{input: [[0, 0, 1, 0, 0, 0, 1, 0, 0, 0],[1, 0, 0, 0, 0, 0, 0, 1, 0, 0],[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],[1, 1, 0, 0, 0, 0, 0, 0, 0, 0],[0, 0, 0, 0, 0, 0, 0, 1, 0, 0],[1, 0, 0, 0, 0, 0, 0, 1, 0, 0],],output: 102,},];
    let input = tests[0].input;
    let output = tests[0].output;
    if (output != sumPathsII(ns, input)) ns.print('FAILED');
}