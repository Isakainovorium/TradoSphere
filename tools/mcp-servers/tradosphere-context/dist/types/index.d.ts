/**
 * TradoSphere Context Engine Types
 */
export interface Document {
    id: string;
    path: string;
    title: string;
    content: string;
    type: 'markdown' | 'code' | 'config';
    metadata: DocumentMetadata;
    sections: DocumentSection[];
    lastModified: Date;
}
export interface DocumentMetadata {
    tags?: string[];
    category?: string;
    priority?: 'high' | 'medium' | 'low';
    relatedDocs?: string[];
    [key: string]: any;
}
export interface DocumentSection {
    heading: string;
    level: number;
    content: string;
    lineStart: number;
    lineEnd: number;
}
export interface Feature {
    id: string;
    name: string;
    description: string;
    route?: string;
    components: string[];
    apiEndpoints: string[];
    dbTables: string[];
    tierAccess: TierAccess;
    priority: number;
    sprint?: number;
    status: 'planned' | 'in-progress' | 'completed';
}
export type TierAccess = 'free' | 'grow' | 'elite' | 'gladiator' | 'legend' | 'all';
export interface Route {
    path: string;
    type: 'server' | 'client' | 'hybrid' | 'api';
    component?: string;
    features: string[];
    tierAccess: TierAccess;
    description: string;
}
export interface Component {
    name: string;
    path: string;
    type: 'page' | 'component' | 'layout' | 'api';
    dependencies: string[];
    usedBy: string[];
    exports: string[];
    description?: string;
}
export interface SearchQuery {
    query: string;
    type?: 'all' | 'docs' | 'code' | 'features';
    filters?: {
        category?: string;
        tags?: string[];
        tier?: TierAccess;
    };
    limit?: number;
}
export interface SearchResult {
    id: string;
    type: 'document' | 'feature' | 'route' | 'component';
    title: string;
    path: string;
    snippet: string;
    score: number;
    highlights: string[];
    metadata: any;
}
export interface Index {
    documents: Map<string, Document>;
    features: Map<string, Feature>;
    routes: Map<string, Route>;
    components: Map<string, Component>;
    searchIndex: any;
    lastUpdated: Date;
}
export interface MCPTool {
    name: string;
    description: string;
    inputSchema: any;
    handler: (args: any) => Promise<any>;
}
export interface ContextEngineConfig {
    rootDir: string;
    indexPatterns: {
        docs: string[];
        code: string[];
        ignore: string[];
    };
    searchOptions: {
        fuzzy: boolean;
        maxResults: number;
        minScore: number;
    };
    mcp: {
        enabled: boolean;
        serverName: string;
        version: string;
    };
}
//# sourceMappingURL=index.d.ts.map