#!/usr/bin/env node

import fs from "fs"
import path from "path"

const cwd = process.cwd()

const appDir = path.join(cwd, "app")
const cmsRouteGroupDir = path.join(appDir, "(cms)")
const chronalogAdminDir = path.join(cmsRouteGroupDir, "chronalog")
const layoutPath = path.join(cmsRouteGroupDir, "layout.tsx")
const pagePath = path.join(chronalogAdminDir, "page.tsx")
const apiSaveDir = path.join(appDir, "api", "changelog", "save")
const apiSaveRoutePath = path.join(apiSaveDir, "route.ts")
const apiListDir = path.join(appDir, "api", "changelog", "list")
const apiListRoutePath = path.join(apiListDir, "route.ts")
const apiLatestDir = path.join(appDir, "api", "changelog", "latest")
const apiLatestRoutePath = path.join(apiLatestDir, "route.ts")
const configPath = path.join(cwd, "changelog.config.ts")

if (!fs.existsSync(appDir)) {
  console.error("Chronalog must be run inside a Next.js project (missing /app)")
  process.exit(1)
}

// Create route group directory for CMS (isolates styles from main site)
if (!fs.existsSync(cmsRouteGroupDir)) {
  fs.mkdirSync(cmsRouteGroupDir, { recursive: true })
  console.log("✓ Created /app/(cms)")
} else {
  console.log("✓ /app/(cms) already exists")
}

// Create layout for CMS route group
if (!fs.existsSync(layoutPath)) {
  const layoutContent = `import "../globals.css"

export default function CMSLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
`

  fs.writeFileSync(layoutPath, layoutContent, "utf-8")
  console.log("✓ Created /app/(cms)/layout.tsx")
} else {
  console.log("✓ /app/(cms)/layout.tsx already exists")
}

// Create chronalog admin directory
if (!fs.existsSync(chronalogAdminDir)) {
  fs.mkdirSync(chronalogAdminDir, { recursive: true })
  console.log("✓ Created /app/(cms)/chronalog")
} else {
  console.log("✓ /app/(cms)/chronalog already exists")
}

// Scaffold the admin page if it doesn't exist
if (!fs.existsSync(pagePath)) {
  const pageContent = `"use client"

import "chronalog/chronalog.css"
export { default } from "chronalog/admin-page"
`

  fs.writeFileSync(pagePath, pageContent, "utf-8")
  console.log("✓ Created /app/(cms)/chronalog/page.tsx")
} else {
  console.log("✓ /app/(cms)/chronalog/page.tsx already exists")
}

// Scaffold the save API route if it doesn't exist
if (!fs.existsSync(apiSaveRoutePath)) {
  // Create API directory structure
  if (!fs.existsSync(apiSaveDir)) {
    fs.mkdirSync(apiSaveDir, { recursive: true })
    console.log("✓ Created /app/api/changelog/save")
  }

  const apiRouteContent = `import { NextResponse } from "next/server";
import { saveChangelogEntry, getLoginSession } from "chronalog";
import type { SaveChangelogRequest } from "chronalog";

export async function POST(request: Request) {
  // Check authentication
  const session = await getLoginSession();
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body: SaveChangelogRequest = await request.json();

    // Validate required fields
    if (!body.title || !body.body) {
      return NextResponse.json(
        { error: "Title and body are required" },
        { status: 400 }
      );
    }

    // Validate version is provided (required for file naming)
    if (!body.version || !body.version.trim()) {
      return NextResponse.json(
        { error: "Version is required for changelog entries" },
        { status: 400 }
      );
    }

    // Save the changelog entry (uses config for directory and auto-commit)
    const result = saveChangelogEntry(body);

    // Prepare response
    const response: {
      success: boolean;
      message: string;
      path: string;
      gitCommit?: {
        success: boolean;
        error?: string;
      };
    } = {
      success: true,
      message: "Changelog entry saved successfully",
      path: result.filePath,
    };

    // Include Git commit status if available
    if (result.gitCommit) {
      response.gitCommit = result.gitCommit;

      // If Git commit failed, log warning but don't fail the request
      // The file was still saved successfully
      if (!result.gitCommit.success) {
        console.warn("Changelog entry saved but Git commit failed:", result.gitCommit.error);
      }
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error saving changelog entry:", error);
    return NextResponse.json(
      {
        error: "Failed to save changelog entry",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
`

  fs.writeFileSync(apiSaveRoutePath, apiRouteContent, "utf-8")
  console.log("✓ Created /app/api/changelog/save/route.ts")
} else {
  console.log("✓ /app/api/changelog/save/route.ts already exists")
}

