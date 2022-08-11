import { table } from "./tables";

/**
 * @param {import('../.vscode/NetscriptDefinitions').NS} ns
 */
export async function main(ns) {
  let servers = await getAllServers(ns);
  let result = getAllContracts(ns, servers, true);
  if (result.length == 0) return ns.tprint("ERROR: No contracts found!");
  let string = table(result);
  ns.tprint(string);
}

/**
 * Gets all servers.
 * @param {import('../.vscode/NetscriptDefinitions').NS} ns netscript interface.
 * @returns {String[]} Array of all server names.
 */
export async function getAllServers(ns) {
  let queue = ["home"];
  let result = [];

  while (queue.length > 0) {
    let current = queue.shift();
    result.push(current);
    let found = ns.scan(current);

    for (let poss of found) {
      if (!result.includes(poss)) {
        queue.push(poss);
      }
    }
    await ns.sleep(0);
  }

  return result;
}

/**
 * @param {import('../.vscode/NetscriptDefinitions').NS} ns
 */
function getAllContracts(ns, servers, ignore = true, visual = true) {
  let result = visual ? [["Server", "Contracts"]] : [];
  for (let server of servers) {
    if (ns.ls(server, ".cct")) {
      let found = ns.ls(server, ".cct");
      if (ignore && found.length === 0) continue;
      result.push([server, ...found]);
    }
  }
  return result;
}
