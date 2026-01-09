import fs from "fs"
import path from "path"
import type { ParsedChangelogEntry, SaveChangelogRequest } from "./types.js"
import { generateSlug, parseChangelogEntry, serialiseChangelogEntry } from "./mdx.js"
import { autoCommitChangelog } from "./git.js"
import { loadChronalogConfig } from "./config.js"

/**
 * Finds the project root directory by looking for package.json or other indicators
 * This is more reliable than process.cwd() in Next.js API routes
 * @param startDir Starting directory (defaults to process.cwd())
 * @returns Project root directory path
 */
function findProjectRoot(startDir: string = process.cwd()): string {
  let currentDir = path.resolve(startDir)
  const root = path.parse(currentDir).root

  while (currentDir !== root) {
    // Look for indicators of project root
    const packageJsonPath = path.join(currentDir, "package.json")
    const nextConfigPath = path.join(currentDir, "next.config.js")
    const nextConfigTsPath = path.join(currentDir, "next.config.ts")
    const appDir = path.join(currentDir, "app")
    const pagesDir = path.join(currentDir, "pages")

    if (
      fs.existsSync(packageJsonPath) &&
      (fs.existsSync(nextConfigPath) ||
        fs.existsSync(nextConfigTsPath) ||
        fs.existsSync(appDir) ||
        fs.existsSync(pagesDir))
    ) {
      return currentDir
    }

    currentDir = path.dirname(currentDir)
  }

  // Fallback to process.cwd() if we can't find project root
  return process.cwd()
}

/**
 * Result of saving a changelog entry
 */
export interface SaveChangelogResult {
  filePath: string
  gitCommit?: {
    success: boolean
    error?: string
  }
}

/**
 * Saves a changelog entry to the filesystem and optionally commits to Git
 * @param entry The changelog entry to save
 * @param changelogDir The directory where changelog files are stored (default: from config or "changelog")
 * @param autoCommit Whether to automatically commit to Git (default: from config or true)
 * @returns The result with file path and Git commit status
 */
export function saveChangelogEntry(
  entry: SaveChangelogRequest,
  changelogDir?: string,
  autoCommit?: boolean
): SaveChangelogResult {
  const cwd = findProjectRoot()
  const config = loadChronalogConfig(cwd)
  
  const targetDir = path.join(cwd, changelogDir || config.changelogDir)
  const shouldAutoCommit = autoCommit !== undefined ? autoCommit : config.autoCommit

  // Create changelog directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
  }

  // Generate filename from version (required for proper file naming)
  // Version is now required - files are named after version numbers
  if (!entry.version || !entry.version.trim()) {
    throw new Error("Version is required for changelog entries. Please provide a version number.")
  }

  // If slug is provided (editing), use it to determine filename
  // Otherwise, generate filename from version
  let filename: string
  let originalDate: string | undefined
  if (entry.slug) {
    filename = `${entry.slug}.mdx`
    const filePath = path.join(targetDir, filename)
    // Read existing entry to preserve original date
    if (fs.existsSync(filePath)) {
      try {
        const existingContent = fs.readFileSync(filePath, "utf-8")
        const existingEntry = parseChangelogEntry(existingContent, filename)
        originalDate = existingEntry.date
      } catch (error) {
        // If we can't read the existing entry, continue without preserving date
        console.warn(`Failed to read existing entry for date preservation: ${error}`)
      }
    }
  } else {
  // Use version number for filename (remove any 'v' prefix and replace dots with hyphens)
  const cleanVersion = entry.version.trim().replace(/^v/i, "")
  const versionSlug = cleanVersion.replace(/\./g, "-")
    filename = `v${versionSlug}.mdx`
  }
  const filePath = path.join(targetDir, filename)

  // When editing, preserve the original date
  const entryToSerialize = entry.slug && originalDate
    ? { ...entry, date: originalDate }
    : entry

  // Serialise entry to MDX
  const mdxContent = serialiseChangelogEntry(entryToSerialize)

  // Write file
  fs.writeFileSync(filePath, mdxContent, "utf-8")

  const result: SaveChangelogResult = {
    filePath,
  }

  // Auto-commit to Git (Level 2: local auto-commit)
  if (shouldAutoCommit) {
    // Get relative path from project root for Git
    const relativePath = path.relative(cwd, filePath)
    
    // Commit the file to Git
    const gitResult = autoCommitChangelog(
      relativePath,
      entry.title,
      config.commitMessageFormat,
      cwd
    )

    result.gitCommit = gitResult
  }

  return result
}

