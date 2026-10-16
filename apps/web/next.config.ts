import { join } from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: join(process.cwd(), '../..'),
  turbopack: {
    resolveAlias: {
      '@contenster/shared': '../../apps/shared/dist/index.js',
    },
  },
};

export default nextConfig;
