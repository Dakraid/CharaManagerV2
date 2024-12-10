// @ts-check
import eslintConfigPrettier from 'eslint-config-prettier';

import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt()
    .append({
        rules: {
            '@typescript-eslint/no-explicit-any': 0,
            '@typescript-eslint/no-unused-vars': 0,
            'vue/require-default-prop': 0,
            'vue/first-attribute-linebreak': 0,
            'vue/no-parsing-error': 0,
            'max-len': ['error', { code: 180 }],
        },
    })
    .append(eslintConfigPrettier)
    .append({
        ignores: ['**/*.d.ts', '**/*.mjs', 'nuxt.config.ts', 'components/ui/*/*.*', '.output/**/*.*'],
    });
