export function traderI(prices) {
	return maxProfit([1, prices]);
}

export function traderII(prices) {
	return maxProfit([Math.ceil(prices.length / 2), prices]);
}

export function traderIII(prices) {
	return maxProfit([2, prices]);
}

export function traderIV(input) {
	return maxProfit(input);
}

function maxProfit(arrayData) {
	let i, j, k;

	let maxTrades = arrayData[0];
	let stockPrices = arrayData[1];

	let highestProfit = new Array(maxTrades)
		.fill()
		.map(() => new Array(stockPrices.length).fill().map(() => 0));

	for (i = 0; i < maxTrades; i++) {
		for (j = 0; j < stockPrices.length; j++) {
			// Buy
			for (k = j; k < stockPrices.length; k++) {
				// Sell
				if (i > 0 && j > 0 && k > 0) {
					highestProfit[i][k] = Math.max(
						highestProfit[i][k],
						highestProfit[i - 1][k],
						highestProfit[i][k - 1],
						highestProfit[i - 1][j - 1] + stockPrices[k] - stockPrices[j]
					);
				} else if (i > 0 && j > 0) {
					highestProfit[i][k] = Math.max(
						highestProfit[i][k],
						highestProfit[i - 1][k],
						highestProfit[i - 1][j - 1] + stockPrices[k] - stockPrices[j]
					);
				} else if (i > 0 && k > 0) {
					highestProfit[i][k] = Math.max(
						highestProfit[i][k],
						highestProfit[i - 1][k],
						highestProfit[i][k - 1],
						stockPrices[k] - stockPrices[j]
					);
				} else if (j > 0 && k > 0) {
					highestProfit[i][k] = Math.max(
						highestProfit[i][k],
						highestProfit[i][k - 1],
						stockPrices[k] - stockPrices[j]
					);
				} else {
					highestProfit[i][k] = Math.max(
						highestProfit[i][k],
						stockPrices[k] - stockPrices[j]
					);
				}
			}
		}
	}
	return highestProfit[maxTrades - 1][stockPrices.length - 1];
}

export async function main(ns) {
	ns.tprint("Trader I:");
	testCases1.forEach((test) => {
		const input = test.input;
		const output = test.output;
		const answer = traderI(input);
		ns.tprint(output === answer ? "SUCCESS" : "FAILED");
	});
	ns.tprint("Trader II:");
	testCases2.forEach((test) => {
		const input = test.input;
		const output = test.output;
		const answer = traderII(input);
		ns.tprint(output === answer ? "SUCCESS" : "FAILED");
	});
	ns.tprint("Trader III:");
	testCases3.forEach((test) => {
		const input = test.input;
		const output = test.output;
		const answer = traderIII(input);
		ns.tprint(output === answer ? "SUCCESS" : "FAILED");
	});
	ns.tprint("Trader IV:");
	testCases4.forEach((test) => {
		const input = test.input;
		const output = test.output;
		const answer = traderIV(input);
		ns.tprint(output === answer ? "SUCCESS" : "FAILED");
	});
}

const testCases1 = [
	{
		input: [
			96, 83, 172, 187, 96, 195, 159, 34, 141, 159, 198, 22, 39, 23, 75, 86, 38,
			129, 110, 89, 75, 111, 188,
		],
		output: 166,
	},
	{
		input: [
			122, 179, 17, 51, 135, 2, 109, 181, 112, 41, 68, 107, 200, 163, 143, 68,
			36, 82, 68, 33, 99, 56, 175, 73, 17, 194, 104, 149, 190, 35, 72, 106, 170,
			105, 117, 160, 181, 161, 171, 5, 125,
		],
		output: 198,
	},
	{
		input: [
			80, 11, 91, 22, 122, 24, 50, 103, 41, 7, 30, 11, 119, 33, 13, 4, 19, 86,
			161, 21, 125, 55, 13, 23, 9, 114, 192, 65, 137, 75, 158, 113, 69, 66, 55,
			137, 199, 92, 186, 120, 137, 13, 188, 134, 120, 109, 123, 43, 123, 53,
		],
		output: 195,
	},
	{
		input: [
			71, 77, 59, 26, 111, 42, 183, 21, 23, 114, 27, 95, 73, 127, 57, 27, 30,
			164, 71, 112, 156, 73, 9, 60, 108, 71, 35, 166, 95,
		],
		output: 157,
	},
	{
		input: [
			163, 197, 176, 169, 72, 7, 166, 194, 71, 139, 99, 84, 133, 180, 163, 106,
			124, 82, 38, 197,
		],
		output: 190,
	},
	{
		input: [
			33, 20, 81, 163, 12, 102, 62, 28, 137, 173, 118, 45, 84, 89, 3, 42, 162,
			156, 151, 152, 142, 3, 119, 143, 81, 47, 189,
		],
		output: 186,
	},
	{
		input: [199, 5, 36, 81, 151, 187, 93, 134, 107, 165, 48, 112],
		output: 182,
	},
	{
		input: [
			171, 113, 194, 181, 102, 33, 126, 92, 36, 118, 103, 123, 31, 101, 12, 197,
			35, 200, 78, 9, 45, 165, 102, 51, 96, 56, 46, 120, 39, 62, 150,
		],
		output: 188,
	},
	{
		input: [116, 189, 61, 68, 187, 199, 145, 4, 176, 85, 129, 185, 51],
		output: 181,
	},
];