/**
 * Reads a changelog entry from the filesystem
 * @param slug The slug of the changelog entry
 * @param changelogDir The directory where changelog files are stored (default: from config or "changelog")
 * @returns The parsed changelog entry
 */
export function readChangelogEntry(
  slug: string,
  changelogDir?: string
): ParsedChangelogEntry {
  const cwd = findProjectRoot()
  const config = loadChronalogConfig(cwd)
  const targetDir = path.join(cwd, changelogDir || config.changelogDir)
  const filename = `${slug}.mdx`
  const filePath = path.join(targetDir, filename)

  if (!fs.existsSync(filePath)) {
    throw new Error(`Changelog entry not found: ${slug}`)
  }

  const content = fs.readFileSync(filePath, "utf-8")
  return parseChangelogEntry(content, filename)
}

/**
 * Lists all changelog entries
 * @param changelogDir The directory where changelog files are stored (default: from config or "changelog")
 * @returns Array of parsed changelog entries
 */
export function listChangelogEntries(
  changelogDir?: string
): ParsedChangelogEntry[] {
  const cwd = findProjectRoot()
  const config = loadChronalogConfig(cwd)
  const targetDir = path.join(cwd, changelogDir || config.changelogDir)

  if (!fs.existsSync(targetDir)) {
    return []
  }

  const files = fs.readdirSync(targetDir)
  const mdxFiles = files.filter((file) => file.endsWith(".mdx") || file.endsWith(".md"))

  const entries: ParsedChangelogEntry[] = []

  for (const filename of mdxFiles) {
    try {
      const filePath = path.join(targetDir, filename)
      const content = fs.readFileSync(filePath, "utf-8")
      const entry = parseChangelogEntry(content, filename)
      entries.push(entry)
    } catch (error) {
      console.warn(`Failed to parse ${filename}:`, error)
    }
  }

  // Sort by date (newest first)
  return entries.sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateB - dateA
  })
}

/**
 * Filters changelog entries by tags
 * @param entries Array of changelog entries to filter
 * @param tags Tags to filter by (entry must have at least one matching tag)
 * @returns Filtered array of changelog entries
 */
export function filterChangelogEntriesByTags(
  entries: ParsedChangelogEntry[],
  tags: string[]
): ParsedChangelogEntry[] {
  if (tags.length === 0) {
    return entries
  }

  const normalisedTags = tags.map((tag) => tag.trim().toLowerCase())

  return entries.filter((entry) => {
    if (!entry.tags || entry.tags.length === 0) {
      return false
    }

    const entryTags = entry.tags.map((tag) => tag.toLowerCase())
    return normalisedTags.some((tag) => entryTags.includes(tag))
  })
}

/**
 * Gets all unique tags from changelog entries
 * @param entries Array of changelog entries
 * @returns Array of unique tags
 */
export function getAllTags(entries: ParsedChangelogEntry[]): string[] {
  const tagSet = new Set<string>()

  for (const entry of entries) {
    if (entry.tags && entry.tags.length > 0) {
      for (const tag of entry.tags) {
        tagSet.add(tag.toLowerCase())
      }
    }
  }

  return Array.from(tagSet).sort()
}

/**
 * Saves a media file to the public directory
 * @param fileBuffer The file buffer to save
 * @param filename The filename to save as
 * @param mediaDir The directory where media files are stored (default: "public/chronalog")
 * @returns The public URL path to the saved file
 */
