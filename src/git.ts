import { execSync } from "child_process"
import fs from "fs"
import path from "path"

/**
 * Checks if the current directory is a Git repository
 */
export function isGitRepository(cwd: string = process.cwd()): boolean {
  const gitDir = path.join(cwd, ".git")
  return fs.existsSync(gitDir)
}

/**
 * Checks if Git is installed and available
 */
export function isGitInstalled(): boolean {
  try {
    execSync("git --version", { stdio: "ignore" })
    return true
  } catch {
    return false
  }
}

/**
 * Checks if the working directory is clean (no uncommitted changes)
 */
export function isWorkingDirectoryClean(cwd: string = process.cwd()): boolean {
  try {
    const status = execSync("git status --porcelain", {
      cwd,
      encoding: "utf-8",
      stdio: "pipe",
    })
    return status.trim() === ""
  } catch {
    // If git status fails, assume not clean to be safe
    return false
  }
}

/**
 * Stages a file for commit
 */
export function stageFile(filePath: string, cwd: string = process.cwd()): void {
  try {
    execSync(`git add "${filePath}"`, {
      cwd,
      stdio: "pipe",
    })
  } catch (error) {
    throw new Error(`Failed to stage file: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Commits staged changes with a message
 * @returns The commit hash of the created commit
 */
export function commitChanges(message: string, cwd: string = process.cwd()): string {
  try {
    // Get the current HEAD before committing (to ensure we get the right commit after)
    const beforeCommit = execSync("git rev-parse HEAD", {
      cwd,
      encoding: "utf-8",
      stdio: "pipe",
    }).trim()
    
    execSync(`git commit -m "${message}"`, {
      cwd,
      stdio: "pipe",
    })
    
    // Get the commit hash of the commit we just made
    // Use HEAD^..HEAD to get the commit we just created
    const commitHash = execSync("git rev-parse HEAD", {
      cwd,
      encoding: "utf-8",
      stdio: "pipe",
    })
    const hash = commitHash.trim()
    
    // Verify this is a new commit (not the same as before)
    if (hash === beforeCommit) {
      throw new Error("Commit did not create a new commit hash")
    }
    
    return hash
  } catch (error) {
    throw new Error(`Failed to commit changes: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Gets the Git remote URL (origin)
 */
export function getGitRemoteUrl(cwd: string = process.cwd()): string | null {
  try {
    if (!isGitRepository(cwd)) {
      return null
    }

    const remoteUrl = execSync("git config --get remote.origin.url", {
      cwd,
      encoding: "utf-8",
      stdio: "pipe",
    })

    return remoteUrl.trim() || null
  } catch {
    return null
  }
}

/**
 * Gets the current Git branch name
 */
export function getGitBranch(cwd: string = process.cwd()): string | null {
  try {
    if (!isGitRepository(cwd)) {
      return null
    }

    const branch = execSync("git branch --show-current", {
      cwd,
      encoding: "utf-8",
      stdio: "pipe",
    })

    return branch.trim() || null
  } catch {
    return null
  }
}

/**
 * Auto-commits a changelog entry file
 * This is Level 2: local auto-commit (does not push to remote)
 * 
 * @param filePath Relative path to the changelog file (e.g., "changelog/entry.mdx")
 * @param title Title of the changelog entry for the commit message
 * @param commitMessageFormat Custom commit message format (default: "changelog: {title}")
 * @param cwd Working directory (defaults to process.cwd())
 * @returns Object with success status, optional commit hash, and optional error message
 */
export function autoCommitChangelog(
  filePath: string,
  title: string,
  commitMessageFormat: string = "changelog: {title}",
  cwd: string = process.cwd()
): { success: boolean; commitHash?: string; error?: string } {
  // Check if Git is installed
  if (!isGitInstalled()) {
    return {
      success: false,
      error: "Git is not installed or not available in PATH",
    }
  }

  // Check if this is a Git repository
  if (!isGitRepository(cwd)) {
    return {
      success: false,
      error: "Not a Git repository. Initialize Git first.",
    }
  }

  try {
    // Stage the changelog file
    stageFile(filePath, cwd)

    // Create commit message from format
    const commitMessage = commitMessageFormat.replace("{title}", title)

    // Commit the changes and get the commit hash
    const commitHash = commitChanges(commitMessage, cwd)

    return { success: true, commitHash }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error during commit",
    }
  }
}

/**
 * Gets the GitHub commit URL for a given commit hash
 */
export function getGitHubCommitUrl(commitHash: string, cwd: string = process.cwd()): string | null {
  const remoteUrl = getGitRemoteUrl(cwd)
  if (!remoteUrl) return null
  
  // Parse GitHub URL
  const match = remoteUrl.match(/(?:github\.com[/:]|git@github\.com:)([^/]+)\/([^/]+?)(?:\.git)?$/)
  if (match) {
    const owner = match[1]
    const repo = match[2].replace('.git', '')
    return `https://github.com/${owner}/${repo}/commit/${commitHash}`
  }
  return null
}

/**
 * Git commit information
 */
export interface GitCommit {
  hash: string
  message: string
  author: string
  date: string
  shortHash: string
}

/**
 * Gets a list of recent git commits
 * @param limit Maximum number of commits to return (default: 50)
 * @param cwd Working directory (defaults to process.cwd())
 * @returns Array of commit information
 */
export function getGitCommitHistory(
  limit: number = 50,
  cwd: string = process.cwd()
): GitCommit[] {
  try {
    if (!isGitRepository(cwd)) {
      return []
    }

    // Get commits with format: hash|author|date|message
    // Using %H for full hash, %an for author name, %ai for author date, %s for subject
    const format = "%H|%an|%ai|%s"
    const output = execSync(
      `git log -n ${limit} --pretty=format:"${format}"`,
      {
        cwd,
        encoding: "utf-8",
        stdio: "pipe",
      }
    )

    const commits: GitCommit[] = []
    const lines = output.trim().split("\n").filter((line) => line.trim())

    for (const line of lines) {
      const parts = line.split("|")
      if (parts.length >= 4) {
        const hash = parts[0]
        const author = parts[1]
        const date = parts[2]
        const message = parts.slice(3).join("|") // In case message contains |

        commits.push({
          hash,
          shortHash: hash.substring(0, 7),
          author,
          date,
          message,
        })
      }
    }

    return commits
  } catch (error) {
    console.error("Failed to get git commit history:", error)
    return []
  }
}
