const path = require('path')
const { getSentryExpoConfig } = require('@sentry/react-native/metro')

const config = getSentryExpoConfig(__dirname)

// zustand ships ESM files (esm/*.mjs) that contain `import.meta.env.MODE`.
// Metro web bundles are not ES-module scripts, so import.meta throws at runtime.
// Intercept every zustand/* import on web and redirect to the CJS counterpart.
const zustandRoot = path.dirname(require.resolve('zustand/package.json'))

config.resolver = {
  ...config.resolver,
  // Belt-and-suspenders: also remove the 'import' ESM condition from Metro's
  // exports-field resolution so other packages with the same pattern are covered.
  unstable_conditionNames: ['require', 'default'],
  resolveRequest: (context, moduleName, platform) => {
    if (platform === 'web' && /^zustand(\/|$)/.test(moduleName)) {
      const subpath = moduleName.slice('zustand/'.length) // '' for bare 'zustand'
      const cjsFile = path.join(zustandRoot, subpath ? `${subpath}.js` : 'index.js')
      return { filePath: cjsFile, type: 'sourceFile' }
    }
    return context.resolveRequest(context, moduleName, platform)
  },
}

// Use the default Babel transform profile instead of the Hermes-specific one.
config.transformer = {
  ...config.transformer,
  unstable_transformProfile: 'default',
}

module.exports = config
