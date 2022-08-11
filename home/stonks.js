import { table } from "./tables";
import { nFormatter } from "./serverCalc";
import { newWindow } from "./resize";
import { resizeWindow } from "./resize";

const RATES = {
  short: {
    buy: 0.4,
    sell: 0.45,
  },
  long: {
    buy: 0.6,
    sell: 0.55,
  },
};

const LOGSIZE = 12;
const SCRIPTNAME = "stonks.js";

/** @param {import('../.vscode/NetscriptDefinitions').NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();

  const percentage =
    ns.args[0] !== undefined && ns.args[0] < 95 ? ns.args[0] : 95;
  const hasApi = ns.getPlayer().has4SDataTixApi;
  const canShort =
    ns.getOwnedSourceFiles().some((s) => s.n == 8 && s.lvl >= 2) ||
    ns.getPlayer().bitNodeN == 8;
  const symbols = ns.stock.getSymbols();

  let money = (ns.getPlayer().money * percentage) / 100;

  if (money < 1e7) return ns.tprint("ERROR: Not enough money!");
  newWindow(ns, 900, hasApi ? 250 : 700);

  let logs = !hasApi ? await getLogs(ns) : undefined;

  while (true) {
    money = (ns.getPlayer().money * percentage) / 100;
    if (!hasApi) logs = updateLogs(ns, logs);

    const entry = findBestStock(
      ns,
      money - 1e6,
      canShort,
      hasApi ? undefined : convertLogs(logs)
    );
    if (entry === undefined)
      return ns.tprint("ERROR: Could not find a viable stock!");
    const stock = new Stock(
      ns,
      entry.symbol,
      entry.foreCast,
      entry.buyableShares,
      entry.price,
      entry.short
        ? ns.stock.getAskPrice(entry.symbol)
        : ns.stock.getBidPrice(entry.symbol),
      entry.short
    );

    while (
      stock.update(
        ns,
        hasApi
          ? ns.stock.getForecast(stock.symbol)
          : convertLogs(logs)[symbols.indexOf(stock.symbol)]
      )
    ) {
      const ECPBidPrice = hasApi ? ns.stock.getBidPrice("ECP") : logs[0].at(-1);
      while (!isMarketUpdated(ns, ECPBidPrice)) {
        await ns.sleep(1000);
      }
      await ns.sleep(10);
    }
    await ns.sleep(10);
  }
}

/** @param {import('../.vscode/NetscriptDefinitions').NS} ns */
export function isMarketUpdated(ns, ECPBidPrice) {
  return ECPBidPrice != ns.stock.getBidPrice("ECP");
}

/** @param {import('../.vscode/NetscriptDefinitions').NS} ns */
export async function getLogs(ns) {
  ns.print(`INFO: Getting stock prices... (0 / ${LOGSIZE})`);

  const timeRegex = /^\[(\d{2}:){2}\d{2} (\d{2}-){2}\d{4}\]/;
  const symbols = ns.stock.getSymbols();
  let logs = Array(symbols.length)
    .fill()
    .map(() => []);

  while (logs[0].length < LOGSIZE) {
    let tData = [["Symbol", "Price", "Forecast"]];
    for (const symbol of symbols) {
      logs[symbols.indexOf(symbol)].push(ns.stock.getBidPrice(symbol));
      tData.push([
        symbol,
        nFormatter(ns.stock.getBidPrice(symbol)),
        convertToForeCast(logs[symbols.indexOf(symbol)]).toFixed(3),
      ]);
    }

    const isFull = logs[0].length >= LOGSIZE;

    let tail = ns
      .getScriptLogs()
      .reverse()
      .map((s) => s.replace(timeRegex, "").trim());
    ns.clearLog();
    if (isFull) {
      tail[0] = table(tData, true, false);
      tail[1] = `INFO: Getting stock prices... (${logs[0].length} / ${LOGSIZE})`;
    } else {
      tail.shift();
      tail.shift();
    }
    tail.reverse().forEach((s) => ns.print(s));

    while (!isMarketUpdated(ns, logs[0].at(-1))) {
      await ns.sleep(500);
    }
  }

  resizeWindow(SCRIPTNAME, 900, 250);

  return logs;
}

