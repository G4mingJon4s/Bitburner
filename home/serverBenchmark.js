import { getAllServers } from "./contractFinder";
import { COLOURS } from "./colours";
import { table } from "./tables";
import { gbFormatter, nFormatter, tFormatter } from "./serverCalc";
import { calculateGrowThreads } from "./lambert";
import { serverCalc } from "./serverCalc";

/** @param {import('../.vscode/NetscriptDefinitions').NS} ns */
export async function main(ns) {
  const mode = ns.args[0] ?? 0;
  switch (mode) {
    case 0:
      ns.tprint(table(await benchmarkServerStats(ns), true, false));
      break;
    case 1:
      ns.tprint(table(await benchmarkServerBatch(ns), true, false));
      break;
    case 2:
      ns.tprint(table(await getBestServer(ns), true, false));
      break;
  }
}

/** @param {import('../.vscode/NetscriptDefinitions').NS} ns */
export async function benchmarkServerStats(ns) {
  const servers = (await getAllServers(ns)).filter(
    (name) => ns.getServer(name).moneyMax > 0
  );

  const data = servers.map((server) => [
    server,
    nFormatter(ns.getServerMaxMoney(server)),
    ns.getServerMinSecurityLevel(server).toString(),
    ns.hasRootAccess(server) ? "Yes" : "No",
    ns.getServerRequiredHackingLevel(server).toString(),
    ns.hackAnalyzeChance(server).toFixed(2),
    tFormatter(ns.getWeakenTime(server), false),
  ]);
  data.unshift([
    "Server",
    "Money",
    "Security",
    "Access",
    "Level",
    "Chance",
    "Time",
  ]);
  return data;
}

/** @param {import('../.vscode/NetscriptDefinitions').NS} ns */
export async function benchmarkServerBatch(ns, visual = true) {
  const player = ns.getPlayer();
  const servers = (await getAllServers(ns))
    .map((name) => {
      const obj = ns.getServer(name);
      obj.hackDifficulty = obj.minDifficulty;
      obj.moneyAvailable = obj.moneyMax;
      return obj;
    })
    .filter(
      (obj) =>
        obj.hasAdminRights &&
        obj.requiredHackingSkill <= player.hacking &&
        obj.moneyMax > 0
    );
  const ramValues = serverCalc(ns, false)
    .map((arr) => arr[0])
    .filter((ram) => ram > 128);
  const hasFormulas = ns.fileExists("Formulas.exe", "home");
  const percentages = [
    0.01, 0.02, 0.03, 0.04, 0.05, 0.07, 0.1, 0.15, 0.25, 0.45, 0.55, 0.75, 0.85,
    0.9, 0.91, 0.92, 0.93, 0.94, 0.95, 0.96, 0.97, 0.98, 0.99, 1.0,
  ];
  const costs = {
    hack: 1.7,
    grow: 1.75,
    weaken: 1.75,
  };

  const data = servers
    .map((server) => {
      const hackThreads = percentages.map(
        (p) =>
          p /
          (hasFormulas
            ? ns.formulas.hacking.hackPercent(server, player)
            : ns.hackAnalyze(server.hostname))
      );
      const growThreads = percentages.map((p) =>
        calculateGrowThreads(ns, server.hostname, server.moneyMax * p)
      );
      const weakenThreads = percentages.map((p, j) => [
        (hackThreads[j] * 0.02) / 0.05,
        (growThreads[j] * 0.04) / 0.05,
      ]);
      const batchCosts = percentages.map(
        (p, j) =>
          hackThreads[j] * costs.hack +
          growThreads[j] * costs.grow +
          weakenThreads[j].reduce((a, b) => a + b) * costs.weaken
      );
      const chance = hasFormulas
        ? ns.formulas.hacking.hackChance(server, player)
        : ns.hackAnalyzeChance(server.hostname);
      const time = hasFormulas
        ? ns.formulas.hacking.weakenTime(server, player)
        : ns.getWeakenTime(server.hostname);
      const scores = ramValues
        .map((ram) => ({
          ram,
          score: percentages.map((p, j) => ({
            value:
              (Math.floor(ram / batchCosts[j]) * chance * server.moneyMax * p) /
              time,
            percentage: p,
          })),
        }))
        .filter(
          (entry) =>
            entry.score.reduce((acc, val, i) => Math.max(acc, val.value), 0) > 0
        );
      return {
        name: server.hostname,
        scores,
      };
    })
    .filter((obj) => obj.scores.length != 0);
  if (visual) {
    const output = [["Server", "Ram", ...percentages.map((n) => n.toString())]];
    data.forEach((value, i) => {
      const entry = [
        value.name,
        gbFormatter(value.scores[0].ram, 1),
        ...value.scores[0].score.map((n) => nFormatter(n.value, 1)),
      ];
      const others = value.scores.slice(1).map((row, j) => {
        return [
          "",
          gbFormatter(row.ram, 1),
          ...row.score.map((n) => nFormatter(n.value, 1)),
        ];
      });
      output.push(entry, ...others);
    });
    return output;
  }
  return data;
}

/** @param {{name: string; scores: {ram: number; score: {value: number; percentage: number}[]}[]}[]} data */
export async function getBestServer(ns, visual = true) {
  const data = await benchmarkServerBatch(ns, false);
  const best = data.map((entry) => ({
    name: entry.name,
    setting: entry.scores.reduce(
      (acc, current) => {
        const bestValue = current.score.reduce(
          (acc2, ind) => (acc2.value < ind.value ? ind : acc2),
          { value: 0, percentage: 0 }
        );
        return bestValue.value > acc.value ? bestValue : acc;
      },
      { value: 0, percentage: 0 }
    ),
  }));
  if (visual) {
    const converted = best.map((value) => [
      value.name,
      value.setting.percentage.toString(),
      value.setting.value,
    ]);
    converted.sort((a, b) => a[2] - b[2]);
    const output = converted.map((arr) => [
      arr[0],
      arr[1],
      nFormatter(arr[2], 1),
    ]);
    output.unshift(["Server", "Percentage", "Value"]);
    return output;
  }
  return best;
}

export function map(value, low1, high1, low2, high2) {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}
