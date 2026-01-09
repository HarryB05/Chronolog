/**
 * Frontmatter schema for changelog entries
 */
export interface ChangelogEntry {
  title: string
  date: string
  version?: string
  tags?: string[]
  features?: string[]
  bugfixes?: string[]
  body?: string
  commitHash?: string
  updatedAt?: string
  [key: string]: unknown
}

/**
 * Request body for saving a changelog entry
 */
export interface SaveChangelogRequest {
  title: string
  date?: string
  version?: string
  tags?: string[]
  features?: string[]
  bugfixes?: string[]
  body: string
  slug?: string
  commitHash?: string
}

/**
 * Parsed changelog entry with content and metadata
 */
export interface ParsedChangelogEntry extends ChangelogEntry {
  body: string
  slug: string
  filename: string
}
