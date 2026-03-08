module.exports = {
  env: {
    node: true,
    browser: true,
    es2021: true,
    jest: true
  },
  extends: ['standard'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'script'
  },
  ignorePatterns: ['openspec/**'],
  overrides: [
    {
      files: ['src/client/js/**/*.js'],
      parserOptions: {
        sourceType: 'module'
      }
    }
  ],
  rules: {
    indent: ['error', 2]
  }
}
