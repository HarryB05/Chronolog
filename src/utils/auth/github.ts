import { MAX_AGE } from './constants'

export async function getAccessToken(
  code:
    | { code: string }
    | { refresh_token: string; grant_type: 'refresh_token' }
) {
  const request = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: process.env.CHRONALOG_GITHUB_ID,
      client_secret: process.env.CHRONALOG_GITHUB_SECRET,
      ...code
    })
  })
  const text = await request.text()
  const params = new URLSearchParams(text)
  return {
    access_token: params.get('access_token'),
    expires_in:
      (params.get('expires_in')
        ? parseInt(params.get('expires_in')!)
        : MAX_AGE) * 1000,
    refresh_token: params.get('refresh_token') || undefined,
    refresh_token_expires_in: params.get('refresh_token_expires_in')
      ? parseInt(params.get('refresh_token_expires_in')!) * 1000
      : undefined
  }
}

export async function fetchGitHubUser(token: string) {
  const request = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: 'token ' + token
    }
  })
  return await request.json()
}

export async function checkRepository(token: string, repoOwner: string, repoName: string) {
  const response = await fetch(
    `https://api.github.com/repos/${repoOwner}/${repoName}`,
    {
      headers: {
        Authorization: `token ${token}`
      }
    }
  )
  return response.status === 200
}

export async function checkCollaborator(token: string, repoOwner: string, repoName: string, userName: string) {
  const response = await fetch(
    `https://api.github.com/repos/${repoOwner}/${repoName}/collaborators/${userName}`,
    {
      headers: {
        Authorization: `token ${token}`
      }
    }
  )
  // 204 means user is a collaborator, 404 means not
  return response.status === 204
}

// Helper to parse owner/repo from Git URL
export function parseGitHubRepoFromUrl(url: string | null): { owner: string; name: string } | null {
  if (!url) return null
  
  // Handle both SSH and HTTPS URLs
  // git@github.com:owner/repo.git -> owner/repo
  // https://github.com/owner/repo.git -> owner/repo
  const match = url.match(/(?:github\.com[/:]|git@github\.com:)([^/]+)\/([^/]+?)(?:\.git)?$/)
  if (match) {
    return {
      owner: match[1],
      name: match[2].replace('.git', '')
    }
  }
  return null
}
