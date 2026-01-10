import type { ParsedChangelogEntry, SaveChangelogRequest } from '../types.js'
import { parseChangelogEntry, serialiseChangelogEntry } from '../mdx.js'
import {
  createGitHubClient,
  getBranchOid,
  getFileContent,
  listFiles,
  createCommit,
  createCommitApi,
} from './github-api.js'
import { parseGitHubRepoFromUrl } from './auth/github.js'
import { loadChronalogConfig } from '../config.js'
import type { SaveChangelogResult } from '../filesystem.js'

/**
 * Detects if we're in a serverless environment (Vercel, Cloudflare, etc.)
 */
function isServerlessEnvironment(): boolean {
  return (
    typeof process !== 'undefined' &&
    (process.env.VERCEL === '1' ||
      process.env.CF_PAGES === '1' ||
      process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined ||
      process.env.NODE_ENV === 'production')
  )
}

/**
 * Saves a changelog entry using GitHub API
 */
export async function saveChangelogEntryViaGitHub(
  entry: SaveChangelogRequest,
  accessToken: string,
  remoteUrl: string | null,
  changelogDir?: string,
  branch: string = 'main'
): Promise<SaveChangelogResult> {
  // If no remote URL, try to get from environment variables (serverless)
  if (!remoteUrl) {
    // First check Vercel's automatic variables (if connected to git)
    if (process.env.VERCEL_GIT_REPO_URL) {
      remoteUrl = process.env.VERCEL_GIT_REPO_URL
    } else {
      // Then check Chronalog-specific variables (if not connected to git)
      const repoOwner = process.env.CHRONALOG_REPO_OWNER || process.env.VERCEL_GIT_REPO_OWNER || process.env.OST_REPO_OWNER
      const repoSlug = process.env.CHRONALOG_REPO_SLUG || process.env.VERCEL_GIT_REPO_SLUG || process.env.OST_REPO_SLUG
      
      if (repoOwner && repoSlug) {
        remoteUrl = `https://github.com/${repoOwner}/${repoSlug}.git`
      }
    }
  }
  
  if (!remoteUrl) {
    throw new Error('Git remote URL is required for GitHub API operations. Set VERCEL_GIT_REPO_URL, CHRONALOG_REPO_OWNER/CHRONALOG_REPO_SLUG, VERCEL_GIT_REPO_OWNER/VERCEL_GIT_REPO_SLUG, or OST_REPO_OWNER/OST_REPO_SLUG environment variables.')
  }

  const repoInfo = parseGitHubRepoFromUrl(remoteUrl)
  if (!repoInfo) {
    throw new Error('Could not parse GitHub repository from remote URL')
  }

  const config = loadChronalogConfig()
  const targetDir = changelogDir || config.changelogDir

  // Generate filename
  let filename: string
  let originalDate: string | undefined

  if (entry.slug) {
    filename = `${entry.slug}.mdx`
    // Try to get existing file to preserve date
    const client = createGitHubClient(accessToken)
    const existingContent = await getFileContent(
      client,
      repoInfo.owner,
      repoInfo.name,
      `${targetDir}/${filename}`,
      branch
    )
    if (existingContent) {
      try {
        const existingEntry = parseChangelogEntry(existingContent, filename)
        originalDate = existingEntry.date
      } catch (error) {
        console.warn(`Failed to parse existing entry for date preservation: ${error}`)
      }
    }
  } else {
    if (!entry.version || !entry.version.trim()) {
      throw new Error('Version is required for changelog entries')
    }
    const cleanVersion = entry.version.trim().replace(/^v/i, '')
    const versionSlug = cleanVersion.replace(/\./g, '-')
    filename = `v${versionSlug}.mdx`
  }

  const filePath = `${targetDir}/${filename}`

  // When editing, preserve the original date
  const entryToSerialize = entry.slug && originalDate
    ? { ...entry, date: originalDate }
    : entry

  // Serialise entry to MDX
  const mdxContent = serialiseChangelogEntry(entryToSerialize)

  // Create GitHub client and get branch OID
  const client = createGitHubClient(accessToken)
  const oid = await getBranchOid(client, repoInfo.owner, repoInfo.name, branch)

  // Create commit API
  const commitMessage = config.commitMessageFormat.replace('{title}', entry.title)
  const commitApi = createCommitApi({
    message: commitMessage,
    owner: repoInfo.owner,
    oid,
    name: repoInfo.name,
    branch,
  })

  // Add file to commit
  commitApi.replaceFile(filePath, mdxContent)

  // Create commit
  const input = commitApi.createInput()
  const newOid = await createCommit(client, repoInfo.owner, repoInfo.name, branch, oid, commitMessage, input.fileChanges.additions, input.fileChanges.deletions)

  return {
    filePath,
    gitCommit: {
      success: true,
    },
  }
}

