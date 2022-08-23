export function findFactor(input) {
	let primes = [];
	for (let i = 1; i <= input; i++) {
		if (input % i !== 0) continue;
		if (isPrime(i)) primes.push(i);
	}
	return primes.at(-1);
}

/**
 * Checks if the given integer is a prime number.
 * @param {integer} num The integer to be checked.
 */
export function isPrime(num) {
	const root = Math.sqrt(num);
	for (let i = 2; i <= root; i++) {
		if (num % i === 0) return false;
	}
	return num > 1;
}
