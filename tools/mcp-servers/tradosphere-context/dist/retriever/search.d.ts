/**
 * Search Engine
 * Provides full-text search across documents and code
 */
import { SearchQuery, SearchResult, Document } from '../types/index.js';
export declare class SearchEngine {
    private docIndex;
    private documents;
    constructor();
    /**
     * Add document to search index
     */
    addDocument(doc: Document): void;
    /**
     * Search for documents
     */
    search(query: SearchQuery): Promise<SearchResult[]>;
    /**
     * Generate snippet around search term
     */
    private generateSnippet;
    /**
     * Find highlights in content
     */
    private findHighlights;
    /**
     * Calculate relevance score
     */
    private calculateScore;
    /**
     * Check if document has any of the specified tags
     */
    private hasAnyTag;
    /**
     * Get all documents
     */
    getAllDocuments(): Document[];
    /**
     * Get document by ID
     */
    getDocument(id: string): Document | undefined;
    /**
     * Clear index
     */
    clear(): void;
}
//# sourceMappingURL=search.d.ts.map