// Scaffold the list API route if it doesn't exist
if (!fs.existsSync(apiListRoutePath)) {
  // Create API directory structure
  if (!fs.existsSync(apiListDir)) {
    fs.mkdirSync(apiListDir, { recursive: true })
    console.log("✓ Created /app/api/changelog/list")
  }

  const apiListRouteContent = `import { NextResponse } from "next/server";
import { listChangelogEntries } from "chronalog";

export async function GET() {
  try {
    const entries = listChangelogEntries();

    return NextResponse.json(
      {
        success: true,
        entries,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error listing changelog entries:", error);
    return NextResponse.json(
      {
        error: "Failed to list changelog entries",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
`

  fs.writeFileSync(apiListRoutePath, apiListRouteContent, "utf-8")
  console.log("✓ Created /app/api/changelog/list/route.ts")
} else {
  console.log("✓ /app/api/changelog/list/route.ts already exists")
}

// Scaffold the latest API route if it doesn't exist
if (!fs.existsSync(apiLatestRoutePath)) {
  // Create API directory structure
  if (!fs.existsSync(apiLatestDir)) {
    fs.mkdirSync(apiLatestDir, { recursive: true })
    console.log("✓ Created /app/api/changelog/latest")
  }

  const apiLatestRouteContent = `import { NextResponse } from "next/server";
import { listChangelogEntries } from "chronalog";

export async function GET() {
  try {
    const entries = listChangelogEntries();

    // Return the latest entry (first in the sorted list)
    const latestEntry = entries.length > 0 ? entries[0] : null;

    return NextResponse.json(
      {
        success: true,
        entry: latestEntry,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching latest changelog entry:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch latest changelog entry",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
`

  fs.writeFileSync(apiLatestRoutePath, apiLatestRouteContent, "utf-8")
  console.log("✓ Created /app/api/changelog/latest/route.ts")
} else {
  console.log("✓ /app/api/changelog/latest/route.ts already exists")
}

// Scaffold the settings API route if it doesn't exist
const apiSettingsDir = path.join(appDir, "api", "changelog", "settings")
const apiSettingsRoutePath = path.join(apiSettingsDir, "route.ts")
if (!fs.existsSync(apiSettingsRoutePath)) {
  // Create API directory structure
  if (!fs.existsSync(apiSettingsDir)) {
    fs.mkdirSync(apiSettingsDir, { recursive: true })
    console.log("✓ Created /app/api/changelog/settings")
  }

  const apiSettingsRouteContent = `import { NextResponse } from "next/server"
import { getGitRemoteUrl, getGitBranch, isGitRepository, isGitInstalled } from "chronalog"
import { loadChronalogConfig } from "chronalog"

export async function GET() {
  try {
    const config = loadChronalogConfig()
    const remoteUrl = getGitRemoteUrl()
    const branch = getGitBranch()
    const isRepo = isGitRepository()
    const gitInstalled = isGitInstalled()

    // Check environment variables
    const envVars = {
      CHRONALOG_GITHUB_ID: !!process.env.CHRONALOG_GITHUB_ID,
      CHRONALOG_GITHUB_SECRET: !!process.env.CHRONALOG_GITHUB_SECRET,
      CHRONALOG_REPO_OWNER: !!process.env.CHRONALOG_REPO_OWNER,
      CHRONALOG_REPO_SLUG: !!process.env.CHRONALOG_REPO_SLUG,
      CHRONALOG_REPO_BRANCH: !!process.env.CHRONALOG_REPO_BRANCH,
    }
    const allEnvVarsSet = envVars.CHRONALOG_GITHUB_ID && envVars.CHRONALOG_GITHUB_SECRET

    return NextResponse.json(
      {
        success: true,
        info: {
          remoteUrl,
          branch,
          isGitRepository: isRepo,
          isGitInstalled: gitInstalled,
          changelogDir: config.changelogDir,
          envVars: {
            configured: allEnvVarsSet,
            ...envVars,
          },
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching repository info:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch repository information",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
`

  fs.writeFileSync(apiSettingsRoutePath, apiSettingsRouteContent, "utf-8")
  console.log("✓ Created /app/api/changelog/settings/route.ts")
} else {
  console.log("✓ /app/api/changelog/settings/route.ts already exists")
}

