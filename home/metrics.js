/** @param {NS} ns */
export async function main(ns, a) {
  ns.disableLog("ALL");
  ns.clearLog();
  ns.tail();
  const counter1 = makeCounter();
  while (true) {
    ns.print(fibonacci(counter1()));
    await ns.sleep(1000);
  }
}

export const makeCounter = (start = 0, end = Infinity, step = 1) => {
  let count = start;
  const counter = () => {
    return count + step >= end ? (count = start) : (count += step);
  };
  return counter;
};

/**
 * Returns the i-th number in the fibonacci sequence.
 * @param {number} i -th number to find.
 */
export function fibonacci(i) {
  if (i < 2) return 1;
  const sqr5 = Math.sqrt(5);
  const osqr5 = 1 / sqr5;
  const a = osqr5 * Math.pow((1 + sqr5) / 2, i + 1);
  const b = osqr5 * Math.pow((1 - sqr5) / 2, i + 1);
  return Math.floor(a - b); // In reality no flooring required, FPU f**ks this up...
}
