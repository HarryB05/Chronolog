import type { ChangelogEntry, ParsedChangelogEntry, SaveChangelogRequest } from "./types.js"

/**
 * Validates and normalises tags
 */
export function normaliseTags(tags?: string[]): string[] {
  if (!tags || tags.length === 0) {
    return []
  }

  return tags
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0)
    .filter((tag, index, array) => array.indexOf(tag) === index) // Remove duplicates
}

/**
 * Serialises a changelog entry into MDX format with frontmatter
 */
export function serialiseChangelogEntry(
  entry: SaveChangelogRequest
): string {
  // If date is provided, combine with current time; otherwise use current datetime
  let dateTime: string
  if (entry.date) {
    // If date is just a date (YYYY-MM-DD), combine with current time
    if (/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) {
      const dateOnly = new Date(entry.date)
      const now = new Date()
      // Set the date but keep current time
      dateOnly.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds())
      dateTime = dateOnly.toISOString()
    } else {
      // Assume it's already a full datetime string
      dateTime = entry.date
    }
  } else {
    // Use current datetime
    dateTime = new Date().toISOString()
  }

  const frontmatter: ChangelogEntry = {
    title: entry.title,
    date: dateTime,
  }

  if (entry.version) {
    frontmatter.version = entry.version
  }

  // Add commit hash if provided
  if (entry.commitHash) {
    frontmatter.commitHash = entry.commitHash
  }

  // Add updatedAt if editing (slug is provided)
  if (entry.slug) {
    frontmatter.updatedAt = new Date().toISOString()
  }

  // Normalise and add tags
  const tags = normaliseTags(entry.tags)
  if (tags.length > 0) {
    frontmatter.tags = tags
  }

  // Add features if provided
  if (entry.features && entry.features.length > 0) {
    frontmatter.features = entry.features
      .map((f) => f.trim())
      .filter((f) => f.length > 0)
  }

  // Add bugfixes if provided
  if (entry.bugfixes && entry.bugfixes.length > 0) {
    frontmatter.bugfixes = entry.bugfixes
      .map((b) => b.trim())
      .filter((b) => b.length > 0)
  }

  // Serialise frontmatter as YAML
  const frontmatterLines = Object.entries(frontmatter).map(([key, value]) => {
    if (Array.isArray(value)) {
      return `${key}:\n${value.map((v) => `  - ${JSON.stringify(v)}`).join("\n")}`
    }
    if (typeof value === "string" && value.includes(":")) {
      return `${key}: ${JSON.stringify(value)}`
    }
    return `${key}: ${value}`
  })

  const frontmatterBlock = `---\n${frontmatterLines.join("\n")}\n---`

  return `${frontmatterBlock}\n\n${entry.body}`
}

/**
 * Parses an MDX file and extracts frontmatter and content
 */
export function parseChangelogEntry(
  content: string,
  filename: string
): ParsedChangelogEntry {
  // Extract frontmatter block
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
  const match = content.match(frontmatterRegex)

  if (!match) {
    throw new Error(`Invalid MDX format: missing frontmatter in ${filename}`)
  }

  const frontmatterText = match[1]
  const body = match[2].trim()

  // Parse YAML frontmatter (simple parser for basic types)
  const frontmatter: ChangelogEntry = parseYamlFrontmatter(frontmatterText)

  // Validate required fields
  if (!frontmatter.title) {
    throw new Error(`Missing required field 'title' in ${filename}`)
  }
  if (!frontmatter.date) {
    throw new Error(`Missing required field 'date' in ${filename}`)
  }

  // Extract slug from filename (remove .mdx extension)
  const slug = filename.replace(/\.mdx?$/, "")

  // Normalise tags
  if (frontmatter.tags) {
    frontmatter.tags = normaliseTags(frontmatter.tags)
  }

  return {
    ...frontmatter,
    body,
    slug,
    filename,
  }
}

/**
 * Simple YAML frontmatter parser (handles basic types)
 */
function parseYamlFrontmatter(yaml: string): ChangelogEntry {
  const result: ChangelogEntry = {} as ChangelogEntry
  const lines = yaml.split("\n")
  let currentKey: string | null = null
  let currentValue: string[] = []
  let inArray = false

  for (const line of lines) {
    const trimmed = line.trim()

    // Skip empty lines
    if (!trimmed) continue

    // Check if this is an array item
    if (trimmed.startsWith("- ")) {
      if (currentKey && inArray) {
        const value = trimmed.slice(2).trim()
        // Remove quotes if present
        const unquoted = value.replace(/^["']|["']$/g, "")
        currentValue.push(unquoted)
      }
      continue
    }

    // If we were collecting array values, save them
    if (currentKey && inArray && currentValue.length > 0) {
      result[currentKey] = currentValue
      currentValue = []
      inArray = false
    }

    // Parse key-value pair
    const colonIndex = trimmed.indexOf(":")
    if (colonIndex === -1) continue

    currentKey = trimmed.slice(0, colonIndex).trim()
    let value = trimmed.slice(colonIndex + 1).trim()

    // Check if this starts an array
    if (value === "" || value === "[]") {
      inArray = true
      currentValue = []
      continue
    }

    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    // Try to parse as number or boolean
    if (value === "true") {
      result[currentKey] = true
    } else if (value === "false") {
      result[currentKey] = false
    } else if (value === "null") {
      result[currentKey] = null
    } else if (/^-?\d+$/.test(value)) {
      result[currentKey] = parseInt(value, 10)
    } else if (/^-?\d+\.\d+$/.test(value)) {
      result[currentKey] = parseFloat(value)
    } else {
      result[currentKey] = value
    }
  }

  // Handle trailing array
  if (currentKey && inArray && currentValue.length > 0) {
    result[currentKey] = currentValue
  }

  return result
}

/**
 * Generates a slug from a title or uses the provided slug
 */
export function generateSlug(title: string, providedSlug?: string): string {
  if (providedSlug) {
    return providedSlug
  }

  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