// Scaffold the settings page if it doesn't exist
const settingsPageDir = path.join(chronalogAdminDir, "settings")
const settingsPagePath = path.join(settingsPageDir, "page.tsx")
if (!fs.existsSync(settingsPagePath)) {
  // Create settings directory
  if (!fs.existsSync(settingsPageDir)) {
    fs.mkdirSync(settingsPageDir, { recursive: true })
    console.log("✓ Created /app/(cms)/chronalog/settings")
  }

  const settingsPageContent = `"use client"

import "chronalog/chronalog.css"
export { default } from "chronalog/admin-settings"
`

  fs.writeFileSync(settingsPagePath, settingsPageContent, "utf-8")
  console.log("✓ Created /app/(cms)/chronalog/settings/page.tsx")
} else {
  console.log("✓ /app/(cms)/chronalog/settings/page.tsx already exists")
}

// Scaffold the media page if it doesn't exist
const mediaPageDir = path.join(chronalogAdminDir, "media")
const mediaPagePath = path.join(mediaPageDir, "page.tsx")
if (!fs.existsSync(mediaPagePath)) {
  // Create media directory
  if (!fs.existsSync(mediaPageDir)) {
    fs.mkdirSync(mediaPageDir, { recursive: true })
    console.log("✓ Created /app/(cms)/chronalog/media")
  }

  const mediaPageContent = `"use client"

import "chronalog/chronalog.css"
export { default } from "chronalog/admin-media"
`

  fs.writeFileSync(mediaPagePath, mediaPageContent, "utf-8")
  console.log("✓ Created /app/(cms)/chronalog/media/page.tsx")
} else {
  console.log("✓ /app/(cms)/chronalog/media/page.tsx already exists")
}

// Scaffold auth API routes
const apiAuthDir = path.join(appDir, "api", "changelog", "auth")
const apiAuthLoginDir = path.join(apiAuthDir, "login")
const apiAuthLoginRoutePath = path.join(apiAuthLoginDir, "route.ts")
const apiAuthCallbackDir = path.join(apiAuthDir, "callback")
const apiAuthCallbackRoutePath = path.join(apiAuthCallbackDir, "route.ts")
const apiAuthUserDir = path.join(apiAuthDir, "user")
const apiAuthUserRoutePath = path.join(apiAuthUserDir, "route.ts")
const apiAuthSignoutDir = path.join(apiAuthDir, "signout")
const apiAuthSignoutRoutePath = path.join(apiAuthSignoutDir, "route.ts")

// Login route
if (!fs.existsSync(apiAuthLoginRoutePath)) {
  if (!fs.existsSync(apiAuthLoginDir)) {
    fs.mkdirSync(apiAuthLoginDir, { recursive: true })
    console.log("✓ Created /app/api/changelog/auth/login")
  }

  const apiAuthLoginContent = `import { NextResponse } from "next/server"

export async function GET() {
  const scopes = ['read:user', 'user:email', 'repo']

  const url = new URL('https://github.com/login/oauth/authorize')

  url.searchParams.append('client_id', process.env.CHRONALOG_GITHUB_ID ?? '')
  url.searchParams.append('scope', scopes.join(','))
  url.searchParams.append('response_type', 'code')
  if (process.env?.CHRONALOG_GITHUB_CALLBACK_URL) {
    url.searchParams.append('redirect_uri', process.env.CHRONALOG_GITHUB_CALLBACK_URL)
  }

  return NextResponse.json({ url: url.toString() })
}
`

  fs.writeFileSync(apiAuthLoginRoutePath, apiAuthLoginContent, "utf-8")
  console.log("✓ Created /app/api/changelog/auth/login/route.ts")
} else {
  console.log("✓ /app/api/changelog/auth/login/route.ts already exists")
}

