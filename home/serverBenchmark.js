import { getAllServers } from "./contractFinder";
import { COLOURS } from "./colours";
import { table } from "./tables";
import { nFormatter } from "./serverCalc";
import { calculateGrowThreads } from "./lambert";

/** @param {import('../.vscode/NetscriptDefinitions').NS} ns */
export async function main(ns) {
  const data = await benchmarkServerStats(ns);
  const data2 = await benchmarkServerBatch(ns);
  const tableString = table(data, true, false);
  const tableString2 = table(data2, true, false);
  ns.tprint(tableString);
  ns.tprint(tableString2);
}

/** @param {import('../.vscode/NetscriptDefinitions').NS} ns */
export async function benchmarkServerStats(ns) {
  const servers = await getAllServers(ns);

  const data = servers.map((server) => [
    server,
    nFormatter(ns.getServerMaxMoney(server).toString()),
    ns.getServerMinSecurityLevel(server).toString(),
    ns.hasRootAccess(server) ? "Yes" : "No",
    ns.getServerRequiredHackingLevel(server).toString(),
  ]);
  data.unshift(["Server", "Money", "Security", "Access", "Level"]);
  return data;
}

/** @param {import('../.vscode/NetscriptDefinitions').NS} ns */
export async function benchmarkServerBatch(ns, visual = true) {
  const percentages = [
    0.01, 0.02, 0.03, 0.04, 0.05, 0.07, 0.1, 0.15, 0.25, 0.45, 0.55, 0.75, 0.85,
    0.9, 0.91, 0.92, 0.93, 0.94, 0.95, 0.96, 0.97, 0.98, 0.99, 1.0,
  ];
  const costs = {
    hack: 1.7,
    grow: 1.75,
    weaken: 1.75,
  };
  const player = ns.getPlayer();
  const servers = (await getAllServers(ns))
    .filter(ns.hasRootAccess)
    .map((name) => ns.getServer(name));
  const hackThreads = servers.map((server) =>
    percentages.map(
      (p) =>
        p /
        (ns.fileExists("Formulas.exe", "home")
          ? ns.formulas.hacking.hackPercent(server, player)
          : ns.hackAnalyze(server.hostname))
    )
  );
  const growThreads = servers.map((server) =>
    percentages.map((p) =>
      calculateGrowThreads(ns, server.hostname, server.moneyMax * p)
    )
  );
  const weakenThreads = servers.map((server, i) =>
    percentages.map((p, j) => [
      (hackThreads[i][j] * 0.02) / 0.05,
      (growThreads[i][j] * 0.04) / 0.05,
    ])
  );
  const batchCost = servers.map((server, i) =>
    percentages.map(
      (p, j) =>
        hackThreads[i][j] * costs.hack +
        growThreads[i][j] * costs.grow +
        weakenThreads[i][j].reduce((a, b) => a + b) * costs.weaken
    )
  );
  const chances = servers.map((server) =>
    ns.fileExists("Formulas.exe", "home")
      ? ns.formulas.hacking.hackChance(server, player)
      : ns.hackAnalyzeChance(server.hostname)
  );
  const times = servers.map((server) =>
    ns.fileExists("Formulas.exe", "home")
      ? ns.formulas.hacking.weakenTime(server, player)
      : ns.getWeakenTime(server.hostname)
  );
  const allScores = servers.map((server, i) => ({
    name: server.hostname,
    scores: percentages.map(
      (p, j) =>
        (1 / batchCost[i][j]) * chances[i] * times[i] * server.moneyMax * p
    ),
  }));
  if (visual) {
    let converted = allScores.map((val) => [
      val.name,
      ...val.scores.map((s) => nFormatter(s, 1)),
    ]);
    converted.unshift(["Server", ...percentages.map((p) => p.toString())]);
    return converted;
  }
  return allScores;
}

export function map(value, low1, high1, low2, high2) {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}
