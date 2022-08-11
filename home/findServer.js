/**
 * @param {import('../.vscode/NetscriptDefinitions').NS} ns
 */
export async function main(ns) {
  const target = ns.args[0];
  const mode = ns.args[1] ?? true;
  try {
    ns.getServer(target);
  } catch {
    ns.alert(`Target is not a valid server!`);
    return;
  }
  let route = await findServer(ns, target);

  if (mode) {
    let terminalIn = document.getElementById("terminal-input");
    terminalIn.value = convertToConnect(route);
    const handler = Object.keys(terminalIn)[1];
    terminalIn[handler].onChange({
      target: terminalIn,
    });
    terminalIn[handler].onKeyDown({
      key: "Enter",
      preventDefault: () => null,
    });
    return;
  }
  ns.tprint(convertToConnect(route));
}

/**
 * @param {import('../.vscode/NetscriptDefinitions').NS} ns
 * @param {String} current
 * @param {String} target
 * @returns {String[] | undefined}
 */
export async function findServer(ns, target, current = "home", path = []) {
  await ns.sleep(1);

  path.push(current);
  if (path.includes(target)) return path;

  let next = await ns.scan(current);
  next = next.filter((s) => !path.includes(s));
  if (next.length == 0) return undefined;

  for (let s of next) {
    let res = await findServer(ns, target, s, [...path]);
    if (typeof res !== "undefined") {
      return res;
    }
  }
}

/**
 * Converts an array of server names to a copy-able connect route
 * @param {string[]} arr
 * @returns {String} printed array
 */
export function convertToConnect(arr) {
  let out = "";
  let prefix = "connect ";
  let suffix = "; ";
  for (let name of arr) {
    if (name == "home") {
      out += name;
      out += suffix;
      continue;
    }
    out += prefix;
    out += name;
    out += suffix;
  }
  return out;
}

/**@param {import('../.vscode/NetscriptDefinitions').AutocompleteData} data */
export function autocomplete(data, args) {
  return [...data.servers, "true", "false"];
}