const testCases2 = [
	{
		input: [
			169, 149, 94, 85, 133, 175, 120, 34, 38, 60, 86, 18, 13, 83, 16, 7, 57,
			170,
		],
		output: 375,
	},
	{ input: [175, 19, 129, 66, 85, 140, 78], output: 184 },
	{
		input: [136, 57, 103, 30, 87, 123, 19, 189, 125, 150, 57, 3, 141],
		output: 472,
	},
	{
		input: [
			144, 38, 57, 28, 71, 170, 28, 168, 91, 42, 85, 168, 87, 41, 46, 47, 16,
			26, 113,
		],
		output: 530,
	},
	{
		input: [
			18, 132, 51, 101, 169, 165, 180, 51, 3, 74, 37, 156, 3, 5, 107, 4, 103,
			77, 139, 41, 12, 113, 126, 114, 85, 4, 179, 31, 60, 152, 11, 16, 53, 72,
			103, 182, 159, 185, 118, 162, 148, 93, 175, 103, 36, 171, 39,
		],
		output: 1570,
	},
	{ input: [157, 83, 145, 12, 161, 52], output: 211 },
];

const testCases3 = [
	{
		input: [
			16, 171, 74, 18, 34, 182, 173, 19, 128, 36, 43, 124, 27, 163, 69, 154, 34,
			92, 72, 152, 142, 90, 200,
		],
		output: 347,
	},
	{
		input: [
			44, 44, 107, 100, 21, 189, 116, 158, 111, 166, 160, 168, 151, 57, 187, 3,
			176, 40, 132, 178, 48, 44, 12, 18, 28, 162, 144, 197, 51, 138, 29, 121,
			99, 155, 78, 71, 75, 141, 143,
		],
		output: 362,
	},
	{
		input: [
			47, 157, 46, 150, 35, 176, 121, 92, 59, 78, 20, 21, 182, 52, 54, 161, 161,
			191, 51, 136, 126, 79, 166, 103, 137, 125, 199, 9, 10, 177, 58, 92, 76,
			52, 143, 56, 17, 186, 171, 160, 139, 109, 170,
		],
		output: 356,
	},
	{
		input: [103, 18, 129, 138, 122, 43, 14, 91, 91, 152, 146, 65, 167],
		output: 273,
	},
	{
		input: [
			102, 45, 63, 184, 150, 122, 42, 138, 124, 53, 64, 38, 199, 169, 189, 195,
			128, 115, 33, 151, 85, 125, 18, 13, 186, 139, 177, 170, 143, 29, 14, 186,
			81, 108,
		],
		output: 345,
	},
	{
		input: [
			29, 122, 103, 91, 95, 5, 13, 85, 57, 27, 73, 173, 176, 16, 134, 3, 60, 51,
			44,
		],
		output: 289,
	},
	{
		input: [
			126, 93, 146, 129, 19, 96, 128, 86, 92, 17, 40, 41, 7, 35, 86, 76, 48, 57,
			191, 8, 109, 8, 143, 157, 87, 42, 177, 48, 122, 111, 166, 185, 129, 134,
			104, 20, 190, 79, 193, 91, 34, 2, 157, 121, 103,
		],
		output: 369,
	},
	{
		input: [17, 22, 29, 116, 19, 106, 176, 164, 113, 120, 181, 14],
		output: 261,
	},
	{
		input: [
			15, 39, 164, 98, 142, 187, 166, 133, 166, 200, 145, 41, 174, 1, 52, 104,
			51, 39, 197, 195, 194, 29, 13, 1, 92, 120, 103, 79, 176, 27, 33, 146, 138,
			93, 14, 184, 114, 183, 94, 34, 97, 20, 193,
		],
		output: 388,
	},
	{
		input: [
			28, 119, 62, 200, 112, 116, 64, 137, 9, 154, 29, 132, 48, 173, 65, 143,
			25, 67,
		],
		output: 336,
	},
	{
		input: [
			20, 138, 120, 109, 22, 115, 94, 173, 150, 197, 137, 2, 56, 199, 5, 96,
			129, 190, 100, 80, 26, 195, 182, 86, 136, 197, 88, 17, 29, 129, 30, 134,
			48, 67,
		],
		output: 389,
	},
	{ input: [128, 186, 112, 52, 134, 133, 165], output: 171 },
];

