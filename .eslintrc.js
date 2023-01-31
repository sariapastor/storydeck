module.exports = {
  extends: [
    'eslint:recommended',
    'react-app/jest',
    'plugin:react/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    // 'plugin:jsx-a11y/recommended',
    'plugin:@typescript-eslint/recommended',
    // This disables the formatting rules in ESLint that Prettier is going to be responsible for handling.
    // Make sure it's always the last config, so it gets the chance to override other configs.
    'eslint-config-prettier',
  ],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: true,
      node: {
        paths: ['src'],
        extensions: ['.js', '.jsx'],
      },
    },
  },
  rules: {
    // Add your own rules here to override ones from the extended configs.
    "import/no-unresolved": "error",
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-non-null-assertion": "off"
  },
};