export function saveMediaFile(
  fileBuffer: Buffer,
  filename: string,
  mediaDir: string = "public/chronalog"
): string {
  const cwd = process.cwd()
  const targetDir = path.join(cwd, mediaDir)

  // Create media directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
  }

  // Sanitise filename to prevent path traversal
  const sanitisedFilename = filename
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/^-+|-+$/g, "")
  
  // Ensure filename is unique by adding timestamp if needed
  const filePath = path.join(targetDir, sanitisedFilename)
  
  // If file exists, add timestamp prefix
  let finalPath = filePath
  if (fs.existsSync(finalPath)) {
    const ext = path.extname(sanitisedFilename)
    const nameWithoutExt = path.basename(sanitisedFilename, ext)
    const timestamp = Date.now()
    finalPath = path.join(targetDir, `${nameWithoutExt}-${timestamp}${ext}`)
  }

  // Write file
  fs.writeFileSync(finalPath, fileBuffer)

  // Return public URL path (relative to public directory)
  const relativePath = path.relative(path.join(cwd, "public"), finalPath)
  return `/${relativePath.replace(/\\/g, "/")}`
}

/**
 * Lists all media files in the media directory
 * @param mediaDir The directory where media files are stored (default: "public/chronalog")
 * @returns Array of media file information
 */
export function listMediaFiles(
  mediaDir: string = "public/chronalog"
): Array<{ filename: string; url: string; size: number; modified: Date }> {
  const cwd = process.cwd()
  const targetDir = path.join(cwd, mediaDir)

  if (!fs.existsSync(targetDir)) {
    return []
  }

  const files = fs.readdirSync(targetDir)
  const mediaFiles: Array<{ filename: string; url: string; size: number; modified: Date }> = []

  for (const filename of files) {
    const filePath = path.join(targetDir, filename)
    const stats = fs.statSync(filePath)
    
    // Only include files (not directories)
    if (stats.isFile()) {
      const relativePath = path.relative(path.join(cwd, "public"), filePath)
      const url = `/${relativePath.replace(/\\/g, "/")}`
      
      mediaFiles.push({
        filename,
        url,
        size: stats.size,
        modified: stats.mtime,
      })
    }
  }

  // Sort by modified date (newest first)
  return mediaFiles.sort((a, b) => b.modified.getTime() - a.modified.getTime())
}

/**
 * Reads predefined tags from chronalog/config.json in the project root
 * @param configDir The directory for the config file (default: "chronalog")
 * @returns Array of predefined tags
 */
export function readPredefinedTags(
  configDir: string = "chronalog"
): string[] {
  const projectRoot = findProjectRoot()
  const configDirPath = path.join(projectRoot, configDir)
  const configPath = path.join(configDirPath, "config.json")

  // Create directory and file if they don't exist
  if (!fs.existsSync(configDirPath)) {
    fs.mkdirSync(configDirPath, { recursive: true })
  }

  if (!fs.existsSync(configPath)) {
    // Create default config file
    const defaultConfig = { tags: [] }
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), "utf-8")
    return []
  }

  try {
    const content = fs.readFileSync(configPath, "utf-8")
    
    // Remove BOM if present and trim whitespace
    const cleanedContent = content.replace(/^\uFEFF/, "").trim()
    
    // Skip if file is empty
    if (!cleanedContent) {
      return []
    }
    
    const data = JSON.parse(cleanedContent)
    
    // Support both array format and object with tags array
    if (Array.isArray(data)) {
      return data.filter((tag: unknown): tag is string => typeof tag === "string")
    } else if (data && typeof data === "object" && Array.isArray(data.tags)) {
      return data.tags.filter((tag: unknown): tag is string => typeof tag === "string")
    }
    
    return []
  } catch (error) {
    console.error("Error reading predefined tags:", error)
    // If JSON is invalid, try to create a fresh config file
    try {
      const defaultConfig = { tags: [] }
      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), "utf-8")
    } catch (writeError) {
      console.error("Error creating default config:", writeError)
    }
    return []
  }
}

/**
 * Saves predefined tags to chronalog/config.json in the project root
 * @param tags Array of tags to save
 * @param configDir The directory for the config file (default: "chronalog")
 * @returns Success status
 */
