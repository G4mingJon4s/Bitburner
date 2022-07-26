/** @param {NS} ns */
export async function main(ns, a) {
    let t = parseInt(ns.args[0]);
    const num = isNaN(t) ? 25 : parseInt(ns.args[0]);
    ns.tprint(fibonacci(num));
}

/**
 * Returns the i-th number in the fibonacci sequence.
 * @param {number} i -th number to find. 
 */
function fibonacci(i) {
    const sqr5 = Math.sqrt(5);
    const osqr5 = 1 / sqr5;
    const a = osqr5 * (Math.pow((1 + sqr5) / 2, i + 1));
    const b = osqr5 * (Math.pow((1 - sqr5) / 2, i + 1));
    return Math.floor(a - b); // In reality no flooring required, FPU f**ks this up...
}