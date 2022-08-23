module.exports = {
	env: {
		browser: true,
		es2021: true,
		node: true,
	},
	extends: ["eslint:recommended", "prettier"],
	overrides: [],
	plugins: ["prettier"],
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
	},
	rules: {
		"prettier/prettier": [
			"error",
			{
				endOfLine: "auto",
				printWidth: 80,
				trailingComma: "es5",
				semi: false,
				doubleQuote: true,
				jsxSingleQuote: true,
				singleQuote: false,
				useTabs: true,
				tabWidth: 2,
			},
		],
		eqeqeq: ["warn"],
		"no-fallthrough": ["warn"],
		"no-unused-vars": ["warn"],
		"no-constant-condition": ["off"],
		"no-case-declarations": ["off"],
	},
}
