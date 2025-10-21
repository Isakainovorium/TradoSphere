import { ContextEngineConfig } from './types/index.js';
import path from 'path';

export const config: ContextEngineConfig = {
  rootDir: path.join(process.cwd(), '..'),

  indexPatterns: {
    docs: [
      '**/*.md',
      '!node_modules/**',
      '!.git/**',
      '!dist/**'
    ],
    code: [
      'apps/**/*.{ts,tsx,js,jsx}',
      'packages/**/*.{ts,tsx,js,jsx}',
      '!**/*.test.{ts,tsx}',
      '!**/*.spec.{ts,tsx}',
      '!**/node_modules/**',
      '!**/dist/**'
    ],
    ignore: [
      'node_modules/**',
      '.git/**',
      'dist/**',
      'build/**',
      '.next/**',
      'coverage/**'
    ]
  },

  searchOptions: {
    fuzzy: true,
    maxResults: 20,
    minScore: 0.3
  },

  mcp: {
    enabled: true,
    serverName: 'tradosphere-context',
    version: '1.0.0'
  }
};

export default config;
