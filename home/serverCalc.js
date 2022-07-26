import {table} from './contractFinder';

/** @param {import('../.vscode/NetscriptDefinitions').NS} ns */
export async function main(ns) {
    const data = serverCalc();
    const printable = table(data, true);
    for (const string of printable) ns.tprint(string);
}

export function serverCalc() {
    const max = 20;
    let out = [];
    let ram = 2;

    for(let pow = 1; pow <= 20; pow++) {
        out.push([Math.pow(ram, pow) + 'GB', nFormatter(Math.pow(ram, pow) * 5.5e5) + '']);
    }
    return out;
}

function nFormatter(num, digits = 2) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "m" },
    { value: 1e9, symbol: "b" },
    { value: 1e12, symbol: "t" },
    { value: 1e15, symbol: "q" },
    { value: 1e18, symbol: "Q" }
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  let item = lookup.slice().reverse().find(function(item) {
    return num >= item.value;
  });
  return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
}