// Check env route
const apiAuthCheckEnvDir = path.join(apiAuthDir, "check-env")
const apiAuthCheckEnvRoutePath = path.join(apiAuthCheckEnvDir, "route.ts")
if (!fs.existsSync(apiAuthCheckEnvRoutePath)) {
  if (!fs.existsSync(apiAuthCheckEnvDir)) {
    fs.mkdirSync(apiAuthCheckEnvDir, { recursive: true })
    console.log("✓ Created /app/api/changelog/auth/check-env")
  }

  const apiAuthCheckEnvContent = `import { NextResponse } from "next/server"

export async function GET() {
  const missing: string[] = []
  
  if (!process.env.CHRONALOG_GITHUB_ID) {
    missing.push('CHRONALOG_GITHUB_ID')
  }
  
  if (!process.env.CHRONALOG_GITHUB_SECRET) {
    missing.push('CHRONALOG_GITHUB_SECRET')
  }
  
  // Check repository variables (only required in serverless without Git connection)
  const isServerless = process.env.VERCEL === '1' || process.env.CF_PAGES === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME
  const hasVercelGitVars = process.env.VERCEL_GIT_REPO_URL || (process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG)
  
  if (isServerless && !hasVercelGitVars) {
    if (!process.env.CHRONALOG_REPO_OWNER) {
      missing.push('CHRONALOG_REPO_OWNER')
    }
    if (!process.env.CHRONALOG_REPO_SLUG) {
      missing.push('CHRONALOG_REPO_SLUG')
    }
  }

  return NextResponse.json({
    configured: missing.length === 0,
    missing: missing.length > 0 ? missing : undefined,
    note: isServerless && !hasVercelGitVars 
      ? 'In serverless environments without Git connection, CHRONALOG_REPO_OWNER and CHRONALOG_REPO_SLUG are required'
      : undefined
  })
}
`

  fs.writeFileSync(apiAuthCheckEnvRoutePath, apiAuthCheckEnvContent, "utf-8")
  console.log("✓ Created /app/api/changelog/auth/check-env/route.ts")
} else {
  console.log("✓ /app/api/changelog/auth/check-env/route.ts already exists")
}

