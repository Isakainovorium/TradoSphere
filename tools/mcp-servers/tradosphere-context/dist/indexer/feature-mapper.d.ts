/**
 * Feature Mapper
 * Maps features from documentation to routes, components, and APIs
 */
import { Feature, Route } from '../types/index.js';
export declare class FeatureMapper {
    /**
     * Parse features from app router architecture documentation
     */
    parseFeatures(content: string): Feature[];
    /**
     * Parse components from string
     */
    private parseComponents;
    /**
     * Parse tier access
     */
    private parseTierAccess;
    /**
     * Parse routes from documentation
     */
    parseRoutes(content: string): Route[];
    /**
     * Determine route type
     */
    private determineRouteType;
    /**
     * Map features to database tables
     */
    mapFeaturesToTables(features: Feature[], schemaDoc: string): Feature[];
    /**
     * Map features to API endpoints
     */
    mapFeaturesToAPIs(features: Feature[], apiDoc: string): Feature[];
}
//# sourceMappingURL=feature-mapper.d.ts.map