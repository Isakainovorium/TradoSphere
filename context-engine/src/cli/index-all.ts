#!/usr/bin/env node
/**
 * CLI tool to index all documentation
 */

import { ContextEngine } from '../index.js';
import path from 'path';

async function main() {
  console.log('TradoSphere Context Engine v1.0.0\n');

  const engine = new ContextEngine();

  try {
    await engine.indexAll();

    // Export index
    const outputPath = path.join(process.cwd(), 'index.json');
    await engine.exportIndex(outputPath);

    // Display stats
    const stats = engine.getStats();
    console.log('\n📊 Statistics:');
    console.log(JSON.stringify(stats, null, 2));

  } catch (error) {
    console.error('❌ Error during indexing:', error);
    process.exit(1);
  }
}

main();
