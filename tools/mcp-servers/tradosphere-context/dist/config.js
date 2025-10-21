"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const path_1 = __importDefault(require("path"));
exports.config = {
    rootDir: path_1.default.join(process.cwd(), '..'),
    indexPatterns: {
        docs: [
            '**/*.md',
            '!node_modules/**',
            '!.git/**',
            '!dist/**'
        ],
        code: [
            'apps/**/*.{ts,tsx,js,jsx}',
            'packages/**/*.{ts,tsx,js,jsx}',
            '!**/*.test.{ts,tsx}',
            '!**/*.spec.{ts,tsx}',
            '!**/node_modules/**',
            '!**/dist/**'
        ],
        ignore: [
            'node_modules/**',
            '.git/**',
            'dist/**',
            'build/**',
            '.next/**',
            'coverage/**'
        ]
    },
    searchOptions: {
        fuzzy: true,
        maxResults: 20,
        minScore: 0.3
    },
    mcp: {
        enabled: true,
        serverName: 'tradosphere-context',
        version: '1.0.0'
    }
};
exports.default = exports.config;
//# sourceMappingURL=config.js.map