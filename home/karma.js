import { nFormatter } from "./serverCalc";

/** @param {import('../NetscriptDefinitions').NS} ns */
export async function main(ns) {
  ns.tprint(nFormatter(ns.heart.break()));
}
