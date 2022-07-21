export function tradeI(arr) {
    let best = 0;
    for (let buy of arr) {
        for (let sell of arr.slice(arr.indexOf(buy))) {
            best = Math.max(sell - buy, best);
        }
    }
    return best;
}

export function tradeII(arr) {
    //TBD
}