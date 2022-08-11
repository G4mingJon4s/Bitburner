/** @param {import('../.vscode/NetscriptDefinitions').NS} ns */
export async function main(ns) {
  let name = ns.args[0];
  let width = ns.args[1] ?? 400;
  let height = ns.args[2] ?? 400;

  resizeTail(name, width, height);

  //name=script name
  function resizeTail(name, width, height) {
    for (const tail of globalThis["document"].querySelectorAll(
      `h6[title*="${name}"]`
    ))
      if (tail.parentNode.parentNode.className == "react-resizable")
        tail.parentNode.parentNode.setAttribute(
          "style",
          `width: ${width}px; height: ${height}px;`
        );
  }
}

/** @param {import('../.vscode/NetscriptDefinitions').NS} ns */
export function newWindow(ns, width, height) {
  let doc = eval("document");
  ns.tail();
  let logArea = doc.querySelector(
    ".react-draggable:last-child .react-resizable:last-child"
  );
  logArea.style.width = width + "px";
  logArea.style.height = height + "px";
}

export function resizeWindow(name, width, height) {
  for (const tail of globalThis["document"].querySelectorAll(
    `h6[title*="${name}"]`
  ))
    if (tail.parentNode.parentNode.className == "react-resizable")
      tail.parentNode.parentNode.setAttribute(
        "style",
        `width: ${width}px; height: ${height}px;`
      );
}
