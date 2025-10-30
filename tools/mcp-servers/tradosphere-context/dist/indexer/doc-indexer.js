"use strict";
/**
 * Documentation Indexer
 * Indexes all markdown documentation files
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocIndexer = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const gray_matter_1 = __importDefault(require("gray-matter"));
class DocIndexer {
    rootDir;
    constructor(rootDir) {
        this.rootDir = rootDir;
    }
    /**
     * Index a single markdown file
     */
    async indexFile(filePath) {
        const content = await promises_1.default.readFile(filePath, 'utf-8');
        const { data: frontmatter, content: markdown } = (0, gray_matter_1.default)(content);
        const relativePath = path_1.default.relative(this.rootDir, filePath);
        const id = this.generateId(relativePath);
        // Parse sections from markdown
        const sections = this.parseSections(markdown);
        // Extract title (first H1 or filename)
        const title = this.extractTitle(markdown, filePath);
        const stats = await promises_1.default.stat(filePath);
        return {
            id,
            path: relativePath,
            title,
            content: markdown,
            type: 'markdown',
            metadata: {
                ...frontmatter,
                category: this.categorizeDoc(relativePath),
                lineCount: markdown.split('\n').length,
                wordCount: markdown.split(/\s+/).length
            },
            sections,
            lastModified: stats.mtime
        };
    }
    /**
     * Parse markdown into sections
     */
    parseSections(markdown) {
        const sections = [];
        const lines = markdown.split('\n');
        let currentSection = null;
        let lineNumber = 0;
        for (const line of lines) {
            lineNumber++;
            // Check if line is a heading
            const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
            if (headingMatch) {
                // Save previous section
                if (currentSection) {
                    currentSection.lineEnd = lineNumber - 1;
                    sections.push(currentSection);
                }
                // Start new section
                const level = headingMatch[1].length;
                const heading = headingMatch[2];
                currentSection = {
                    heading,
                    level,
                    content: '',
                    lineStart: lineNumber,
                    lineEnd: lineNumber
                };
            }
            else if (currentSection) {
                // Add line to current section
                currentSection.content += line + '\n';
            }
        }
        // Add last section
        if (currentSection) {
            currentSection.lineEnd = lineNumber;
            sections.push(currentSection);
        }
        return sections;
    }
    /**
     * Extract title from markdown
     */
    extractTitle(markdown, filePath) {
        // Look for first H1
        const h1Match = markdown.match(/^#\s+(.+)$/m);
        if (h1Match) {
            return h1Match[1];
        }
        // Fallback to filename
        return path_1.default.basename(filePath, '.md');
    }
    /**
     * Categorize document based on path
     */
    categorizeDoc(filePath) {
        if (filePath.includes('architecture'))
            return 'architecture';
        if (filePath.includes('development'))
            return 'development';
        if (filePath.includes('operations'))
            return 'operations';
        if (filePath.includes('reference'))
            return 'reference';
        if (filePath.includes('adr') || filePath.includes('decisions'))
            return 'adr';
        return 'general';
    }
    /**
     * Generate unique ID from file path
     */
    generateId(filePath) {
        return filePath
            .replace(/\//g, '-')
            .replace(/\.md$/, '')
            .toLowerCase();
    }
    /**
     * Extract all code blocks from markdown
     */
    extractCodeBlocks(markdown) {
        const codeBlocks = [];
        const regex = /```(\w+)?\n([\s\S]*?)```/g;
        let match;
        while ((match = regex.exec(markdown)) !== null) {
            codeBlocks.push({
                language: match[1] || 'text',
                code: match[2]
            });
        }
        return codeBlocks;
    }
}
exports.DocIndexer = DocIndexer;
//# sourceMappingURL=doc-indexer.js.map