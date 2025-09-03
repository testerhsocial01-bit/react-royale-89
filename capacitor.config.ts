import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.f5987175c28d44d19f8ede552e4da428',
  appName: 'react-royale-69',
  webDir: 'dist',
  server: {
    url: 'https://f5987175-c28d-44d1-9f8e-de552e4da428.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined
    }
  }
};

export default config;