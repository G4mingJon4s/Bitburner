// prettier-ignore
/** @param {string[]} input */
export function distilVinegar(input) {
  const [word, key] = input;
  const lookup = ["A","B","C","D","E","F","G","H","I", "J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z",];
  const filledKeyChars = String('').padEnd(word.length, key).split('');
  const pairedChars = word.split('').map((a, i) => [a.toUpperCase(), filledKeyChars[i].toUpperCase()]);
  const vinegar = pairedChars.map((arr) => {
    const localLookup = rightShift([...lookup], lookup.indexOf(arr[1]));
    return localLookup[lookup.indexOf(arr[0])];
  });
  return vinegar.join('');
}

function rightShift(array, shift) {
	while (shift > 0) {
		array.push(array.shift());
		shift--;
	}
	return array;
}
