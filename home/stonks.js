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

export const SHORT = false;

const LOGSIZE = 12;
const SCRIPTNAME = "stonks.js";

/** @param {import('../NetscriptDefinitions').NS} ns */
export async function main(ns) {
  ns.disableLog("ALL");
  ns.clearLog();

  if (!ns.stock.hasTIXAPIAccess || !ns.stock.hasWSEAccount)
    return ns.tprint("ERROR: You don't have the TIX API or a WSE account!");

  const percentage =
    ns.args[0] !== undefined && ns.args[0] < 95 ? ns.args[0] : 95;
  const hasApi = ns.stock.has4SDataTIXAPI();
  const canShort = SHORT
    ? ns.singularity
        .getOwnedSourceFiles()
        .some((s) => s.n == 8 && s.lvl >= 2) || ns.getPlayer().bitNodeN == 8
    : false;
  const symbols = ns.stock.getSymbols();

  let money = (ns.getPlayer().money * percentage) / 100;

  if (money < 1e7) return ns.tprint("ERROR: Not enough money!");
  newWindow(ns, 861, hasApi ? 150 : 700);

  let logs = !hasApi ? await getLogs(ns) : undefined;

  while (true) {
    money = (ns.getPlayer().money * percentage) / 100;
    if (!hasApi) logs = updateLogs(ns, logs);

    const entry = findBestStock(
      ns,
      money - 2e6,
      canShort,
      hasApi ? undefined : convertLogs(logs)
    );
    if (entry === undefined) {
      ns.print("ERROR: Could not find a viable stock!");
      await ns.sleep(2000);
      continue;
    }
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

    if (!stock.working) {
      await ns.sleep(2000);
      continue;
    }

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

/** @param {import('../NetscriptDefinitions').NS} ns */
export function isMarketUpdated(ns, ECPBidPrice) {
  return ECPBidPrice != ns.stock.getBidPrice("ECP");
}

/** @param {import('../NetscriptDefinitions').NS} ns */
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

  resizeWindow(SCRIPTNAME, 861, 150);

  return logs;
}

/** @param {import('../NetscriptDefinitions').NS} ns */
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

/** @param {import('../NetscriptDefinitions').NS} ns */
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
    const short = foreCast < 0.5;
    const price = short
      ? ns.stock.getBidPrice(symbol)
      : ns.stock.getAskPrice(symbol);
    const buyableShares = Math.min(
      Math.floor(Math.floor(money) / Math.ceil(price)),
      shares
    );
    const score = price * Math.pow(Math.abs(0.5 - foreCast), 1.35);
    return {
      symbol,
      foreCast,
      shares,
      short,
      price,
      buyableShares,
      score,
    };
  });
  const possible = data.filter(
    (entry) =>
      entry.foreCast > RATES.long.buy ||
      (entry.foreCast < RATES.short.buy && canShort)
  );
  const best = possible.reduce(
    (acc, cur) => {
      if (acc.score < cur.score) return cur;
      return acc;
    },
    {
      symbol: "",
      foreCast: 0,
      shares: 0,
      short: false,
      price: Infinity,
      buyableShares: 0,
      score: 0,
    }
  );
  return best;
}

export class Stock {
  /** @param {import('../NetscriptDefinitions').NS} ns */
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

  /** @param {import('../NetscriptDefinitions').NS} ns */
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

  /** @param {import('../NetscriptDefinitions').NS} ns */
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

  /** @param {import('../NetscriptDefinitions').NS} ns */
  sell(ns) {
    const result = this.short
      ? ns.stock.sellShort(this.symbol, this.shareCount)
      : ns.stock.sellStock(this.symbol, this.shareCount);
    if (result === 0) ns.tprint("ERROR: Could not sell!");
    return result;
  }

  /** @param {import('../NetscriptDefinitions').NS} ns */
  buy(ns) {
    const [long, priceLong, short, priceShort] = ns.stock.getPosition(
      this.symbol
    );
    if (long > 0) ns.stock.sellStock(this.symbol, long);
    if (short > 0) ns.stock.sellShort(this.symbol, short);

    const result = this.short
      ? ns.stock.buyShort(this.symbol, this.shareCount)
      : ns.stock.buyStock(this.symbol, this.shareCount);
    if (result === 0) ns.tprint("ERROR: Could not buy!");
    return result;
  }
}