// Callback route
if (!fs.existsSync(apiAuthCallbackRoutePath)) {
  if (!fs.existsSync(apiAuthCallbackDir)) {
    fs.mkdirSync(apiAuthCallbackDir, { recursive: true })
    console.log("✓ Created /app/api/changelog/auth/callback")
  }

  const apiAuthCallbackContent = `import { NextRequest, NextResponse } from "next/server"
import { setLoginSession, getGitRemoteUrl } from "chronalog"
import { getAccessToken, fetchGitHubUser, checkRepository, checkCollaborator, parseGitHubRepoFromUrl } from "chronalog"

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const error = url.searchParams.get('error')

  // Handle GitHub errors
  if (error) {
    return NextResponse.redirect(
      new URL(\`/chronalog?error=\${error}\`, request.url)
    )
  }

  const code = url.searchParams.get('code') as string | null
  if (!code) {
    return NextResponse.redirect(
      new URL('/chronalog?error=missing_code', request.url)
    )
  }

  try {
    const {
      access_token,
      refresh_token,
      expires_in,
      refresh_token_expires_in
    } = await getAccessToken({ code })

    if (!access_token) {
      return NextResponse.redirect(
        new URL('/chronalog?error=no_access_token', request.url)
      )
    }

    let userData = await fetchGitHubUser(access_token)
    
    // If email is missing, fetch from /user/emails
    if (!userData.email) {
      const emails = await (
        await fetch('https://api.github.com/user/emails', {
          headers: {
            Authorization: \`token \${access_token}\`
          }
        })
      ).json()

      if (Array.isArray(emails) && emails.length > 0) {
        const primary = emails.find((email: any) => email.primary)
        userData.email = primary ? primary.email : emails[0].email
      }
    }

    // Verify repository access
    const remoteUrl = getGitRemoteUrl()
    const repoInfo = parseGitHubRepoFromUrl(remoteUrl)
    
    if (repoInfo) {
      // Check if user has access to the repository
      const hasRepoAccess = await checkRepository(access_token, repoInfo.owner, repoInfo.name)
      
      if (!hasRepoAccess) {
        // If not the owner, check if they're a collaborator
        const isCollaborator = await checkCollaborator(access_token, repoInfo.owner, repoInfo.name, userData.login)
        
        if (!isCollaborator) {
          return NextResponse.redirect(
            new URL('/chronalog?error=access_denied', request.url)
          )
        }
      }
    }

    if (userData && userData.email && access_token) {
      const { name, login, email, avatar_url } = userData
      const sessionData = {
        user: { name: name || '', login, email, image: avatar_url },
        access_token,
        refresh_token,
        expires: new Date(Date.now() + expires_in),
        refresh_token_expires: refresh_token_expires_in
          ? new Date(Date.now() + refresh_token_expires_in)
          : undefined
      }
      await setLoginSession(sessionData)
      // Use absolute URL for redirect
      const origin = url.origin
      return NextResponse.redirect(new URL('/chronalog', origin))
    } else {
      return NextResponse.redirect(
        new URL('/chronalog?error=missing_user_data', request.url)
      )
    }
  } catch (err) {
    console.error('Auth callback error:', err)
    return NextResponse.redirect(
      new URL('/chronalog?error=auth_callback_failed', request.url)
    )
  }
}
`

  fs.writeFileSync(apiAuthCallbackRoutePath, apiAuthCallbackContent, "utf-8")
  console.log("✓ Created /app/api/changelog/auth/callback/route.ts")
} else {
  console.log("✓ /app/api/changelog/auth/callback/route.ts already exists")
}

// User route
if (!fs.existsSync(apiAuthUserRoutePath)) {
  if (!fs.existsSync(apiAuthUserDir)) {
    fs.mkdirSync(apiAuthUserDir, { recursive: true })
    console.log("✓ Created /app/api/changelog/auth/user")
  }

  const apiAuthUserContent = `import { NextResponse } from "next/server"
import { getLoginSession } from "chronalog"

export async function GET() {
  try {
    const session = await getLoginSession()
    return NextResponse.json({ session })
  } catch (error) {
    return NextResponse.json({ error })
  }
}
`

  fs.writeFileSync(apiAuthUserRoutePath, apiAuthUserContent, "utf-8")
  console.log("✓ Created /app/api/changelog/auth/user/route.ts")
} else {
  console.log("✓ /app/api/changelog/auth/user/route.ts already exists")
}

// Signout route
if (!fs.existsSync(apiAuthSignoutRoutePath)) {
  if (!fs.existsSync(apiAuthSignoutDir)) {
    fs.mkdirSync(apiAuthSignoutDir, { recursive: true })
    console.log("✓ Created /app/api/changelog/auth/signout")
  }

  const apiAuthSignoutContent = `import { NextRequest, NextResponse } from "next/server"
import { clearLoginSession } from "chronalog"

export async function GET(req: NextRequest) {
  await clearLoginSession()

  const homeUrl = new URL('/', req.url)
  return NextResponse.redirect(homeUrl)
}
`

  fs.writeFileSync(apiAuthSignoutRoutePath, apiAuthSignoutContent, "utf-8")
  console.log("✓ Created /app/api/changelog/auth/signout/route.ts")
} else {
  console.log("✓ /app/api/changelog/auth/signout/route.ts already exists")
}

