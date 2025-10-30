"use strict";
/**
 * Search Engine
 * Provides full-text search across documents and code
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchEngine = void 0;
const flexsearch_1 = __importDefault(require("flexsearch"));
class SearchEngine {
    docIndex;
    documents;
    constructor() {
        this.documents = new Map();
        this.docIndex = new flexsearch_1.default.Document({
            document: {
                id: 'id',
                index: ['title', 'content'],
                store: ['id', 'title', 'path', 'type']
            },
            tokenize: 'forward',
            optimize: true,
            resolution: 9,
            cache: true
        });
    }
    /**
     * Add document to search index
     */
    addDocument(doc) {
        this.documents.set(doc.id, doc);
        this.docIndex.add(doc);
    }
    /**
     * Search for documents
     */
    async search(query) {
        const { query: searchText, limit = 20, type = 'all' } = query;
        // Perform search
        const results = await this.docIndex.search(searchText, {
            limit,
            enrich: true
        });
        const searchResults = [];
        for (const result of results) {
            if (!result.result)
                continue;
            for (const item of result.result) {
                const docId = typeof item === 'string' ? item : item.id;
                const doc = this.documents.get(docId);
                if (!doc)
                    continue;
                // Apply type filter
                if (type !== 'all') {
                    if (type === 'docs' && doc.type !== 'markdown')
                        continue;
                    if (type === 'code' && doc.type === 'markdown')
                        continue;
                }
                // Apply additional filters
                if (query.filters) {
                    if (query.filters.category && doc.metadata.category !== query.filters.category) {
                        continue;
                    }
                    if (query.filters.tags && !this.hasAnyTag(doc.metadata.tags, query.filters.tags)) {
                        continue;
                    }
                }
                // Generate snippet
                const snippet = this.generateSnippet(doc.content, searchText);
                // Calculate relevance score
                const score = this.calculateScore(doc, searchText);
                searchResults.push({
                    id: doc.id,
                    type: 'document',
                    title: doc.title,
                    path: doc.path,
                    snippet,
                    score,
                    highlights: this.findHighlights(doc.content, searchText),
                    metadata: doc.metadata
                });
            }
        }
        // Sort by score
        searchResults.sort((a, b) => b.score - a.score);
        return searchResults.slice(0, limit);
    }
    /**
     * Generate snippet around search term
     */
    generateSnippet(content, searchTerm, maxLength = 200) {
        const lowerContent = content.toLowerCase();
        const lowerTerm = searchTerm.toLowerCase();
        const index = lowerContent.indexOf(lowerTerm);
        if (index === -1) {
            return content.substring(0, maxLength) + '...';
        }
        const start = Math.max(0, index - 100);
        const end = Math.min(content.length, index + searchTerm.length + 100);
        let snippet = content.substring(start, end);
        if (start > 0)
            snippet = '...' + snippet;
        if (end < content.length)
            snippet = snippet + '...';
        return snippet;
    }
    /**
     * Find highlights in content
     */
    findHighlights(content, searchTerm, limit = 5) {
        const highlights = [];
        const regex = new RegExp(`(.{0,50}${searchTerm}.{0,50})`, 'gi');
        let match;
        let count = 0;
        while ((match = regex.exec(content)) !== null && count < limit) {
            highlights.push(match[1].trim());
            count++;
        }
        return highlights;
    }
    /**
     * Calculate relevance score
     */
    calculateScore(doc, searchTerm) {
        let score = 0;
        const lowerTerm = searchTerm.toLowerCase();
        const lowerTitle = doc.title.toLowerCase();
        const lowerContent = doc.content.toLowerCase();
        // Title match (high weight)
        if (lowerTitle.includes(lowerTerm)) {
            score += 10;
        }
        // Exact title match (very high weight)
        if (lowerTitle === lowerTerm) {
            score += 20;
        }
        // Content frequency
        const matches = lowerContent.split(lowerTerm).length - 1;
        score += Math.min(matches * 2, 10);
        // Metadata priority
        if (doc.metadata.priority === 'high') {
            score += 5;
        }
        // Document type bonus
        if (doc.type === 'markdown' && doc.metadata.category === 'architecture') {
            score += 3;
        }
        return score;
    }
    /**
     * Check if document has any of the specified tags
     */
    hasAnyTag(docTags, filterTags) {
        if (!docTags)
            return false;
        return filterTags.some(tag => docTags.includes(tag));
    }
    /**
     * Get all documents
     */
    getAllDocuments() {
        return Array.from(this.documents.values());
    }
    /**
     * Get document by ID
     */
    getDocument(id) {
        return this.documents.get(id);
    }
    /**
     * Clear index
     */
    clear() {
        this.documents.clear();
        this.docIndex = new flexsearch_1.default.Document({
            document: {
                id: 'id',
                index: ['title', 'content'],
                store: ['id', 'title', 'path', 'type']
            }
        });
    }
}
exports.SearchEngine = SearchEngine;
//# sourceMappingURL=search.js.map