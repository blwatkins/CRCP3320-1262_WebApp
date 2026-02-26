import { defineConfig } from 'eslint/config';

import js from "@eslint/js";
import stylistic from '@stylistic/eslint-plugin';

export default defineConfig([
	{
		files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
		plugins: {
			js,
            '@stylistic': stylistic
		},
		extends: ["js/recommended", "@stylistic/recommended"],
		rules: {
            'no-undef': 'warn',
		},
	},
]);
