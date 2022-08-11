/**@param {import('../.vscode/NetscriptDefinitions').NS} ns */
export async function main(ns) {
  let target = ns.args[0];
  const files = [
    "c-weaken.js",
    "c-grow.js",
    "c-hack.js",
    "batchController.js",
    "batchUtil.js",
    "sendJson.js",
    "lambert.js",
    "resize.js",
  ];
  await ns.scp(files, "home", target);
}

export function autocomplete(data, args) {
  return [...data.servers];
}
