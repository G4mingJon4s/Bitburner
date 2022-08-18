import { table } from "./tables";

// prettier-ignore
export const DEFAULTS = {
  "DaedalusAugsRequirement": 30,
  "StaneksGiftExtraSize": 0,
};

/** @param {import('../NetscriptDefinitions').NS} ns */
export async function main(ns) {
  const mults = ns.getBitNodeMultipliers();
  Object.keys(mults).forEach((element) => {
    if (
      Object.keys(DEFAULTS).includes(element) &&
      DEFAULTS[element] == mults[element]
    )
      mults[element] = undefined;
  });
  const data = Object.entries(mults)
    .filter((arr) => arr[1] !== undefined && arr[1] != 1)
    .map((arr) => [arr[0], arr[1] * 100 + "%"]);
  data.unshift(["Name", "Multiplier"]);
  const tableString = table(data);
  ns.tprint(tableString);
}
