import { getAllServers } from "./contractFinder";
import { COLOURS } from "./colours";

/** @param {import('../NetscriptDefinitions').NS} ns */
export async function main(ns) {
	exploitServers(ns, await getAllServers(ns));
}

/**
 * Crackes every server in the list, if possible.
 * @param {import('../NetscriptDefinitions').NS} ns
 * @param {string[]} servers Servers to be cracked.
 */

// prettier-ignore
export function exploitServers(ns, servers) {
  let count = 0;

  for (const target of servers) {
    if (!ns.hasRootAccess(target)) {
      switch (ns.getServerNumPortsRequired(target)) {
        case 5: if (ns.fileExists("SQLInject.exe")) { ns.sqlinject(target);        } else { break; }
        case 4: if (ns.fileExists("HTTPWorm.exe" )) { ns.httpworm(target);         } else { break; }
        case 3: if (ns.fileExists("relaySMTP.exe")) { ns.relaysmtp(target);        } else { break; }
        case 2: if (ns.fileExists("FTPCrack.exe" )) { ns.ftpcrack(target);         } else { break; }
        case 1: if (ns.fileExists("BruteSSH.exe" )) { ns.brutessh(target);         } else { break; }
        case 0: try                                 { ns.nuke(target);     count++ } catch{ break; }
      }
    }
  }
  if (count > 0) return ns.tprint(`Unlocked ${COLOURS.green}${count}${COLOURS.defaultG} servers.`);
  return ns.tprint(`${COLOURS.red}No new servers were unlocked.${COLOURS.defaultG}`);
}