export function savePredefinedTags(
  tags: string[],
  configDir: string = "chronalog"
): { success: boolean; error?: string } {
  const projectRoot = findProjectRoot()
  const configDirPath = path.join(projectRoot, configDir)
  const configPath = path.join(configDirPath, "config.json")

  try {
    console.log("[savePredefinedTags] Project root:", projectRoot)
    console.log("[savePredefinedTags] Current working directory:", process.cwd())
    console.log("[savePredefinedTags] Config path:", configPath)
    console.log("[savePredefinedTags] Config path exists:", fs.existsSync(configPath))
    console.log("[savePredefinedTags] Tags to save:", tags)

    // Create chronalog directory if it doesn't exist
    if (!fs.existsSync(configDirPath)) {
      fs.mkdirSync(configDirPath, { recursive: true })
      console.log("[savePredefinedTags] Created directory:", configDirPath)
    }

    // Read existing config if it exists
    let existingConfig: Record<string, unknown> = {}
    if (fs.existsSync(configPath)) {
      try {
        const existingContent = fs.readFileSync(configPath, "utf-8")
        existingConfig = JSON.parse(existingContent)
        console.log("[savePredefinedTags] Existing config:", existingConfig)
      } catch (error) {
        console.warn("Error reading existing config, will create new one:", error)
      }
    }

    // Validate tags are strings
    const validTags = tags
      .filter((tag: unknown): tag is string => typeof tag === "string")
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag.length > 0)
      .sort()

    // Remove duplicates
    const uniqueTags = Array.from(new Set(validTags))
    console.log("[savePredefinedTags] Validated and unique tags:", uniqueTags)

    // Merge with existing config, preserving other properties
    const updatedConfig = {
      ...existingConfig,
      tags: uniqueTags,
    }

    // Write to JSON file
    const content = JSON.stringify(updatedConfig, null, 2)
    fs.writeFileSync(configPath, content, "utf-8")
    console.log("[savePredefinedTags] Successfully wrote config to:", configPath)
    console.log("[savePredefinedTags] Config content:", content)

    // Verify the file was written correctly
    if (!fs.existsSync(configPath)) {
      throw new Error(`Config file was not created at ${configPath}`)
    }

    const writtenContent = fs.readFileSync(configPath, "utf-8")
    const writtenConfig = JSON.parse(writtenContent)
    if (JSON.stringify(writtenConfig.tags) !== JSON.stringify(uniqueTags)) {
      throw new Error(
        `Config file content mismatch. Expected: ${JSON.stringify(uniqueTags)}, Got: ${JSON.stringify(writtenConfig.tags)}`
      )
    }

    console.log("[savePredefinedTags] Verified config file was written correctly")

    return { success: true }
  } catch (error) {
    console.error("Error saving predefined tags:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Saves home URL to chronalog/config.json in the project root
 * @param homeUrl The home URL to save
 * @param configDir The directory for the config file (default: "chronalog")
 * @returns Success status
 */
export function saveHomeUrl(
  homeUrl: string,
  configDir: string = "chronalog"
): { success: boolean; error?: string } {
  const projectRoot = findProjectRoot()
  const configDirPath = path.join(projectRoot, configDir)
  const configPath = path.join(configDirPath, "config.json")

  try {
    // Create chronalog directory if it doesn't exist
    if (!fs.existsSync(configDirPath)) {
      fs.mkdirSync(configDirPath, { recursive: true })
    }

    // Read existing config if it exists
    let existingConfig: Record<string, unknown> = {}
    if (fs.existsSync(configPath)) {
      try {
        const existingContent = fs.readFileSync(configPath, "utf-8")
        const cleanedContent = existingContent.replace(/^\uFEFF/, "").trim()
        if (cleanedContent) {
          existingConfig = JSON.parse(cleanedContent)
        }
      } catch (error) {
        console.warn("Error reading existing config, will create new one:", error)
      }
    }

    // Validate homeUrl is a string
    const validHomeUrl = typeof homeUrl === "string" && homeUrl.trim() ? homeUrl.trim() : "/"

    // Merge with existing config, preserving other properties
    const updatedConfig = {
      ...existingConfig,
      homeUrl: validHomeUrl,
    }

    // Write to JSON file
    const content = JSON.stringify(updatedConfig, null, 2)
    fs.writeFileSync(configPath, content, "utf-8")

    return { success: true }
  } catch (error) {
    console.error("Error saving home URL:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
