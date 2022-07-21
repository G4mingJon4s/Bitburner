export async function mergeOverlap(ns, arr) {
    let sorted = arr.sort((a, b) => (a[0] - b[0]));

    while (true) {
        let merged = false;
        for (let i = 0; i < sorted.length; i++) {
            let a = sorted[i];
            ns.print(a, i);
            for (let j = 0; j < sorted.length; j++) {
                if (j == i) continue;
                let b = sorted[j];
                ns.print(b, i);
                if (hasOverlap(a, b)) {
                    sorted.splice(i, 1);
                    sorted.splice(j, 1);
                    sorted.push(merge(a, b));
                    merged = true;
                    ns.print(merged);
                    break;
                }
            }
            if (merged) break;
        }
        await ns.sleep(1);
        if (!merged) break;
        sorted = sorted.sort((a, b) => (a[0] - b[0]));
    }
    return sorted;
}

function hasOverlap(a, b) {
    if (a[0] === b[0] || a[1] === b[1]) return true;
    return a[0] < b[0] ? b[0] <= a[1] : a[0] <= b[1];
}

function merge(a, b) {
    return [Math.min(a[0], b[0]), Math.max(a[1], b[1])];
}

export async function main(ns) {
    await runTests(ns);
}

async function runTests(ns) {
    let data = [{input: [[1, 10],[2, 5],[11, 17],[11, 17],[14, 23],[23, 33],[24, 29],],output: [[1, 10],[11, 33],],},{input: [[1, 11],[5, 13],[11, 17],[12, 22],[14, 19],[15, 16],],output: [[1, 22]],},{input: [[3, 13],[6, 16],[8, 13],[9, 11],[9, 12],[9, 18],[13, 17],[13, 21],[16, 19],[16, 26],[17, 24],[17, 27],[23, 27],[23, 30],[24, 30],[25, 28],],output: [[3, 30]],},{input: [[1, 7],[5, 11],[6, 11],[6, 11],[6, 16],[13, 17],[15, 25],[16, 25],[17, 22],[17, 25],[20, 21],[21, 29],],output: [[1, 29]],},{input: [[2, 11],[4, 14],[5, 15],[7, 8],[11, 16],[16, 22],[16, 26],[17, 19],[17, 26],[19, 20],[19, 23],[20, 22],[20, 27],[21, 25],[22, 25],[23, 25],],output: [[2, 27]],},{input: [[2, 7],[6, 10],[8, 9],[10, 19],[13, 18],[15, 17],[19, 29],[21, 23],[23, 29],],output: [[2, 29]],},{input: [[3, 9],[5, 6],[13, 22],[16, 26],[18, 28],[23, 28],[25, 33],],output: [[3, 9],[13, 33],],},{input: [[2, 12],[7, 8],[7, 15],[7, 16],[9, 12],[10, 17],[12, 16],[12, 20],[14, 20],[16, 24],[19, 28],[20, 28],[24, 33],[25, 29],[25, 34],],output: [[2, 34]],},{input: [[1, 7],[5, 10],[6, 8],[6, 14],[11, 17],[13, 16],[13, 19],[17, 27],[19, 26],[20, 21],],output: [[1, 27]],},{input: [[2, 11],[3, 7],[3, 9],[3, 10],[5, 10],[13, 16],[14, 17],[14, 21],[15, 20],[20, 22],[21, 29],[22, 28],[23, 25],[23, 29],[25, 29],],output: [[2, 11],[13, 29],],},];
    for(let test of data) {
        let out = test.output;
        let inp = test.input;
        let guess = await mergeOverlap(ns, inp);
        ns.tprint(guess);
        ns.tprint(out);
    }
}