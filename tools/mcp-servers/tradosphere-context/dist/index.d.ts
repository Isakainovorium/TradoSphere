/**
 * TradoSphere Context Engine
 * Main entry point
 */
import { Feature, Route, SearchQuery, SearchResult } from './types/index.js';
import config from './config.js';
export declare class ContextEngine {
    private docIndexer;
    private featureMapper;
    private searchEngine;
    private features;
    private routes;
    constructor();
    /**
     * Index all documents and code
     */
    indexAll(): Promise<void>;
    /**
     * Index all documentation files
     */
    private indexDocumentation;
    /**
     * Parse features from documentation
     */
    private parseFeatures;
    /**
     * Search across all indexed content
     */
    search(query: string | SearchQuery): Promise<SearchResult[]>;
    /**
     * Get feature by name or ID
     */
    getFeature(nameOrId: string): Feature | undefined;
    /**
     * Get all features
     */
    getAllFeatures(): Feature[];
    /**
     * Find route by path
     */
    findRoute(path: string): Route | undefined;
    /**
     * Get all routes
     */
    getAllRoutes(): Route[];
    /**
     * Get features by tier
     */
    getFeaturesByTier(tier: string): Feature[];
    /**
     * Get project statistics
     */
    getStats(): {
        totalDocuments: number;
        documentsByType: {
            markdown: number;
            code: number;
        };
        totalFeatures: number;
        featuresByTier: {
            free: number;
            grow: number;
            elite: number;
            gladiator: number;
            legend: number;
        };
        totalRoutes: number;
        lastIndexed: string;
    };
    /**
     * Export index to JSON
     */
    exportIndex(outputPath: string): Promise<void>;
}
export * from './types/index.js';
export { config };
//# sourceMappingURL=index.d.ts.map