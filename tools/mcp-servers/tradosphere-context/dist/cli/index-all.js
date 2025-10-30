#!/usr/bin/env node
"use strict";
/**
 * CLI tool to index all documentation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../index.js");
const path_1 = __importDefault(require("path"));
async function main() {
    console.log('TradoSphere Context Engine v1.0.0\n');
    const engine = new index_js_1.ContextEngine();
    try {
        await engine.indexAll();
        // Export index
        const outputPath = path_1.default.join(process.cwd(), 'index.json');
        await engine.exportIndex(outputPath);
        // Display stats
        const stats = engine.getStats();
        console.log('\n📊 Statistics:');
        console.log(JSON.stringify(stats, null, 2));
    }
    catch (error) {
        console.error('❌ Error during indexing:', error);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=index-all.js.map