import { getMaxServerPossible } from "./serverCalc";
import { nFormatter } from "./serverCalc";

/** @param {import('../.vscode/NetscriptDefinitions').NS} ns */
export async function main(ns) {
  const [maxRam, price] = getMaxServerPossible(ns, false);
  const name = ns.args[0] ?? "pserv";
  const result = ns.purchaseServer(name, maxRam);
  if (result.length === 0) {
    if (ns.getPurchasedServerLimit() <= ns.getPurchasedServers().length)
      return ns.alert("ERROR: You have too many servers!");
    return ns.alert("ERROR: You cannot afford a server!");
  }
  ns.alert(
    `SUCCESS: Purchased server ${name} with ${maxRam} GB for ${nFormatter(
      price
    )}$!`
  );
}
