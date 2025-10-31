/**
 * Feature Mapper
 * Maps features from documentation to routes, components, and APIs
 */

import { Feature, Route, TierAccess } from '../types/index.js';

export class FeatureMapper {
  /**
   * Parse features from app router architecture documentation
   */
  parseFeatures(content: string): Feature[] {
    const features: Feature[] = [];

    // Extract feature tables from markdown
    const tableRegex = /\|\s*#\s*\|\s*Feature\s*\|\s*Route\s*\|[\s\S]*?\n((?:\|.*\|\n)+)/gi;

    let match;
    let featureId = 1;

    while ((match = tableRegex.exec(content)) !== null) {
      const tableContent = match[1];
      const rows = tableContent.split('\n').filter(row => row.trim() && !row.includes('---'));

      for (const row of rows) {
        const columns = row.split('|').map(col => col.trim()).filter(Boolean);

        if (columns.length >= 5) {
          const [num, name, route, type, components, tierAccess] = columns;

          if (num && !isNaN(parseInt(num))) {
            features.push({
              id: `feature-${num}`,
              name: name || `Feature ${num}`,
              description: `${name} feature`,
              route: route !== 'API integration' && route !== 'Background job' ? route : undefined,
              components: this.parseComponents(components),
              apiEndpoints: [],
              dbTables: [],
              tierAccess: this.parseTierAccess(tierAccess || 'all'),
              priority: parseInt(num) || featureId,
              status: 'planned'
            });

            featureId++;
          }
        }
      }
    }

    return features;
  }

  /**
   * Parse components from string
   */
  private parseComponents(componentsStr: string): string[] {
    if (!componentsStr || componentsStr === 'N/A') return [];

    return componentsStr
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);
  }

  /**
   * Parse tier access
   */
  private parseTierAccess(tierStr: string): TierAccess {
    const lower = tierStr.toLowerCase();

    if (lower.includes('gladiator')) return 'gladiator';
    if (lower.includes('elite')) return 'elite';
    if (lower.includes('grow')) return 'grow';
    if (lower.includes('free')) return 'free';
    if (lower.includes('legend')) return 'legend';

    return 'all';
  }

  /**
   * Parse routes from documentation
   */
  parseRoutes(content: string): Route[] {
    const routes: Route[] = [];

    // Extract routes from markdown tables
    const lines = content.split('\n');
    let inTable = false;

    for (const line of lines) {
      if (line.includes('| # | Feature | Route |')) {
        inTable = true;
        continue;
      }

      if (inTable && line.startsWith('|')) {
        if (line.includes('---')) continue;

        const columns = line.split('|').map(col => col.trim()).filter(Boolean);

        if (columns.length >= 3 && columns[2]) {
          const routePath = columns[2];

          if (routePath && routePath.startsWith('/')) {
            routes.push({
              path: routePath,
              type: this.determineRouteType(routePath, columns[3] || ''),
              features: [columns[1] || 'Unknown'],
              tierAccess: this.parseTierAccess(columns[5] || 'all'),
              description: columns[1] || ''
            });
          }
        }
      }

      if (inTable && line.trim() === '') {
        inTable = false;
      }
    }

    return routes;
  }

  /**
   * Determine route type
   */
  private determineRouteType(path: string, typeHint: string): 'server' | 'client' | 'hybrid' | 'api' {
    if (path.startsWith('/api/')) return 'api';

    const lower = typeHint.toLowerCase();
    if (lower.includes('server')) return 'server';
    if (lower.includes('client')) return 'client';
    if (lower.includes('hybrid')) return 'hybrid';

    return 'server';
  }

  /**
   * Map features to database tables
   */
  mapFeaturesToTables(features: Feature[], schemaDoc: string): Feature[] {
    // Extract table names from schema
    const tableRegex = /CREATE TABLE (\w+)/gi;
    const tables: string[] = [];

    let match;
    while ((match = tableRegex.exec(schemaDoc)) !== null) {
      tables.push(match[1]);
    }

    // Map features to tables based on keywords
    return features.map(feature => {
      const relatedTables: string[] = [];
      const featureName = feature.name.toLowerCase();

      for (const table of tables) {
        if (featureName.includes(table) || table.includes(featureName.split(' ')[0])) {
          relatedTables.push(table);
        }
      }

      return {
        ...feature,
        dbTables: relatedTables
      };
    });
  }

  /**
   * Map features to API endpoints
   */
  mapFeaturesToAPIs(features: Feature[], apiDoc: string): Feature[] {
    // Extract API endpoints
    const endpointRegex = /(GET|POST|PUT|PATCH|DELETE)\s+(\/api\/[\w\/:]+)/gi;
    const endpoints: Array<{ method: string; path: string }> = [];

    let match;
    while ((match = endpointRegex.exec(apiDoc)) !== null) {
      endpoints.push({
        method: match[1],
        path: match[2]
      });
    }

    // Map features to endpoints
    return features.map(feature => {
      const relatedEndpoints: string[] = [];
      const featureName = feature.name.toLowerCase();

      for (const endpoint of endpoints) {
        const endpointPath = endpoint.path.toLowerCase();

        if (featureName.includes('signal') && endpointPath.includes('signal')) {
          relatedEndpoints.push(`${endpoint.method} ${endpoint.path}`);
        } else if (featureName.includes('competition') && endpointPath.includes('competition')) {
          relatedEndpoints.push(`${endpoint.method} ${endpoint.path}`);
        } else if (featureName.includes('stream') && endpointPath.includes('stream')) {
          relatedEndpoints.push(`${endpoint.method} ${endpoint.path}`);
        }
        // Add more mappings as needed
      }

      return {
        ...feature,
        apiEndpoints: relatedEndpoints
      };
    });
  }
}