/**
 * Reads a changelog entry using GitHub API
 */
export async function readChangelogEntryViaGitHub(
  slug: string,
  accessToken: string,
  remoteUrl: string | null,
  changelogDir?: string,
  branch: string = 'main'
): Promise<ParsedChangelogEntry> {
  // If no remote URL, try to get from environment variables (serverless)
  if (!remoteUrl) {
    // First check Vercel's automatic variables (if connected to git)
    if (process.env.VERCEL_GIT_REPO_URL) {
      remoteUrl = process.env.VERCEL_GIT_REPO_URL
    } else {
      // Then check Chronalog-specific variables (if not connected to git)
      const repoOwner = process.env.CHRONALOG_REPO_OWNER || process.env.VERCEL_GIT_REPO_OWNER || process.env.OST_REPO_OWNER
      const repoSlug = process.env.CHRONALOG_REPO_SLUG || process.env.VERCEL_GIT_REPO_SLUG || process.env.OST_REPO_SLUG
      
      if (repoOwner && repoSlug) {
        remoteUrl = `https://github.com/${repoOwner}/${repoSlug}.git`
      }
    }
  }
  
  if (!remoteUrl) {
    throw new Error('Git remote URL is required for GitHub API operations. Set VERCEL_GIT_REPO_URL, CHRONALOG_REPO_OWNER/CHRONALOG_REPO_SLUG, VERCEL_GIT_REPO_OWNER/VERCEL_GIT_REPO_SLUG, or OST_REPO_OWNER/OST_REPO_SLUG environment variables.')
  }

  const repoInfo = parseGitHubRepoFromUrl(remoteUrl)
  if (!repoInfo) {
    throw new Error('Could not parse GitHub repository from remote URL')
  }

  const config = loadChronalogConfig()
  const targetDir = changelogDir || config.changelogDir
  const filename = `${slug}.mdx`
  const filePath = `${targetDir}/${filename}`

  const client = createGitHubClient(accessToken)
  const content = await getFileContent(client, repoInfo.owner, repoInfo.name, filePath, branch)

  if (!content) {
    throw new Error(`Changelog entry not found: ${slug}`)
  }

  return parseChangelogEntry(content, filename)
}

/**
 * Lists all changelog entries using GitHub API
 */
