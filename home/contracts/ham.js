export function intToHam(int) {
  const bin = int
    .toString(2)
    .split("")
    .map((s) => Number(s));

  const code = [0];

  for (let i = 0; bin.length > 0; i++) {
    code.push(Number.isInteger(Math.log2(i)) ? 0 : bin.shift());
  }

  const parries = Array(Math.floor(Math.log2(code.length)))
    .fill()
    .map((a, i) => Math.pow(2, i));

  parries.forEach((p) => {
    code[p] = code
      .map((a, i) => (i & p) > 0)
      .reduce((acc, b, i) => (b && code[i]) ^ acc);
  });

  code[0] = code.reduce((acc, state) => state ^ acc);

  return code;
}