// Scaffold tags API route if it doesn't exist
const apiTagsDir = path.join(appDir, "api", "changelog", "tags")
const apiTagsRoutePath = path.join(apiTagsDir, "route.ts")
if (!fs.existsSync(apiTagsRoutePath)) {
  if (!fs.existsSync(apiTagsDir)) {
    fs.mkdirSync(apiTagsDir, { recursive: true })
    console.log("✓ Created /app/api/changelog/tags")
  }

  const apiTagsContent = `import { NextResponse } from "next/server"
import { readPredefinedTags, savePredefinedTags, getLoginSession } from "chronalog"

export async function GET() {
  const session = await getLoginSession()
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const tags = readPredefinedTags()
    return NextResponse.json(
      {
        success: true,
        tags,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error reading predefined tags:", error)
    return NextResponse.json(
      {
        error: "Failed to read predefined tags",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await getLoginSession()
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { tags } = body

    if (!Array.isArray(tags)) {
      return NextResponse.json(
        { error: "Tags must be an array" },
        { status: 400 }
      )
    }

    const result = savePredefinedTags(tags)

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Failed to save predefined tags",
          details: result.error || "Unknown error",
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Tags saved successfully",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error saving predefined tags:", error)
    return NextResponse.json(
      {
        error: "Failed to save predefined tags",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
`

  fs.writeFileSync(apiTagsRoutePath, apiTagsContent, "utf-8")
  console.log("✓ Created /app/api/changelog/tags/route.ts")
} else {
  console.log("✓ /app/api/changelog/tags/route.ts already exists")
}

// Scaffold commits API route if it doesn't exist
const apiCommitsDir = path.join(appDir, "api", "changelog", "commits")
const apiCommitsRoutePath = path.join(apiCommitsDir, "route.ts")
if (!fs.existsSync(apiCommitsRoutePath)) {
  if (!fs.existsSync(apiCommitsDir)) {
    fs.mkdirSync(apiCommitsDir, { recursive: true })
    console.log("✓ Created /app/api/changelog/commits")
  }

  const apiCommitsContent = `import { NextResponse } from "next/server"
import { getGitCommitHistory, getLoginSession } from "chronalog"

export async function GET() {
  const session = await getLoginSession()
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const commits = getGitCommitHistory(50)
    
    const formattedCommits = commits.map((commit) => ({
      hash: commit.hash,
      shortHash: commit.hash.substring(0, 7),
      message: commit.message,
      author: commit.author,
      date: commit.date,
    }))

    return NextResponse.json(
      {
        success: true,
        commits: formattedCommits,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching git commits:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch git commits",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
`

  fs.writeFileSync(apiCommitsRoutePath, apiCommitsContent, "utf-8")
  console.log("✓ Created /app/api/changelog/commits/route.ts")
} else {
  console.log("✓ /app/api/changelog/commits/route.ts already exists")
}

// Scaffold home-url API route if it doesn't exist
const apiHomeUrlDir = path.join(appDir, "api", "changelog", "home-url")
const apiHomeUrlRoutePath = path.join(apiHomeUrlDir, "route.ts")
if (!fs.existsSync(apiHomeUrlRoutePath)) {
  if (!fs.existsSync(apiHomeUrlDir)) {
    fs.mkdirSync(apiHomeUrlDir, { recursive: true })
    console.log("✓ Created /app/api/changelog/home-url")
  }

  const apiHomeUrlContent = `import { NextResponse } from "next/server"
import { loadChronalogConfig, saveHomeUrl, getLoginSession } from "chronalog"

export async function GET() {
  const session = await getLoginSession()
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const config = loadChronalogConfig()
    const homeUrl = config.homeUrl || "/"
    
    return NextResponse.json(
      {
        success: true,
        homeUrl,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error reading home URL:", error)
    return NextResponse.json(
      {
        error: "Failed to read home URL",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await getLoginSession()
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { homeUrl } = body

    if (typeof homeUrl !== "string") {
      return NextResponse.json(
        { error: "Home URL must be a string" },
        { status: 400 }
      )
    }

    const result = saveHomeUrl(homeUrl)

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Failed to save home URL",
          details: result.error || "Unknown error",
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Home URL saved successfully",
        homeUrl,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error saving home URL:", error)
    return NextResponse.json(
      {
        error: "Failed to save home URL",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
`

  fs.writeFileSync(apiHomeUrlRoutePath, apiHomeUrlContent, "utf-8")
  console.log("✓ Created /app/api/changelog/home-url/route.ts")
} else {
  console.log("✓ /app/api/changelog/home-url/route.ts already exists")
}

