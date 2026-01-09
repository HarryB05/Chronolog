/**
 * Frontmatter schema for changelog entries
 */
interface ChangelogEntry {
    title: string;
    date: string;
    version?: string;
    tags?: string[];
    features?: string[];
    bugfixes?: string[];
    body?: string;
    commitHash?: string;
    updatedAt?: string;
    [key: string]: unknown;
}
/**
 * Request body for saving a changelog entry
 */
interface SaveChangelogRequest {
    title: string;
    date?: string;
    version?: string;
    tags?: string[];
    features?: string[];
    bugfixes?: string[];
    body: string;
    slug?: string;
    commitHash?: string;
}
/**
 * Parsed changelog entry with content and metadata
 */
interface ParsedChangelogEntry extends ChangelogEntry {
    body: string;
    slug: string;
    filename: string;
}

/**
 * Validates and normalises tags
 */
declare function normaliseTags(tags?: string[]): string[];
/**
 * Serialises a changelog entry into MDX format with frontmatter
 */
declare function serialiseChangelogEntry(entry: SaveChangelogRequest): string;
/**
 * Parses an MDX file and extracts frontmatter and content
 */
declare function parseChangelogEntry(content: string, filename: string): ParsedChangelogEntry;
/**
 * Generates a slug from a title or uses the provided slug
 */
declare function generateSlug(title: string, providedSlug?: string): string;

/**
 * Increments a semantic version number
 * @param version Current version string (e.g., "1.2.3")
 * @param type Type of increment: "major", "minor", or "patch"
 * @returns New version string
 */
declare function incrementVersion(version: string, type: "major" | "minor" | "patch"): string;
/**
 * Validates if a string is a valid semantic version
 * @param version Version string to validate
 * @returns True if valid semantic version
 */
declare function isValidVersion(version: string): boolean;
/**
 * Extracts version from a changelog entry
 * @param version Optional version string
 * @returns Version string or null
 */
declare function extractVersion(version?: string): string | null;

export { type ChangelogEntry, type ParsedChangelogEntry, type SaveChangelogRequest, extractVersion, generateSlug, incrementVersion, isValidVersion, normaliseTags, parseChangelogEntry, serialiseChangelogEntry };
