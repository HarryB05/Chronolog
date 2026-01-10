import {
  createGitHubClient,
  getBranchOid,
  getFileContent,
  createCommit,
  createCommitApi,
} from './github-api.js'
import { parseGitHubRepoFromUrl } from './auth/github.js'

/**
 * Reads predefined tags from chronalog/config.json using GitHub API
 */
export async function readPredefinedTagsViaGitHub(
  accessToken: string,
  remoteUrl: string | null,
  configDir: string = 'chronalog',
  branch: string = 'main'
): Promise<string[]> {
  if (!remoteUrl) {
    throw new Error('Git remote URL is required for GitHub API operations')
  }

  const repoInfo = parseGitHubRepoFromUrl(remoteUrl)
  if (!repoInfo) {
    throw new Error('Could not parse GitHub repository from remote URL')
  }

  const configPath = `${configDir}/config.json`
  const client = createGitHubClient(accessToken)
  const content = await getFileContent(client, repoInfo.owner, repoInfo.name, configPath, branch)

  if (!content) {
    return [] // Config doesn't exist yet
  }

  try {
    const data = JSON.parse(content)
    
    // Support both array format and object with tags array
    if (Array.isArray(data)) {
      return data.filter((tag: unknown): tag is string => typeof tag === 'string')
    } else if (data && typeof data === 'object' && Array.isArray(data.tags)) {
      return data.tags.filter((tag: unknown): tag is string => typeof tag === 'string')
    }
    
    return []
  } catch (error) {
    console.error('Error parsing config.json:', error)
    return []
  }
}

/**
 * Saves predefined tags to chronalog/config.json using GitHub API
 */
export async function savePredefinedTagsViaGitHub(
  tags: string[],
  accessToken: string,
  remoteUrl: string | null,
  configDir: string = 'chronalog',
  branch: string = 'main'
): Promise<{ success: boolean; error?: string }> {
  if (!remoteUrl) {
    throw new Error('Git remote URL is required for GitHub API operations')
  }

  const repoInfo = parseGitHubRepoFromUrl(remoteUrl)
  if (!repoInfo) {
    throw new Error('Could not parse GitHub repository from remote URL')
  }

  try {
    const configPath = `${configDir}/config.json`
    const client = createGitHubClient(accessToken)
    
    // Get existing config
    let existingConfig: Record<string, unknown> = {}
    const existingContent = await getFileContent(client, repoInfo.owner, repoInfo.name, configPath, branch)
    if (existingContent) {
      try {
        existingConfig = JSON.parse(existingContent)
      } catch (error) {
        console.warn('Error reading existing config, will create new one:', error)
      }
    }

    // Validate and process tags
    const validTags = tags
      .filter((tag: unknown): tag is string => typeof tag === 'string')
      .map((tag: string) => tag.trim())
      .filter((tag: string) => tag.length > 0)
      .sort()

    const uniqueTags = Array.from(new Set(validTags))

    // Merge with existing config
    const updatedConfig = {
      ...existingConfig,
      tags: uniqueTags,
    }

    // Create commit
    const oid = await getBranchOid(client, repoInfo.owner, repoInfo.name, branch)
    const commitApi = createCommitApi({
      message: 'chore: update predefined tags',
      owner: repoInfo.owner,
      oid,
      name: repoInfo.name,
      branch,
    })

    commitApi.replaceFile(configPath, JSON.stringify(updatedConfig, null, 2))
    const input = commitApi.createInput()
    await createCommit(client, repoInfo.owner, repoInfo.name, branch, oid, 'chore: update predefined tags', input.fileChanges.additions, input.fileChanges.deletions)

    return { success: true }
  } catch (error) {
    console.error('Error saving predefined tags via GitHub API:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Reads home URL from chronalog/config.json using GitHub API
 */
export async function readHomeUrlViaGitHub(
  accessToken: string,
  remoteUrl: string | null,
  configDir: string = 'chronalog',
  branch: string = 'main'
): Promise<string> {
  if (!remoteUrl) {
    return '/' // Default if no remote URL
  }

  const repoInfo = parseGitHubRepoFromUrl(remoteUrl)
  if (!repoInfo) {
    return '/'
  }

  const configPath = `${configDir}/config.json`
  const client = createGitHubClient(accessToken)
  const content = await getFileContent(client, repoInfo.owner, repoInfo.name, configPath, branch)

  if (!content) {
    return '/' // Default if config doesn't exist
  }

  try {
    const data = JSON.parse(content)
    if (data && typeof data === 'object' && typeof data.homeUrl === 'string') {
      return data.homeUrl.trim() || '/'
    }
    return '/'
  } catch (error) {
    console.error('Error parsing config.json:', error)
    return '/'
  }
}

/**
 * Saves home URL to chronalog/config.json using GitHub API
 */
export async function saveHomeUrlViaGitHub(
  homeUrl: string,
  accessToken: string,
  remoteUrl: string | null,
  configDir: string = 'chronalog',
  branch: string = 'main'
): Promise<{ success: boolean; error?: string }> {
  if (!remoteUrl) {
    throw new Error('Git remote URL is required for GitHub API operations')
  }

  const repoInfo = parseGitHubRepoFromUrl(remoteUrl)
  if (!repoInfo) {
    throw new Error('Could not parse GitHub repository from remote URL')
  }

  try {
    const configPath = `${configDir}/config.json`
    const client = createGitHubClient(accessToken)
    
    // Get existing config
    let existingConfig: Record<string, unknown> = {}
    const existingContent = await getFileContent(client, repoInfo.owner, repoInfo.name, configPath, branch)
    if (existingContent) {
      try {
        existingConfig = JSON.parse(existingContent)
      } catch (error) {
        console.warn('Error reading existing config, will create new one:', error)
      }
    }

    // Validate homeUrl
    const validHomeUrl = typeof homeUrl === 'string' && homeUrl.trim() ? homeUrl.trim() : '/'

    // Merge with existing config
    const updatedConfig = {
      ...existingConfig,
      homeUrl: validHomeUrl,
    }

    // Create commit
    const oid = await getBranchOid(client, repoInfo.owner, repoInfo.name, branch)
    const commitApi = createCommitApi({
      message: 'chore: update home URL',
      owner: repoInfo.owner,
      oid,
      name: repoInfo.name,
      branch,
    })

    commitApi.replaceFile(configPath, JSON.stringify(updatedConfig, null, 2))
    const input = commitApi.createInput()
    await createCommit(client, repoInfo.owner, repoInfo.name, branch, oid, 'chore: update home URL', input.fileChanges.additions, input.fileChanges.deletions)

    return { success: true }
  } catch (error) {
    console.error('Error saving home URL via GitHub API:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
