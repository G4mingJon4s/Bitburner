import { getAllServers } from './contractFinder';

/** @param {import('../.vscode/NetscriptDefinitions').NS} ns */
export async function main(ns) {
    ns.disableLog('ALL'); ns.tail();
    exploitServers(ns, await getAllServers(ns));
    if (ns.args.length === 0) {await ns.sleep(2500); ns.closeTail();}
}

/**
 * Crackes every server in the list, if possible.
 * @param {import('../.vscode/NetscriptDefinitions').NS} ns 
 * @param {string[]} servers Servers to be cracked.
 */
function exploitServers(ns, servers) {
    for (const target of servers) {
        if (!ns.hasRootAccess(target)) {
            switch (ns.getServerNumPortsRequired(target)) {
                case 5: if (ns.fileExists("SQLInject.exe")) { ns.sqlinject(target); } else { break; }
                case 4: if (ns.fileExists("HTTPWorm.exe" )) { ns.httpworm(target);  } else { break; }
                case 3: if (ns.fileExists("relaySMTP.exe")) { ns.relaysmtp(target); } else { break; }
                case 2: if (ns.fileExists("FTPCrack.exe" )) { ns.ftpcrack(target);  } else { break; }
                case 1: if (ns.fileExists("BruteSSH.exe" )) { ns.brutessh(target);  } else { break; }
                case 0: try                                 { ns.nuke(target);      } catch{ break; }
            }
        }
        ns.print(ns.hasRootAccess(target) ? `${target} cracked!` : `${target} failed!`);
    }
}