export async function listChangelogEntriesViaGitHub(
  accessToken: string,
  remoteUrl: string | null,
  changelogDir?: string,
  branch: string = 'main'
): Promise<ParsedChangelogEntry[]> {
  console.log('[Chronalog] listChangelogEntriesViaGitHub called with:', {
    hasAccessToken: !!accessToken,
    remoteUrl,
    changelogDir,
    branch,
  })
  
  // If no remote URL, try to get from environment variables (serverless)
  if (!remoteUrl) {
    // First check Vercel's automatic variables (if connected to git)
    if (process.env.VERCEL_GIT_REPO_URL) {
      remoteUrl = process.env.VERCEL_GIT_REPO_URL
    } else {
      // Then check Chronalog-specific variables (if not connected to git)
      const repoOwner = process.env.CHRONALOG_REPO_OWNER || process.env.VERCEL_GIT_REPO_OWNER || process.env.OST_REPO_OWNER
      const repoSlug = process.env.CHRONALOG_REPO_SLUG || process.env.VERCEL_GIT_REPO_SLUG || process.env.OST_REPO_SLUG
      
      if (repoOwner && repoSlug) {
        remoteUrl = `https://github.com/${repoOwner}/${repoSlug}.git`
      }
    }
  }
  
  if (!remoteUrl) {
    throw new Error('Git remote URL is required for GitHub API operations. Set VERCEL_GIT_REPO_URL, CHRONALOG_REPO_OWNER/CHRONALOG_REPO_SLUG, VERCEL_GIT_REPO_OWNER/VERCEL_GIT_REPO_SLUG, or OST_REPO_OWNER/OST_REPO_SLUG environment variables.')
  }

  const repoInfo = parseGitHubRepoFromUrl(remoteUrl)
  if (!repoInfo) {
    throw new Error('Could not parse GitHub repository from remote URL')
  }

  const config = loadChronalogConfig()
  const targetDir = changelogDir || config.changelogDir
  
  console.log('[Chronalog] Using target directory:', targetDir)
  console.log('[Chronalog] Repository info:', {
    owner: repoInfo.owner,
    name: repoInfo.name,
    branch,
  })

  // For public repos, we can use REST API without auth
  // For private repos or when we have a token, use GraphQL
  let files: Array<{ path: string; name: string; type: string }> = []
  
  if (accessToken) {
    // Use GraphQL with auth
    const client = createGitHubClient(accessToken)
    files = await listFiles(client, repoInfo.owner, repoInfo.name, targetDir, branch)
  } else {
    // Use REST API for public repos (no auth required)
    try {
      const url = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.name}/contents/${targetDir}?ref=${branch}`
      console.log(`[Chronalog] Fetching directory contents from GitHub API: ${url}`)
      const response = await fetch(url)
      console.log(`[Chronalog] GitHub API response status: ${response.status} ${response.statusText}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log(`[Chronalog] GitHub API returned data:`, {
          isArray: Array.isArray(data),
          itemCount: Array.isArray(data) ? data.length : 'not an array',
          dataType: typeof data,
        })
        files = Array.isArray(data) ? data.map((item: any) => ({
          path: item.path,
          name: item.name,
          type: item.type,
        })) : []
        console.log(`[Chronalog] Processed ${files.length} files from directory listing`)
      } else {
        // Response was not OK - log the error details
        const errorText = await response.text().catch(() => 'Could not read error response')
        let errorData: any = {}
        try {
          errorData = JSON.parse(errorText)
        } catch {
          // Not JSON, use raw text
        }
        
        console.error(`[Chronalog] GitHub API error (${response.status}):`, {
          status: response.status,
          statusText: response.statusText,
          url,
          errorBody: errorText,
          errorMessage: errorData.message || errorText,
          headers: Object.fromEntries(response.headers.entries()),
        })
        
        // If it's a 403, the repo might be private and we need authentication
        if (response.status === 403) {
          const errorMsg = errorData.message || errorText
          if (errorMsg.includes('private') || errorMsg.includes('permission') || errorMsg.includes('Forbidden')) {
            throw new Error(`Repository appears to be private. An access token is required to access private repositories. Error: ${errorMsg}`)
          }
          // Might be rate limiting
          if (errorMsg.includes('rate limit') || response.headers.get('x-ratelimit-remaining') === '0') {
            throw new Error(`GitHub API rate limit exceeded. Please try again later or use an access token for higher limits.`)
          }
        }
        
        // If it's a 404, the path might be wrong
        if (response.status === 404) {
          throw new Error(`Changelog directory not found at path: ${targetDir}. Please check that the directory exists in the repository at branch '${branch}'.`)
        }
        
        // For other errors, throw with details
        throw new Error(`Failed to fetch directory contents from GitHub API: ${response.status} ${response.statusText}. ${errorData.message || errorText}`)
      }
    } catch (error) {
      console.error('[Chronalog] Failed to list files via REST API:', error)
      throw error
    }
  }

  // Filter MDX files
  const mdxFiles = files.filter(
    (file) => (file.name.endsWith('.mdx') || file.name.endsWith('.md')) && file.type === 'blob'
  )

  // Read and parse each file
  const entries: ParsedChangelogEntry[] = []

  for (const file of mdxFiles) {
    try {
      let content: string | null = null
      
      if (accessToken) {
        // Use GraphQL with auth
        const client = createGitHubClient(accessToken)
        content = await getFileContent(client, repoInfo.owner, repoInfo.name, file.path, branch)
      } else {
        // Use REST API for public repos
        try {
          const url = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.name}/contents/${file.path}?ref=${branch}`
          const response = await fetch(url)
          if (response.ok) {
            const data = await response.json()
            if (data.content && data.encoding === 'base64') {
              content = Buffer.from(data.content, 'base64').toString('utf-8')
            } else {
              console.warn(`[Chronalog] File ${file.name} missing content or wrong encoding:`, {
                hasContent: !!data.content,
                encoding: data.encoding,
              })
            }
          } else {
            const errorText = await response.text().catch(() => 'Could not read error response')
            console.warn(`[Chronalog] Failed to fetch ${file.name} via REST API (${response.status}):`, {
              status: response.status,
              statusText: response.statusText,
              errorBody: errorText,
            })
          }
        } catch (error) {
          console.warn(`[Chronalog] Failed to fetch ${file.name} via REST API:`, error)
        }
      }
      
      if (content) {
        const entry = parseChangelogEntry(content, file.name)
        entries.push(entry)
      }
    } catch (error) {
      console.warn(`Failed to parse ${file.name}:`, error)
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
 * Determines if we should use GitHub API based on environment
 */
export function shouldUseGitHubAPI(): boolean {
  return isServerlessEnvironment()
}
