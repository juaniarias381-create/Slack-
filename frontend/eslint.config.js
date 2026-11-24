import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

/*
Config plana de ESLint (v9+). El repo tenia un .eslintrc.json, que ESLint 10
ya no lee. Esta config usa solo los plugins instalados en package.json.
*/
export default [
    { ignores: ['dist', 'node_modules'] },
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser
            },
            parserOptions: {
                ecmaFeatures: { jsx: true }
            }
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh
        },
        rules: {
            ...js.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true }
            ],
            /*
            El repo tiene pantallas viejas que importan React sin usarlo
            (ya no hace falta con el transform moderno de JSX). Lo dejamos
            como warning para no bloquear el build por codigo que no es de
            esta pantalla.
            */
            'no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^(React|_)',
                    caughtErrorsIgnorePattern: '^_'
                }
            ],
            'preserve-caught-error': 'off'
        }
    }
]
