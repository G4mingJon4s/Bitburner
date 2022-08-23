/** @param {import('../NetscriptDefinitions').NS} ns */
export async function main(ns) {
	const length = 16;
	const char = "i";
	const ansi = "\x1b[0;49;";
	const line = (v, i) => ansi + i + "m" + " " + v;
	let out = "\n";

	for (let c = 0; c <= 255; c++) {
		if (c % 16 === 0 && c !== 0) out += "\n";
		out += line(char, c);
	}
	ns.tprint(out);
}

export const COLOURS = {
	red: "\x1b[0;49;31m",
	green: "\x1b[0;49;32m",
	yellow: "\x1b[0;49;33m",
	blue: "\x1b[0;49;34m",
	purple: "\x1b[0;49;35m",
	cyan: "\x1b[0;49;36m",
	white: "\x1b[0;49;37m",
	black: "\x1b[0;49;38m",

	defaultG: "\x1b[0;49;0m",
	defaultI: "\x1b[0;49;94m",

	redF: "\x1b[7;49;31m",
	greenF: "\x1b[7;49;32m",
	yellowF: "\x1b[7;49;33m",
	blueF: "\x1b[7;49;34m",
	purpleF: "\x1b[7;49;35m",
	cyaFn: "\x1b[7;49;36m",
	whiteF: "\x1b[7;49;37m",
	blackF: "\x1b[7;49;38m",
	defaultF: "\x1b[7;49;94m",

	redU: "\x1b[4;49;31m",
	greenU: "\x1b[4;49;32m",
	yellowU: "\x1b[4;49;33m",
	blueU: "\x1b[4;49;34m",
	purpleU: "\x1b[4;49;35m",
	cyanU: "\x1b[4;49;36m",
	whiteU: "\x1b[4;49;37m",
	blackU: "\x1b[4;49;38m",
	defaultU: "\x1b[4;49;94m",
};