/** @param {import('../.vscode/NetscriptDefinitions').NS} ns */
export function updateLogs(ns, logs) {
  const symbols = ns.stock.getSymbols();

  for (const i in logs) {
    logs[i].shift();
    logs[i].push(ns.stock.getBidPrice(symbols[i]));
  }

  return logs;
}

export function convertLogs(logs) {
  return logs.map((val) => convertToForeCast(val));
}

export function convertToForeCast(log) {
  const up = log.reduce((acc, val, i) => acc + val > log[i - 1]);

  return up / log.length;
}

/** @param {import('../.vscode/NetscriptDefinitions').NS} ns */
export function findBestStock(
  ns,
  money,
  canShort = false,
  foreCasts = undefined
) {
  const symbols = ns.stock.getSymbols();
  const hasApi = typeof foreCasts === "undefined";
  const data = symbols.map((x, i) => {
    const symbol = x;
    const foreCast = hasApi ? ns.stock.getForecast(symbol) : foreCasts[i];
    const shares = ns.stock.getMaxShares(symbol);
    const short = foreCast < RATES.long.buy;
    const price = short
      ? ns.stock.getBidPrice(symbol)
      : ns.stock.getAskPrice(symbol);
    const buyableShares = Math.min(
      Math.floor(Math.floor(money) / Math.ceil(price)),
      shares
    );
    return {
      symbol,
      foreCast,
      shares,
      short,
      price,
      buyableShares,
    };
  });
  const possible = data.filter(
    (entry) =>
      entry.foreCast > RATES.long.buy ||
      (entry.foreCast < RATES.short.buy && canShort)
  );
  const best = possible
    .map((entry) => {
      return entry.short ? 0.5 - entry.foreCast : entry.foreCast - 0.5;
    })
    .reduce((acc, n, i, arr) => {
      return arr[acc] < n ? i : acc;
    }, 0);
  return possible[best];
}

// /** @param {import('../.vscode/NetscriptDefinitions').NS} ns */
// export function findBestStock(
//   ns,
//   money,
//   canShort = false,
//   foreCasts = undefined
// ) {
//   const mode = typeof foreCasts !== "undefined";
//   const symbols = ns.stock.getSymbols();
//   let possible = [];

//   for (const symbol of symbols) {
//     const foreCast = mode
//       ? foreCasts[symbols.indexOf(symbol)]
//       : ns.stock.getForecast(symbol);
//     const shares = ns.stock.getMaxShares(symbol);
//     let price = ns.stock.getAskPrice(symbol);
//     let profitable = foreCast > RATES.long.buy;
//     let short = false;

//     if (!profitable && canShort) {
//       price = ns.stock.getBidPrice(symbol);
//       profitable = foreCast < RATES.short.buy;
//       short = true;
//     }

//     const buyableShares = Math.min(
//       Math.floor(Math.floor(money) / Math.ceil(price)),
//       shares
//     );

//     if (profitable) {
//       const entry = {
//         symbol,
//         foreCast,
//         shares,
//         buyableShares,
//         price,
//         short,
//       };

//       possible.push(entry);
//     }
//   }

//   if (possible.length == 0) return undefined;

//   let bestIndex = 0;
//   let bestProfit = 0;
//   let bestForecast = 0;

//   for (const entry of possible) {
//     const profit = entry.shares * entry.price;
//     if (profit > money || bestProfit === undefined) {
//       bestProfit = undefined;
//       const offset = entry.short ? 0.5 - entry.foreCast : entry.foreCast - 0.5;
//       if (bestForecast < offset) {
//         bestIndex = possible.indexOf(entry);
//         bestForecast = offset;
//       }
//       continue;
//     }
//     const betterProfit = bestProfit < profit;
//     if (betterProfit) {
//       bestIndex = possible.indexOf(entry);
//       bestProfit = profit;
//     }
//   }

//   return possible[bestIndex];
// }

export class Stock {
  /** @param {import('../.vscode/NetscriptDefinitions').NS} ns */
  constructor(
    ns,
    symbol,
    foreCast,
    shareCount,
    buyPrice,
    sellPrice,
    short = false
  ) {
    this.symbol = symbol;
    this.foreCast = foreCast;
    this.shareCount = shareCount;
    this.buyPrice = buyPrice;
    this.sellPrice = sellPrice;
    this.short = short;
    this.profit =
      this.shareCount *
      (this.sellPrice - this.buyPrice) *
      (this.short ? -1 : 1);
    this.visualInd = true;

    this.working = this.buy(ns) != 0;
    this.visual(ns, "buy");
  }

