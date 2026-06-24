import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'info.web3privacy.anonymizer',
  appName: 'W3PN Anonymizer',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
  },
  backgroundColor: '#000000',
  ios: {
    contentInset: 'never',
    backgroundColor: '#000000',
  },
}

export default config
