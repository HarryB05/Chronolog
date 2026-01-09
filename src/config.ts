import fs from "fs"
import path from "path"

/**
 * Configuration options for Chronalog
 */
export interface ChronalogConfig {
  /**
   * Directory where changelog files are stored (default: "chronalog/changelog")
   */
  changelogDir?: string

  /**
   * Route path for the admin interface (default: "/chronalog")
   */
  adminRoute?: string

  /**
   * Route path for the public changelog page (default: "/changelog")
   */
  changelogRoute?: string

  /**
   * API route path for saving entries (default: "/api/changelog/save")
   */
  apiRoute?: string

  /**
   * Custom commit message format
   * Use {title} as placeholder for entry title
   * Default: "changelog: {title}"
   */
  commitMessageFormat?: string

  /**
   * Whether to auto-commit changes (default: true)
   */
  autoCommit?: boolean

  /**
   * Home URL for the home button in the navbar (default: "/")
   */
  homeUrl?: string
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Required<ChronalogConfig> = {
  changelogDir: "chronalog/changelog",
  adminRoute: "/chronalog",
  changelogRoute: "/changelog",
  apiRoute: "/api/changelog/save",
  commitMessageFormat: "changelog: {title}",
  autoCommit: true,
  homeUrl: "/",
}

/**
 * Loads Chronalog configuration from changelog.config.ts or changelog.config.js
 * Note: In Next.js environments, config should be loaded at build time.
 * This function attempts to read and parse the config file synchronously.
 * 
 * @param cwd Working directory (defaults to process.cwd())
 * @returns Configuration object with defaults merged
 */
export function loadChronalogConfig(
  cwd: string = process.cwd()
): Required<ChronalogConfig> {
  const configPaths = [
    path.join(cwd, "changelog.config.ts"),
    path.join(cwd, "changelog.config.js"),
    path.join(cwd, "changelog.config.mjs"),
  ]

  for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
      try {
        // For .ts files, we can't directly require them in ESM
        // This is a limitation - in practice, config should be loaded
        // at build time or via a bundler that handles TypeScript
        if (configPath.endsWith(".ts")) {
          // Skip .ts files in runtime - they need to be compiled first
          continue
        }

        // Use dynamic import for .js/.mjs files
        // Note: This is async, but we're in a sync context
        // In practice, this should be handled differently
        // For now, we'll use a synchronous approach with require
        if (typeof require !== "undefined") {
          const config = require(configPath)
          const userConfig = config.default || config

          return {
            ...DEFAULT_CONFIG,
            ...userConfig,
          }
        }
      } catch (error) {
        console.warn(`Failed to load config from ${configPath}:`, error)
      }
    }
  }

  return DEFAULT_CONFIG
}

/**
 * Gets the default configuration
 */
export function getDefaultConfig(): Required<ChronalogConfig> {
  return { ...DEFAULT_CONFIG }
}
