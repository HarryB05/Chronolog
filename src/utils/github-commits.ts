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
  if (!remoteUrl) {
    throw new Error('Git remote URL is required for GitHub API operations')
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
