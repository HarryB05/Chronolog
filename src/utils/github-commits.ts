import { createGitHubClient } from './github-api.js'
import { parseGitHubRepoFromUrl } from './auth/github.js'

export interface GitHubCommit {
  hash: string
  shortHash: string
  message: string
  author: string
  date: string
}

/**
 * Gets git commit history using GitHub API
 */
export async function getGitCommitHistoryViaGitHub(
  accessToken: string,
  remoteUrl: string | null,
  limit: number = 50,
  branch: string = 'main'
): Promise<GitHubCommit[]> {
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

  const client = createGitHubClient(accessToken)

  const query = `
    query GetCommits($owner: String!, $name: String!, $branch: String!, $limit: Int!) {
      repository(owner: $owner, name: $name) {
        ref(qualifiedName: $branch) {
          target {
            ... on Commit {
              history(first: $limit) {
                edges {
                  node {
                    oid
                    messageHeadline
                    author {
                      name
                      date
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `

  try {
    const data = await client.request<{
      repository: {
        ref: {
          target: {
            history: {
              edges: Array<{
                node: {
                  oid: string
                  messageHeadline: string
                  author: {
                    name: string
                    date: string
                  }
                }
              }>
            }
          } | null
        } | null
      }
    }>(query, {
      owner: repoInfo.owner,
      name: repoInfo.name,
      branch,
      limit,
    })

    if (!data.repository?.ref?.target) {
      return []
    }

    const commits: GitHubCommit[] = data.repository.ref.target.history.edges.map((edge) => {
      const commit = edge.node
      return {
        hash: commit.oid,
        shortHash: commit.oid.substring(0, 7),
        message: commit.messageHeadline,
        author: commit.author.name,
        date: commit.author.date,
      }
    })

    return commits
  } catch (error) {
    console.error('Error fetching commits via GitHub API:', error)
    return []
  }
}