// Scaffold media API routes if they don't exist
const apiMediaDir = path.join(appDir, "api", "changelog", "media")
const apiMediaListDir = path.join(apiMediaDir, "list")
const apiMediaListRoutePath = path.join(apiMediaListDir, "route.ts")
const apiMediaUploadDir = path.join(apiMediaDir, "upload")
const apiMediaUploadRoutePath = path.join(apiMediaUploadDir, "route.ts")
const apiMediaDeleteDir = path.join(apiMediaDir, "delete")
const apiMediaDeleteRoutePath = path.join(apiMediaDeleteDir, "route.ts")

// List route
if (!fs.existsSync(apiMediaListRoutePath)) {
  if (!fs.existsSync(apiMediaListDir)) {
    fs.mkdirSync(apiMediaListDir, { recursive: true })
  }

  const apiMediaListContent = `import { NextResponse } from "next/server"
import { listMediaFiles, getLoginSession } from "chronalog"

export async function GET() {
  const session = await getLoginSession()
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const files = listMediaFiles()
    
    const formattedFiles = files.map((file) => ({
      filename: file.filename,
      url: file.url,
      size: file.size,
      modified: file.modified.toISOString(),
    }))

    return NextResponse.json(
      {
        success: true,
        files: formattedFiles,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error listing media files:", error)
    return NextResponse.json(
      {
        error: "Failed to list media files",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
`

  fs.writeFileSync(apiMediaListRoutePath, apiMediaListContent, "utf-8")
  console.log("✓ Created /app/api/changelog/media/list/route.ts")
} else {
  console.log("✓ /app/api/changelog/media/list/route.ts already exists")
}

// Upload route
if (!fs.existsSync(apiMediaUploadRoutePath)) {
  if (!fs.existsSync(apiMediaUploadDir)) {
    fs.mkdirSync(apiMediaUploadDir, { recursive: true })
  }

  const apiMediaUploadContent = `import { NextResponse } from "next/server"
import { saveMediaFile, getLoginSession } from "chronalog"

export async function POST(request: Request) {
  const session = await getLoginSession()
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      )
    }

    const uploadedFiles: Array<{ filename: string; url: string }> = []

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        continue
      }

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const url = saveMediaFile(buffer, file.name)

      uploadedFiles.push({
        filename: file.name,
        url,
      })
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        { error: "No valid image files were uploaded" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: \`Successfully uploaded \${uploadedFiles.length} file(s)\`,
        files: uploadedFiles,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error uploading media files:", error)
    return NextResponse.json(
      {
        error: "Failed to upload media files",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
`

  fs.writeFileSync(apiMediaUploadRoutePath, apiMediaUploadContent, "utf-8")
  console.log("✓ Created /app/api/changelog/media/upload/route.ts")
} else {
  console.log("✓ /app/api/changelog/media/upload/route.ts already exists")
}

// Delete route
if (!fs.existsSync(apiMediaDeleteRoutePath)) {
  if (!fs.existsSync(apiMediaDeleteDir)) {
    fs.mkdirSync(apiMediaDeleteDir, { recursive: true })
  }

  const apiMediaDeleteContent = `import { NextResponse } from "next/server"
import { getLoginSession } from "chronalog"
import fs from "fs"
import path from "path"

export async function POST(request: Request) {
  const session = await getLoginSession()
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { filename } = body

    if (!filename || typeof filename !== "string") {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 }
      )
    }

    const sanitizedFilename = filename
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/^-+|-+$/g, "")

    const mediaDir = path.join(process.cwd(), "public", "chronalog")
    const filePath = path.join(mediaDir, sanitizedFilename)

    if (!filePath.startsWith(mediaDir)) {
      return NextResponse.json(
        { error: "Invalid file path" },
        { status: 400 }
      )
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      )
    }

    fs.unlinkSync(filePath)

    return NextResponse.json(
      {
        success: true,
        message: "File deleted successfully",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting media file:", error)
    return NextResponse.json(
      {
        error: "Failed to delete media file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
`

  fs.writeFileSync(apiMediaDeleteRoutePath, apiMediaDeleteContent, "utf-8")
  console.log("✓ Created /app/api/changelog/media/delete/route.ts")
} else {
  console.log("✓ /app/api/changelog/media/delete/route.ts already exists")
}

