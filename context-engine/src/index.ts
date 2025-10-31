/**
 * TradoSphere Context Engine
 * Main entry point
 */

import { glob } from 'glob';
import path from 'path';
import { DocIndexer } from './indexer/doc-indexer.js';
import { FeatureMapper } from './indexer/feature-mapper.js';
import { SearchEngine } from './retriever/search.js';
import { Document, Feature, Route, SearchQuery, SearchResult } from './types/index.js';
import config from './config.js';
import fs from 'fs/promises';

export class ContextEngine {
  private docIndexer: DocIndexer;
  private featureMapper: FeatureMapper;
  private searchEngine: SearchEngine;

  private features: Map<string, Feature>;
  private routes: Map<string, Route>;

  constructor() {
    this.docIndexer = new DocIndexer(config.rootDir);
    this.featureMapper = new FeatureMapper();
    this.searchEngine = new SearchEngine();

    this.features = new Map();
    this.routes = new Map();
  }

  /**
   * Index all documents and code
   */
  async indexAll(): Promise<void> {
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
  private async indexDocumentation(): Promise<void> {
    console.log('📄 Indexing documentation...');

    const docFiles = await glob(config.indexPatterns.docs, {
      cwd: config.rootDir,
      ignore: config.indexPatterns.ignore,
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
      } catch (error) {
        console.error(`\n   ⚠️  Error indexing ${file}:`, error);
      }
    }

    console.log(`\n   ✓ Indexed ${indexed} documentation files`);
  }

  /**
   * Parse features from documentation
   */
  private async parseFeatures(): Promise<void> {
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
  async search(query: string | SearchQuery): Promise<SearchResult[]> {
    const searchQuery: SearchQuery = typeof query === 'string'
      ? { query, limit: 20 }
      : query;

    return this.searchEngine.search(searchQuery);
  }

  /**
   * Get feature by name or ID
   */
  getFeature(nameOrId: string): Feature | undefined {
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
  getAllFeatures(): Feature[] {
    return Array.from(this.features.values());
  }

  /**
   * Find route by path
   */
  findRoute(path: string): Route | undefined {
    return this.routes.get(path);
  }

  /**
   * Get all routes
   */
  getAllRoutes(): Route[] {
    return Array.from(this.routes.values());
  }

  /**
   * Get features by tier
   */
  getFeaturesByTier(tier: string): Feature[] {
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
  async exportIndex(outputPath: string): Promise<void> {
    const data = {
      documents: Array.from(this.searchEngine.getAllDocuments()),
      features: Array.from(this.features.values()),
      routes: Array.from(this.routes.values()),
      stats: this.getStats()
    };

    await fs.writeFile(outputPath, JSON.stringify(data, null, 2));
    console.log(`\n💾 Index exported to ${outputPath}`);
  }
}

export * from './types/index.js';
export { config };
