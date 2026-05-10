module.exports = {
  presets: [
    [
      'babel-preset-expo',
      {
        // Transform import.meta → globalThis.__ExpoImportMetaRegistry
        // (polyfilled by Expo's runtime) so any ESM packages that slip through
        // Metro's resolver don't crash in the browser.
        unstable_transformImportMeta: true,
      },
    ],
  ],
}
