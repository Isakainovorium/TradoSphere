#!/usr/bin/env node
"use strict";
/**
 * CLI tool to search indexed content
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../index.js");
async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log('Usage: npm run search "<query>"');
        console.log('Example: npm run search "signal posting"');
        process.exit(1);
    }
    const query = args.join(' ');
    console.log(`🔍 Searching for: "${query}"\n`);
    const engine = new index_js_1.ContextEngine();
    await engine.indexAll();
    const results = await engine.search(query);
    if (results.length === 0) {
        console.log('No results found.');
        return;
    }
    console.log(`Found ${results.length} results:\n`);
    for (const result of results) {
        console.log(`📄 ${result.title}`);
        console.log(`   Path: ${result.path}`);
        console.log(`   Score: ${result.score.toFixed(2)}`);
        console.log(`   Snippet: ${result.snippet}`);
        console.log();
    }
}
main();
//# sourceMappingURL=search.js.map