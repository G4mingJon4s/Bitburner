/**
 * @param {import('../NetscriptDefinitions').NS} ns
 */
export async function main(ns) {
  let target = ns.args[0];
  let ramP = ns.args[1];

  let ramM =
    (ns.getServerMaxRam(ns.getHostname()) -
      ns.getServerUsedRam(ns.getHostname())) *
    (ramP / 100);

  let ramS = ns.getScriptRam("c-weaken.js");

  if (
    ns.getServerSecurityLevel(target) != ns.getServerMinSecurityLevel(target)
  ) {
    let tTcount = Math.floor(Math.floor(ramM) / ramS);
    let tOpTime = ns.getWeakenTime(target);
    ns.run("c-weaken.js", tTcount, target);
    await ns.sleep(tOpTime);
  }
  let opTime = ns.getWeakenTime(target);
  let limit = Math.floor(opTime / 10);
  let tCount = Math.floor(ramM / (limit * ramS));

  let pids = [];
  for (let count = 0; count < limit; count++) {
    let pid = ns.run("c-weaken.js", tCount, target, Date.now());
    pids.push(pid);
    await ns.sleep(20);
  }
  while (true) {
    for (let pid of pids) {
      if (!ns.isRunning(pid)) {
        pids[pids.indexOf(pid)] = ns.run(
          "c-weaken.js",
          tCount,
          target,
          Date.now()
        );
      }
      await ns.sleep(5);
    }
    await ns.sleep(5);
  }
}
