import type { NextConfig } from 'next';

const config: NextConfig = {
  // Allow both localhost and network access in dev mode
  serverRuntimeConfig: {
    host: '0.0.0.0',
  },
};

export default config;
