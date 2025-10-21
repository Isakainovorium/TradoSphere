"use strict";
/**
 * TradoSphere Context Engine
 * Main entry point
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.ContextEngine = void 0;
const glob_1 = require("glob");
const doc_indexer_js_1 = require("./indexer/doc-indexer.js");
const feature_mapper_js_1 = require("./indexer/feature-mapper.js");
const search_js_1 = require("./retriever/search.js");
const config_js_1 = __importDefault(require("./config.js"));
exports.config = config_js_1.default;
const promises_1 = __importDefault(require("fs/promises"));
class ContextEngine {
    docIndexer;
    featureMapper;
    searchEngine;
    features;
    routes;
    constructor() {
        this.docIndexer = new doc_indexer_js_1.DocIndexer(config_js_1.default.rootDir);
        this.featureMapper = new feature_mapper_js_1.FeatureMapper();
        this.searchEngine = new search_js_1.SearchEngine();
        this.features = new Map();
        this.routes = new Map();
    }
    /**
     * Index all documents and code
     */
    async indexAll() {
        console.log('🔍 Starting TradoSphere Context Engine indexing...\n');
        // Index documentation
        await this.indexDocumentation();
        // Parse features and routes
        await this.parseFeatures();
        console.log('\n✅ Indexing complete!');
        console.log(`📚 Indexed ${this.searchEngine.getAllDocuments().length} documents`);
        console.log(`🎯 Mapped ${this.features.size} features`);
        console.log(`🛣️  Mapped ${this.routes.size} routes`);
    }
    /**
     * Index all documentation files
     */
    async indexDocumentation() {
        console.log('📄 Indexing documentation...');
        const docFiles = await (0, glob_1.glob)(config_js_1.default.indexPatterns.docs, {
            cwd: config_js_1.default.rootDir,
            ignore: config_js_1.default.indexPatterns.ignore,
            absolute: true
        });
        let indexed = 0;
        for (const file of docFiles) {
            try {
                const doc = await this.docIndexer.indexFile(file);
                this.searchEngine.addDocument(doc);
                indexed++;
                if (indexed % 10 === 0) {
                    process.stdout.write(`\r   Indexed ${indexed}/${docFiles.length} documents...`);
                }
            }
            catch (error) {
                console.error(`\n   ⚠️  Error indexing ${file}:`, error);
            }
        }
        console.log(`\n   ✓ Indexed ${indexed} documentation files`);
    }
    /**
     * Parse features from documentation
     */
    async parseFeatures() {
        console.log('\n🎯 Parsing features and routes...');
        // Find app router architecture doc
        const appRouterDoc = this.searchEngine.getAllDocuments()
            .find(doc => doc.path.includes('app-router') || doc.path.includes('architecture'));
        if (appRouterDoc) {
            const features = this.featureMapper.parseFeatures(appRouterDoc.content);
            const routes = this.featureMapper.parseRoutes(appRouterDoc.content);
            features.forEach(f => this.features.set(f.id, f));
            routes.forEach(r => this.routes.set(r.path, r));
            console.log(`   ✓ Parsed ${features.length} features`);
            console.log(`   ✓ Parsed ${routes.length} routes`);
        }
        // Map features to database tables
        const schemaDoc = this.searchEngine.getAllDocuments()
            .find(doc => doc.path.includes('database-schema'));
        if (schemaDoc) {
            const featuresArray = Array.from(this.features.values());
            const updatedFeatures = this.featureMapper.mapFeaturesToTables(featuresArray, schemaDoc.content);
            updatedFeatures.forEach(f => this.features.set(f.id, f));
            console.log(`   ✓ Mapped features to database tables`);
        }
        // Map features to APIs
        const apiDoc = this.searchEngine.getAllDocuments()
            .find(doc => doc.path.includes('api') && doc.path.includes('docs'));
        if (apiDoc) {
            const featuresArray = Array.from(this.features.values());
            const updatedFeatures = this.featureMapper.mapFeaturesToAPIs(featuresArray, apiDoc.content);
            updatedFeatures.forEach(f => this.features.set(f.id, f));
            console.log(`   ✓ Mapped features to API endpoints`);
        }
    }
    /**
     * Search across all indexed content
     */
    async search(query) {
        const searchQuery = typeof query === 'string'
            ? { query, limit: 20 }
            : query;
        return this.searchEngine.search(searchQuery);
    }
    /**
     * Get feature by name or ID
     */
    getFeature(nameOrId) {
        // Try by ID first
        let feature = this.features.get(nameOrId);
        if (!feature) {
            // Try by name
            const lowerName = nameOrId.toLowerCase();
            feature = Array.from(this.features.values())
                .find(f => f.name.toLowerCase().includes(lowerName));
        }
        return feature;
    }
    /**
     * Get all features
     */
    getAllFeatures() {
        return Array.from(this.features.values());
    }
    /**
     * Find route by path
     */
    findRoute(path) {
        return this.routes.get(path);
    }
    /**
     * Get all routes
     */
    getAllRoutes() {
        return Array.from(this.routes.values());
    }
    /**
     * Get features by tier
     */
    getFeaturesByTier(tier) {
        return Array.from(this.features.values())
            .filter(f => f.tierAccess === tier || f.tierAccess === 'all');
    }
    /**
     * Get project statistics
     */
    getStats() {
        const docs = this.searchEngine.getAllDocuments();
        return {
            totalDocuments: docs.length,
            documentsByType: {
                markdown: docs.filter(d => d.type === 'markdown').length,
                code: docs.filter(d => d.type === 'code').length
            },
            totalFeatures: this.features.size,
            featuresByTier: {
                free: this.getFeaturesByTier('free').length,
                grow: this.getFeaturesByTier('grow').length,
                elite: this.getFeaturesByTier('elite').length,
                gladiator: this.getFeaturesByTier('gladiator').length,
                legend: this.getFeaturesByTier('legend').length
            },
            totalRoutes: this.routes.size,
            lastIndexed: new Date().toISOString()
        };
    }
    /**
     * Export index to JSON
     */
    async exportIndex(outputPath) {
        const data = {
            documents: Array.from(this.searchEngine.getAllDocuments()),
            features: Array.from(this.features.values()),
            routes: Array.from(this.routes.values()),
            stats: this.getStats()
        };
        await promises_1.default.writeFile(outputPath, JSON.stringify(data, null, 2));
        console.log(`\n💾 Index exported to ${outputPath}`);
    }
}
exports.ContextEngine = ContextEngine;
__exportStar(require("./types/index.js"), exports);
//# sourceMappingURL=index.js.map