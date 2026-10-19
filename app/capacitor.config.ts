import type { CapacitorConfig } from '@capacitor/cli';

// CAP_DEV=1 allows the Android webview (https://localhost) to call a plain-http API on your machine.
const dev = !!process.env['CAP_DEV'];

const config: CapacitorConfig = {
  appId: 'app.kitty.mobile',
  appName: 'Kitty',
  webDir: 'www',
  backgroundColor: '#0f0e17',
  ios: { contentInset: 'never' },
  android: { allowMixedContent: dev },
  plugins: {
    SplashScreen: { launchShowDuration: 0 },
    Keyboard: { resize: 'body' },
  },
};

export default config;
