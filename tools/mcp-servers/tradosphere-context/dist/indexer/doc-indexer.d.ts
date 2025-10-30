/**
 * Documentation Indexer
 * Indexes all markdown documentation files
 */
import { Document } from '../types/index.js';
export declare class DocIndexer {
    private rootDir;
    constructor(rootDir: string);
    /**
     * Index a single markdown file
     */
    indexFile(filePath: string): Promise<Document>;
    /**
     * Parse markdown into sections
     */
    private parseSections;
    /**
     * Extract title from markdown
     */
    private extractTitle;
    /**
     * Categorize document based on path
     */
    private categorizeDoc;
    /**
     * Generate unique ID from file path
     */
    private generateId;
    /**
     * Extract all code blocks from markdown
     */
    extractCodeBlocks(markdown: string): Array<{
        language: string;
        code: string;
    }>;
}
//# sourceMappingURL=doc-indexer.d.ts.map