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

export function tradeIII(arr) {
    let first = 0;
    let firstIndex = [0,0];
    for(let buy of arr) {
        for (let sell of arr.slice(arr.indexOf(buy))) {
            if (sell - buy > first) {
                firstIndex = [arr.indexOf(buy), arr.indexOf(sell)];
                first = sell - buy;
            }
        }
    }
    let arr1 = arr.slice(0, firstIndex[0]);
    let arr2 = arr.slice(firstIndex[1]);

    let second = 0;
    for (let buy of arr1) {
        for (let sell of arr1.slice(arr1.indexOf(buy))) {
            second = Math.max(second, sell - buy);
        }
    }
    for (let buy of arr2) {
        for (let sell of arr2.slice(arr2.indexOf(buy))) {
            second = Math.max(second, sell - buy);
        }
    }
    return first + second;
}