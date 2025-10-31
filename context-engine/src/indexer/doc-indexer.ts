/**
 * Documentation Indexer
 * Indexes all markdown documentation files
 */

import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { Document, DocumentSection } from '../types/index.js';

export class DocIndexer {
  private rootDir: string;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  /**
   * Index a single markdown file
   */
  async indexFile(filePath: string): Promise<Document> {
    const content = await fs.readFile(filePath, 'utf-8');
    const { data: frontmatter, content: markdown } = matter(content);

    const relativePath = path.relative(this.rootDir, filePath);
    const id = this.generateId(relativePath);

    // Parse sections from markdown
    const sections = this.parseSections(markdown);

    // Extract title (first H1 or filename)
    const title = this.extractTitle(markdown, filePath);

    const stats = await fs.stat(filePath);

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
  private parseSections(markdown: string): DocumentSection[] {
    const sections: DocumentSection[] = [];
    const lines = markdown.split('\n');

    let currentSection: DocumentSection | null = null;
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
      } else if (currentSection) {
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
  private extractTitle(markdown: string, filePath: string): string {
    // Look for first H1
    const h1Match = markdown.match(/^#\s+(.+)$/m);
    if (h1Match) {
      return h1Match[1];
    }

    // Fallback to filename
    return path.basename(filePath, '.md');
  }

  /**
   * Categorize document based on path
   */
  private categorizeDoc(filePath: string): string {
    if (filePath.includes('architecture')) return 'architecture';
    if (filePath.includes('development')) return 'development';
    if (filePath.includes('operations')) return 'operations';
    if (filePath.includes('reference')) return 'reference';
    if (filePath.includes('adr') || filePath.includes('decisions')) return 'adr';
    return 'general';
  }

  /**
   * Generate unique ID from file path
   */
  private generateId(filePath: string): string {
    return filePath
      .replace(/\//g, '-')
      .replace(/\.md$/, '')
      .toLowerCase();
  }

  /**
   * Extract all code blocks from markdown
   */
  extractCodeBlocks(markdown: string): Array<{ language: string; code: string }> {
    const codeBlocks: Array<{ language: string; code: string }> = [];
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
