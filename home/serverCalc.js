import { table } from "./tables";

/** @param {import('../NetscriptDefinitions').NS} ns */
export async function main(ns) {
  const data = serverCalc(ns);
  const printable = table(data, false);
  ns.tprint(printable);
}

/** @param {import('../NetscriptDefinitions').NS} ns */
export function serverCalc(ns, visual = true) {
  return new Array(Math.log2(ns.getPurchasedServerMaxRam()))
    .fill()
    .map((a, i) => [
      visual ? gbFormatter(Math.pow(2, i + 1)) : Math.pow(2, i + 1),
      visual
        ? nFormatter(ns.getPurchasedServerCost(Math.pow(2, i + 1)))
        : ns.getPurchasedServerCost(Math.pow(2, i + 1)),
    ]);
}

export function getMaxServerPossible(ns) {
  const values = serverCalc(ns, false);
  const max = [...values]
    .reverse()
    .find((value) => ns.getPlayer().money >= parseInt(value[1]));
  return max;
}

export function nFormatter(num, digits = 2) {
  const neg = num < 0;
  if (neg) {
    num = -1 * num;
  }
  const lookup = [
    { value: 1, symbol: " " },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "m" },
    { value: 1e9, symbol: "b" },
    { value: 1e12, symbol: "t" },
    { value: 1e15, symbol: "q" },
    { value: 1e18, symbol: "Q" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value;
    });
  let result = item
    ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol
    : "0";
  if (neg) {
    return "-" + result;
  }
  return result;
}

export function gbFormatter(num, digits = 2) {
  const neg = num < 0;
  if (neg) {
    num = -1 * num;
  }
  const lookup = [
    { value: 1, symbol: "GB" },
    { value: 1024, symbol: "TB" },
    { value: 1048576, symbol: "PB" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value;
    });
  let result = item
    ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol
    : "0";
  if (neg) {
    return "-" + result;
  }
  return result;
}

export function tFormatter(ticks, simple = true) {
  let seconds = ticks / 1000;
  if (seconds < 1) return ticks.toFixed(0) + "t";
  if (!simple && seconds > 60) {
    let minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    if (minutes > 60) {
      let hour = Math.floor(minutes / 60);
      minutes -= hour * 60;
      return (
        hour.toString() +
        "h " +
        minutes.toString() +
        "m " +
        seconds.toFixed(2) +
        "s"
      );
    }
    return minutes.toString() + "m " + seconds.toFixed(2) + "s";
  }
  return seconds.toFixed(2) + "s";
}