const testCases4 = [
	{
		input: [
			6,
			[
				101, 22, 191, 49, 3, 21, 93, 155, 120, 49, 48, 34, 193, 52, 179, 89, 77,
				98, 34, 189, 195, 71, 175, 90, 40, 134, 98, 46, 91, 152, 2, 103, 174,
				126, 82, 179, 172, 56, 145, 113, 165, 101, 162, 55, 16, 164, 111,
			],
		],
		output: 972,
	},
	{
		input: [
			5,
			[
				134, 63, 16, 197, 8, 88, 114, 60, 129, 59, 30, 25, 178, 197, 67, 195,
				104, 90, 63, 84, 7, 185, 4, 152, 27, 30, 141, 132, 118, 143, 124, 118,
				9,
			],
		],
		output: 824,
	},
	{
		input: [
			7,
			[
				192, 132, 155, 181, 174, 157, 67, 97, 10, 139, 39, 168, 158, 21, 74,
				192, 163, 191, 161, 179, 144, 35, 35, 197, 136, 17, 91, 92, 123, 94,
				183, 114, 149, 119, 167, 66, 26, 174, 171, 84, 159, 47, 37,
			],
		],
		output: 980,
	},
	{
		input: [
			2,
			[
				178, 121, 85, 186, 5, 141, 45, 36, 157, 14, 110, 187, 185, 65, 40, 39,
				55, 58, 33, 148, 99, 119, 2, 77, 131, 74, 134, 77, 8, 130, 16, 6, 166,
				46, 149, 28, 77,
			],
		],
		output: 346,
	},
	{
		input: [
			2,
			[
				127, 97, 31, 57, 55, 183, 109, 77, 73, 43, 163, 195, 37, 57, 33, 29, 90,
				84, 91, 27, 149, 20, 16, 68, 28, 22, 191, 100, 181,
			],
		],
		output: 339,
	},
	{
		input: [
			2,
			[
				113, 53, 64, 66, 164, 188, 39, 106, 153, 58, 192, 47, 99, 79, 155, 131,
				187, 78, 39, 112, 90, 10, 160, 85, 114, 174, 105, 180, 38, 78, 163, 182,
				121, 109, 176,
			],
		],
		output: 325,
	},
	{ input: [9, [134, 181, 115, 129, 165, 65]], output: 97 },
	{
		input: [
			9,
			[
				140, 13, 49, 5, 178, 53, 64, 198, 18, 194, 47, 156, 23, 54, 60, 108, 76,
				186, 94, 192, 107, 181, 146, 60, 178, 163, 109, 64, 100, 21, 106, 49,
				73, 104, 87,
			],
		],
		output: 1141,
	},
	{
		input: [
			8,
			[
				4, 45, 67, 53, 167, 183, 78, 146, 32, 97, 121, 68, 167, 167, 121, 124,
				101, 44, 58, 14, 141, 2, 38, 177, 169, 195,
			],
		],
		output: 783,
	},
	{
		input: [8, [119, 86, 61, 29]],
		output: 0,
	},
];