  /** @param {import('../.vscode/NetscriptDefinitions').NS} ns */
  update(ns, foreCast) {
    if (!this.working) return false;
    this.foreCast = foreCast;
    this.sellPrice = this.short
      ? ns.stock.getAskPrice(this.symbol)
      : ns.stock.getBidPrice(this.symbol);
    this.profit =
      this.shareCount *
      (this.sellPrice - this.buyPrice) *
      (this.short ? -1 : 1);

    const doSell = this.short
      ? this.foreCast > RATES.short.sell
      : this.foreCast < RATES.long.sell;
    let mode = "update";
    if (doSell) {
      this.sell(ns);
      mode = "sell";
    }
    this.visual(ns, mode);
    return !doSell;
  }

  /** @param {import('../.vscode/NetscriptDefinitions').NS} ns */
  visual(ns, mode = "update") {
    const colours = {
      loss: "\x1b[0;49;31m",
      win: "\x1b[0;49;32m",
      money: "\x1b[0;49;33m",
      symbol: "\x1b[0;49;34m",
      shares: "\x1b[0;49;35m",
      foreCast: "\x1b[0;49;36m",
      short: "\x1b[0;49;91m",
      long: "\x1b[0;49;92m",
      default: "\x1b[0;49;94m",
    };
    const timeRegex = /^\[(\d{2}:){2}\d{2} (\d{2}-){2}\d{4}\]/;
    const vis = this.visualInd ? "*" : "-";
    switch (mode) {
      case "update":
        this.visualInd = !this.visualInd;
        const strU = `INFO: ${vis} Forecast: ${
          colours.foreCast
        }${this.foreCast.toFixed(3)}${colours.default} Profit: ${
          this.profit > 0 ? colours.win : colours.loss
        }${nFormatter(this.profit)}$${colours.default} ${vis}`;

        let tail = ns.getScriptLogs().reverse();
        ns.clearLog();
        tail[0] = strU;
        tail
          .reverse()
          .forEach((s) => ns.print(s.replace(timeRegex, "").trim()));
        break;
      case "buy":
        const strB1 = `INFO: Buying ${colours.shares}${nFormatter(
          this.shareCount
        )}${colours.default} shares of ${colours.symbol}${this.symbol}${
          colours.default
        } in ${this.short ? colours.short : colours.long}${
          this.short ? "short" : "long"
        }${colours.default} position for ${colours.money}${nFormatter(
          this.buyPrice * this.shareCount
        )}$${colours.default}.`;
        const strB2 = `INFO: ${vis} Forecast: ${
          colours.foreCast
        }${this.foreCast.toFixed(3)}${colours.default} Profit: ${
          this.profit > 0 ? colours.win : colours.loss
        }${nFormatter(this.profit)}$${colours.default} ${vis}`;
        ns.print(strB1);
        ns.print(strB2);
        break;
      case "sell":
        const strS1 = `INFO: Selling ${colours.shares}${nFormatter(
          this.shareCount
        )}${colours.default} shares of ${colours.symbol}${this.symbol}${
          colours.default
        } in ${this.short ? colours.short : colours.long}${
          this.short ? "short" : "long"
        }${colours.default} position for ${colours.money}${nFormatter(
          this.sellPrice * this.shareCount
        )}$${colours.default}.`;
        const strS2 = `INFO: Resulting in a profit of ${
          this.profit > 0 ? colours.win : colours.loss
        }${nFormatter(this.profit)}$${colours.default}.`;
        ns.print(strS1);
        ns.print(strS2);
        break;
    }
  }

  /** @param {import('../.vscode/NetscriptDefinitions').NS} ns */
  sell(ns) {
    const result = this.short
      ? ns.stock.sellShort(this.symbol, this.shareCount)
      : ns.stock.sell(this.symbol, this.shareCount);
    if (result === 0) ns.tprint("ERROR: Could not sell!");
    return result;
  }

  /** @param {import('../.vscode/NetscriptDefinitions').NS} ns */
  buy(ns) {
    const result = this.short
      ? ns.stock.short(this.symbol, this.shareCount)
      : ns.stock.buy(this.symbol, this.shareCount);
    if (result === 0) ns.tprint("ERROR: Could not buy!");
    return result;
  }
}
