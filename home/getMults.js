import { table } from "./tables";

// prettier-ignore
export const DEFAULTS = {
  "DaedalusAugsRequirement": { value: 30, type: "absolute" },
  "StaneksGiftExtraSize": { value: 0, type: "percentage" },
};

/** @param {import('../NetscriptDefinitions').NS} ns */
export async function main(ns) {
	const mults = ns.getBitNodeMultipliers();
	const data = Object.entries(mults)
		.filter(
			(arr) =>
				arr[1] !== undefined &&
				arr[1] !=
					(Object.keys(DEFAULTS).includes(arr[0]) ? DEFAULTS[arr[0]].value : 1)
		)
		.map((arr) => [
			arr[0],
			Object.keys(DEFAULTS).includes(arr[0])
				? arr[1] * DEFAULTS[arr[0]].type === "percentage"
					? 100
					: 1 + DEFAULTS[arr[0]].type === "percentage"
					? "%"
					: ""
				: arr[1] * 100 + "%",
		]);
	data.unshift(["Name", "Multiplier"]);
	const tableString = table(data);
	ns.tprint(tableString);
}
