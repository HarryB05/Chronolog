export function chronalog() {
  return "Chronalog initialised"
}

// Export types and utilities (server-safe)
export * from "./types.js"
export * from "./mdx.js"
export * from "./version.js"

// Server-only exports (use Node.js built-ins)
// These should only be imported in API routes or server components
export * from "./filesystem.js"
export * from "./git.js"
export * from "./config.js"

// Explicit re-exports for better compatibility
export {
  saveChangelogEntry,
  readChangelogEntry,
  listChangelogEntries,
  filterChangelogEntriesByTags,
  getAllTags,
  saveMediaFile,
  listMediaFiles,
  readPredefinedTags,
  savePredefinedTags,
  saveHomeUrl,
  type SaveChangelogResult,
} from "./filesystem.js"

export type { ParsedChangelogEntry } from "./types.js"

// Auth exports (server-only)
export {
  getLoginSession,
  setLoginSession,
  clearLoginSession,
  type LoginSession,
} from "./utils/auth/auth.js"

export {
  getAccessToken,
  fetchGitHubUser,
  checkRepository,
  checkCollaborator,
  parseGitHubRepoFromUrl,
} from "./utils/auth/github.js"

export {
  getGitHubCommitUrl,
  getGitCommitHistory,
  type GitCommit,
} from "./git.js"