// Scaffold config file if it doesn't exist
if (!fs.existsSync(configPath)) {
  const configContent = `import type { ChronalogConfig } from "chronalog";

/**
 * Chronalog configuration
 * 
 * Customise folder paths, route paths, and commit message format.
 * All fields are optional and will use defaults if not specified.
 */
const config: ChronalogConfig = {
  // Directory where changelog files are stored
  changelogDir: "chronalog/changelog",

  // Route path for the admin interface
  // adminRoute: "/chronalog",

  // Route path for the public changelog page
  // changelogRoute: "/changelog",

  // API route path for saving entries
  // apiRoute: "/api/changelog/save",

  // Custom commit message format (use {title} as placeholder)
  // commitMessageFormat: "changelog: {title}",

  // Whether to auto-commit changes to Git
  // autoCommit: true,
};

export default config;
`

  fs.writeFileSync(configPath, configContent, "utf-8")
  console.log("✓ Created changelog.config.ts")
} else {
  console.log("✓ changelog.config.ts already exists")
}

// Create chronalog directory structure and config.json if they don't exist
const chronalogDir = path.join(cwd, "chronalog")
const chronalogChangelogDir = path.join(chronalogDir, "changelog")
const chronalogConfigPath = path.join(chronalogDir, "config.json")

if (!fs.existsSync(chronalogDir)) {
  fs.mkdirSync(chronalogDir, { recursive: true })
  console.log("✓ Created /chronalog directory")
} else {
  console.log("✓ /chronalog directory already exists")
}

// Create changelog subdirectory
if (!fs.existsSync(chronalogChangelogDir)) {
  fs.mkdirSync(chronalogChangelogDir, { recursive: true })
  console.log("✓ Created /chronalog/changelog directory")
} else {
  console.log("✓ /chronalog/changelog directory already exists")
}

if (!fs.existsSync(chronalogConfigPath)) {
  const chronalogConfigContent = {
    tags: []
  }
  fs.writeFileSync(chronalogConfigPath, JSON.stringify(chronalogConfigContent, null, 2), "utf-8")
  console.log("✓ Created /chronalog/config.json")
} else {
  console.log("✓ /chronalog/config.json already exists")
}

console.log("\n✨ Chronalog setup complete!")
console.log("\nNext steps:")
console.log("1. Set up GitHub OAuth:")
console.log("   - Create a GitHub OAuth App: https://github.com/settings/developers")
console.log("   - Set Authorization callback URL to: http://localhost:3000/api/changelog/auth/callback")
console.log("   - Add to your .env.local:")
console.log("     CHRONALOG_GITHUB_ID=your_client_id")
console.log("     CHRONALOG_GITHUB_SECRET=your_client_secret")
console.log("   - (Optional) Set CHRONALOG_TOKEN_SECRET for production deployments")
console.log("2. Configure repository settings (for serverless deployments):")
console.log("   - If deploying to Vercel/Cloudflare Pages without Git connection:")
console.log("     Add to your environment variables:")
console.log("     CHRONALOG_REPO_OWNER=your_github_username")
console.log("     CHRONALOG_REPO_SLUG=your_repo_name")
console.log("     CHRONALOG_REPO_BRANCH=main")
console.log("   - Note: If connected to Git, Vercel will auto-detect these values")
console.log("3. Start your dev server: pnpm dev")
console.log("4. Visit your dashboard at: http://localhost:3000/chronalog")
console.log("\nYou can now start creating changelog entries from your dashboard.")