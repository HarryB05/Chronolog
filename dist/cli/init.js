#!/usr/bin/env node

// cli/init.ts
import fs from "fs";
import path from "path";
var cwd = process.cwd();
var appDir = path.join(cwd, "app");
var cmsRouteGroupDir = path.join(appDir, "(cms)");
var chronalogAdminDir = path.join(cmsRouteGroupDir, "chronalog");
var layoutPath = path.join(cmsRouteGroupDir, "layout.tsx");
var pagePath = path.join(chronalogAdminDir, "page.tsx");
var apiSaveDir = path.join(appDir, "api", "changelog", "save");
var apiSaveRoutePath = path.join(apiSaveDir, "route.ts");
var apiListDir = path.join(appDir, "api", "changelog", "list");
var apiListRoutePath = path.join(apiListDir, "route.ts");
var apiLatestDir = path.join(appDir, "api", "changelog", "latest");
var apiLatestRoutePath = path.join(apiLatestDir, "route.ts");
var configPath = path.join(cwd, "changelog.config.ts");
if (!fs.existsSync(appDir)) {
  console.error("Chronalog must be run inside a Next.js project (missing /app)");
  process.exit(1);
}
if (!fs.existsSync(cmsRouteGroupDir)) {
  fs.mkdirSync(cmsRouteGroupDir, { recursive: true });
  console.log("\u2713 Created /app/(cms)");
} else {
  console.log("\u2713 /app/(cms) already exists");
}
if (!fs.existsSync(layoutPath)) {
  const layoutContent = `import "../globals.css"

export default function CMSLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
`;
  fs.writeFileSync(layoutPath, layoutContent, "utf-8");
  console.log("\u2713 Created /app/(cms)/layout.tsx");
} else {
  console.log("\u2713 /app/(cms)/layout.tsx already exists");
}
if (!fs.existsSync(chronalogAdminDir)) {
  fs.mkdirSync(chronalogAdminDir, { recursive: true });
  console.log("\u2713 Created /app/(cms)/chronalog");
} else {
  console.log("\u2713 /app/(cms)/chronalog already exists");
}
if (!fs.existsSync(pagePath)) {
  const pageContent = `"use client"

import "chronalog/chronalog.css"
export { default } from "chronalog/admin-page"
`;
  fs.writeFileSync(pagePath, pageContent, "utf-8");
  console.log("\u2713 Created /app/(cms)/chronalog/page.tsx");
} else {
  console.log("\u2713 /app/(cms)/chronalog/page.tsx already exists");
}
if (!fs.existsSync(apiSaveRoutePath)) {
  if (!fs.existsSync(apiSaveDir)) {
    fs.mkdirSync(apiSaveDir, { recursive: true });
    console.log("\u2713 Created /app/api/changelog/save");
  }
  const apiRouteContent = `import { NextResponse } from "next/server";
import { saveChangelogEntry, getLoginSession, getGitRemoteUrl, getGitBranch } from "chronalog";
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

    const remoteUrl = getGitRemoteUrl();
    const branch = getGitBranch() || 'main';

    // Save the changelog entry (uses GitHub API in serverless, filesystem in dev)
    const result = await saveChangelogEntry(body, undefined, undefined, {
      accessToken: session.access_token,
      remoteUrl,
      branch,
    });

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
      path: result.filePath || 'saved',
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
`;
  fs.writeFileSync(apiSaveRoutePath, apiRouteContent, "utf-8");
  console.log("\u2713 Created /app/api/changelog/save/route.ts");
} else {
  console.log("\u2713 /app/api/changelog/save/route.ts already exists");
}
if (!fs.existsSync(apiListRoutePath)) {
  if (!fs.existsSync(apiListDir)) {
    fs.mkdirSync(apiListDir, { recursive: true });
    console.log("\u2713 Created /app/api/changelog/list");
  }
  const apiListRouteContent = `import { NextResponse } from "next/server";
import { listChangelogEntries, getLoginSession, getGitRemoteUrl, getGitBranch } from "chronalog";

export async function GET() {
  try {
    // Get session for access token (optional for public repos)
    // This route is public - no auth required for reading changelog entries
    const session = await getLoginSession();
    const remoteUrl = getGitRemoteUrl();
    const branch = getGitBranch() || 'main';

    // Token priority: 1. User session token, 2. CHRONALOG_GITHUB_TOKEN env var, 3. No token (public repos)
    const accessToken = session?.access_token || process.env.CHRONALOG_GITHUB_TOKEN || undefined;

    // List changelog entries (uses GitHub API in serverless, filesystem in dev)
    // For public repos, we can try without access token
    const entries = await listChangelogEntries(undefined, {
      accessToken,
      remoteUrl,
      branch,
    });

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
`;
  fs.writeFileSync(apiListRoutePath, apiListRouteContent, "utf-8");
  console.log("\u2713 Created /app/api/changelog/list/route.ts");
} else {
  console.log("\u2713 /app/api/changelog/list/route.ts already exists");
}
if (!fs.existsSync(apiLatestRoutePath)) {
  if (!fs.existsSync(apiLatestDir)) {
    fs.mkdirSync(apiLatestDir, { recursive: true });
    console.log("\u2713 Created /app/api/changelog/latest");
  }
  const apiLatestRouteContent = `import { NextResponse } from "next/server";
import { listChangelogEntries, getLoginSession, getGitRemoteUrl, getGitBranch } from "chronalog";

export async function GET() {
  try {
    // Get session for access token (optional for public repos)
    const session = await getLoginSession();
    const remoteUrl = getGitRemoteUrl();
    const branch = getGitBranch() || 'main';

    // Token priority: 1. User session token, 2. CHRONALOG_GITHUB_TOKEN env var, 3. No token (public repos)
    const accessToken = session?.access_token || process.env.CHRONALOG_GITHUB_TOKEN || undefined;

    const entries = await listChangelogEntries(undefined, {
      accessToken,
      remoteUrl,
      branch,
    });

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
`;
  fs.writeFileSync(apiLatestRoutePath, apiLatestRouteContent, "utf-8");
  console.log("\u2713 Created /app/api/changelog/latest/route.ts");
} else {
  console.log("\u2713 /app/api/changelog/latest/route.ts already exists");
}
var apiSettingsDir = path.join(appDir, "api", "changelog", "settings");
var apiSettingsRoutePath = path.join(apiSettingsDir, "route.ts");
if (!fs.existsSync(apiSettingsRoutePath)) {
  if (!fs.existsSync(apiSettingsDir)) {
    fs.mkdirSync(apiSettingsDir, { recursive: true });
    console.log("\u2713 Created /app/api/changelog/settings");
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
`;
  fs.writeFileSync(apiSettingsRoutePath, apiSettingsRouteContent, "utf-8");
  console.log("\u2713 Created /app/api/changelog/settings/route.ts");
} else {
  console.log("\u2713 /app/api/changelog/settings/route.ts already exists");
}
var settingsPageDir = path.join(chronalogAdminDir, "settings");
var settingsPagePath = path.join(settingsPageDir, "page.tsx");
if (!fs.existsSync(settingsPagePath)) {
  if (!fs.existsSync(settingsPageDir)) {
    fs.mkdirSync(settingsPageDir, { recursive: true });
    console.log("\u2713 Created /app/(cms)/chronalog/settings");
  }
  const settingsPageContent = `"use client"

import "chronalog/chronalog.css"
export { default } from "chronalog/admin-settings"
`;
  fs.writeFileSync(settingsPagePath, settingsPageContent, "utf-8");
  console.log("\u2713 Created /app/(cms)/chronalog/settings/page.tsx");
} else {
  console.log("\u2713 /app/(cms)/chronalog/settings/page.tsx already exists");
}
var mediaPageDir = path.join(chronalogAdminDir, "media");
var mediaPagePath = path.join(mediaPageDir, "page.tsx");
if (!fs.existsSync(mediaPagePath)) {
  if (!fs.existsSync(mediaPageDir)) {
    fs.mkdirSync(mediaPageDir, { recursive: true });
    console.log("\u2713 Created /app/(cms)/chronalog/media");
  }
  const mediaPageContent = `"use client"

import "chronalog/chronalog.css"
export { default } from "chronalog/admin-media"
`;
  fs.writeFileSync(mediaPagePath, mediaPageContent, "utf-8");
  console.log("\u2713 Created /app/(cms)/chronalog/media/page.tsx");
} else {
  console.log("\u2713 /app/(cms)/chronalog/media/page.tsx already exists");
}
var apiAuthDir = path.join(appDir, "api", "changelog", "auth");
var apiAuthLoginDir = path.join(apiAuthDir, "login");
var apiAuthLoginRoutePath = path.join(apiAuthLoginDir, "route.ts");
var apiAuthCallbackDir = path.join(apiAuthDir, "callback");
var apiAuthCallbackRoutePath = path.join(apiAuthCallbackDir, "route.ts");
var apiAuthUserDir = path.join(apiAuthDir, "user");
var apiAuthUserRoutePath = path.join(apiAuthUserDir, "route.ts");
var apiAuthSignoutDir = path.join(apiAuthDir, "signout");
var apiAuthSignoutRoutePath = path.join(apiAuthSignoutDir, "route.ts");
if (!fs.existsSync(apiAuthLoginRoutePath)) {
  if (!fs.existsSync(apiAuthLoginDir)) {
    fs.mkdirSync(apiAuthLoginDir, { recursive: true });
    console.log("\u2713 Created /app/api/changelog/auth/login");
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
`;
  fs.writeFileSync(apiAuthLoginRoutePath, apiAuthLoginContent, "utf-8");
  console.log("\u2713 Created /app/api/changelog/auth/login/route.ts");
} else {
  console.log("\u2713 /app/api/changelog/auth/login/route.ts already exists");
}
var apiAuthCheckEnvDir = path.join(apiAuthDir, "check-env");
var apiAuthCheckEnvRoutePath = path.join(apiAuthCheckEnvDir, "route.ts");
if (!fs.existsSync(apiAuthCheckEnvRoutePath)) {
  if (!fs.existsSync(apiAuthCheckEnvDir)) {
    fs.mkdirSync(apiAuthCheckEnvDir, { recursive: true });
    console.log("\u2713 Created /app/api/changelog/auth/check-env");
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
`;
  fs.writeFileSync(apiAuthCheckEnvRoutePath, apiAuthCheckEnvContent, "utf-8");
  console.log("\u2713 Created /app/api/changelog/auth/check-env/route.ts");
} else {
  console.log("\u2713 /app/api/changelog/auth/check-env/route.ts already exists");
}
if (!fs.existsSync(apiAuthCallbackRoutePath)) {
  if (!fs.existsSync(apiAuthCallbackDir)) {
    fs.mkdirSync(apiAuthCallbackDir, { recursive: true });
    console.log("\u2713 Created /app/api/changelog/auth/callback");
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
`;
  fs.writeFileSync(apiAuthCallbackRoutePath, apiAuthCallbackContent, "utf-8");
  console.log("\u2713 Created /app/api/changelog/auth/callback/route.ts");
} else {
  console.log("\u2713 /app/api/changelog/auth/callback/route.ts already exists");
}
if (!fs.existsSync(apiAuthUserRoutePath)) {
  if (!fs.existsSync(apiAuthUserDir)) {
    fs.mkdirSync(apiAuthUserDir, { recursive: true });
    console.log("\u2713 Created /app/api/changelog/auth/user");
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
`;
  fs.writeFileSync(apiAuthUserRoutePath, apiAuthUserContent, "utf-8");
  console.log("\u2713 Created /app/api/changelog/auth/user/route.ts");
} else {
  console.log("\u2713 /app/api/changelog/auth/user/route.ts already exists");
}
if (!fs.existsSync(apiAuthSignoutRoutePath)) {
  if (!fs.existsSync(apiAuthSignoutDir)) {
    fs.mkdirSync(apiAuthSignoutDir, { recursive: true });
    console.log("\u2713 Created /app/api/changelog/auth/signout");
  }
  const apiAuthSignoutContent = `import { NextRequest, NextResponse } from "next/server"
import { clearLoginSession } from "chronalog"

export async function GET(req: NextRequest) {
  await clearLoginSession()

  const homeUrl = new URL('/', req.url)
  return NextResponse.redirect(homeUrl)
}
`;
  fs.writeFileSync(apiAuthSignoutRoutePath, apiAuthSignoutContent, "utf-8");
  console.log("\u2713 Created /app/api/changelog/auth/signout/route.ts");
} else {
  console.log("\u2713 /app/api/changelog/auth/signout/route.ts already exists");
}
var apiTagsDir = path.join(appDir, "api", "changelog", "tags");
var apiTagsRoutePath = path.join(apiTagsDir, "route.ts");
if (!fs.existsSync(apiTagsRoutePath)) {
  if (!fs.existsSync(apiTagsDir)) {
    fs.mkdirSync(apiTagsDir, { recursive: true });
    console.log("\u2713 Created /app/api/changelog/tags");
  }
  const apiTagsContent = `import { NextResponse } from "next/server"
import { readPredefinedTags, savePredefinedTags, readPredefinedTagsViaGitHub, savePredefinedTagsViaGitHub, getLoginSession, getGitRemoteUrl, getGitBranch } from "chronalog"

export async function GET() {
  const session = await getLoginSession()
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const remoteUrl = getGitRemoteUrl();
    const branch = getGitBranch() || 'main';
    
    // Token priority: 1. User session token, 2. CHRONALOG_GITHUB_TOKEN env var
    const accessToken = session.access_token || process.env.CHRONALOG_GITHUB_TOKEN;
    
    // Use GitHub API in serverless environments, otherwise use local filesystem
    const isServerless = process.env.VERCEL === '1' || process.env.CF_PAGES === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME;
    let tags;
    
    if (isServerless && accessToken && remoteUrl) {
      tags = await readPredefinedTagsViaGitHub(accessToken, remoteUrl, 'chronalog', branch);
    } else {
      tags = readPredefinedTags();
    }
    
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

    const remoteUrl = getGitRemoteUrl();
    const branch = getGitBranch() || 'main';
    
    // Token priority: 1. User session token, 2. CHRONALOG_GITHUB_TOKEN env var
    const accessToken = session.access_token || process.env.CHRONALOG_GITHUB_TOKEN;
    
    // Use GitHub API in serverless environments, otherwise use local filesystem
    const isServerless = process.env.VERCEL === '1' || process.env.CF_PAGES === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME;
    let result;
    
    if (isServerless && accessToken && remoteUrl) {
      result = await savePredefinedTagsViaGitHub(tags, accessToken, remoteUrl, 'chronalog', branch);
    } else {
      result = savePredefinedTags(tags);
    }

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
`;
  fs.writeFileSync(apiTagsRoutePath, apiTagsContent, "utf-8");
  console.log("\u2713 Created /app/api/changelog/tags/route.ts");
} else {
  console.log("\u2713 /app/api/changelog/tags/route.ts already exists");
}
var apiCommitsDir = path.join(appDir, "api", "changelog", "commits");
var apiCommitsRoutePath = path.join(apiCommitsDir, "route.ts");
if (!fs.existsSync(apiCommitsRoutePath)) {
  if (!fs.existsSync(apiCommitsDir)) {
    fs.mkdirSync(apiCommitsDir, { recursive: true });
    console.log("\u2713 Created /app/api/changelog/commits");
  }
  const apiCommitsContent = `import { NextResponse } from "next/server"
import { getGitCommitHistory, getGitCommitHistoryViaGitHub, getLoginSession, getGitRemoteUrl, getGitBranch } from "chronalog"

export async function GET() {
  const session = await getLoginSession()
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const remoteUrl = getGitRemoteUrl();
    const branch = getGitBranch() || 'main';
    
    // Token priority: 1. User session token, 2. CHRONALOG_GITHUB_TOKEN env var
    const accessToken = session.access_token || process.env.CHRONALOG_GITHUB_TOKEN;
    
    // Use GitHub API in serverless environments, otherwise use local Git
    const isServerless = process.env.VERCEL === '1' || process.env.CF_PAGES === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME;
    let commits;
    
    if (isServerless && accessToken && remoteUrl) {
      commits = await getGitCommitHistoryViaGitHub(accessToken, remoteUrl, 50, branch);
    } else {
      commits = await getGitCommitHistory(50);
    }
    
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
`;
  fs.writeFileSync(apiCommitsRoutePath, apiCommitsContent, "utf-8");
  console.log("\u2713 Created /app/api/changelog/commits/route.ts");
} else {
  console.log("\u2713 /app/api/changelog/commits/route.ts already exists");
}
var apiHomeUrlDir = path.join(appDir, "api", "changelog", "home-url");
var apiHomeUrlRoutePath = path.join(apiHomeUrlDir, "route.ts");
if (!fs.existsSync(apiHomeUrlRoutePath)) {
  if (!fs.existsSync(apiHomeUrlDir)) {
    fs.mkdirSync(apiHomeUrlDir, { recursive: true });
    console.log("\u2713 Created /app/api/changelog/home-url");
  }
  const apiHomeUrlContent = `import { NextResponse } from "next/server"
import { loadChronalogConfig, saveHomeUrl, saveHomeUrlViaGitHub, readHomeUrlViaGitHub, getLoginSession, getGitRemoteUrl, getGitBranch } from "chronalog"

export async function GET() {
  const session = await getLoginSession()
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const remoteUrl = getGitRemoteUrl();
    const branch = getGitBranch() || 'main';
    
    // Token priority: 1. User session token, 2. CHRONALOG_GITHUB_TOKEN env var
    const accessToken = session.access_token || process.env.CHRONALOG_GITHUB_TOKEN;
    
    // Use GitHub API in serverless environments, otherwise use local filesystem
    const isServerless = process.env.VERCEL === '1' || process.env.CF_PAGES === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME;
    let homeUrl = "/";
    
    if (isServerless && accessToken && remoteUrl) {
      homeUrl = await readHomeUrlViaGitHub(accessToken, remoteUrl, 'chronalog', branch) || "/";
    } else {
      const config = loadChronalogConfig();
      homeUrl = config.homeUrl || "/";
    }
    
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

    const remoteUrl = getGitRemoteUrl();
    const branch = getGitBranch() || 'main';
    
    // Token priority: 1. User session token, 2. CHRONALOG_GITHUB_TOKEN env var
    const accessToken = session.access_token || process.env.CHRONALOG_GITHUB_TOKEN;
    
    // Use GitHub API in serverless environments, otherwise use local filesystem
    const isServerless = process.env.VERCEL === '1' || process.env.CF_PAGES === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME;
    let result;
    
    if (isServerless && accessToken && remoteUrl) {
      result = await saveHomeUrlViaGitHub(homeUrl, accessToken, remoteUrl, 'chronalog', branch);
    } else {
      result = saveHomeUrl(homeUrl);
    }

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
`;
  fs.writeFileSync(apiHomeUrlRoutePath, apiHomeUrlContent, "utf-8");
  console.log("\u2713 Created /app/api/changelog/home-url/route.ts");
} else {
  console.log("\u2713 /app/api/changelog/home-url/route.ts already exists");
}
var apiMediaDir = path.join(appDir, "api", "changelog", "media");
var apiMediaListDir = path.join(apiMediaDir, "list");
var apiMediaListRoutePath = path.join(apiMediaListDir, "route.ts");
var apiMediaUploadDir = path.join(apiMediaDir, "upload");
var apiMediaUploadRoutePath = path.join(apiMediaUploadDir, "route.ts");
var apiMediaDeleteDir = path.join(apiMediaDir, "delete");
var apiMediaDeleteRoutePath = path.join(apiMediaDeleteDir, "route.ts");
if (!fs.existsSync(apiMediaListRoutePath)) {
  if (!fs.existsSync(apiMediaListDir)) {
    fs.mkdirSync(apiMediaListDir, { recursive: true });
  }
  const apiMediaListContent = `import { NextResponse } from "next/server"
import { listMediaFiles, getLoginSession, getGitRemoteUrl, parseGitHubRepoFromUrl, getGitBranch } from "chronalog"

export async function GET() {
  const session = await getLoginSession()
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    // Note: Media files are currently only supported via local filesystem
    // GitHub API support for media files may be added in the future
    const files = listMediaFiles();
    
    const formattedFiles = files.map((file) => ({
      filename: file.filename,
      url: file.url,
      size: file.size,
      modified: file.modified ? file.modified.toISOString() : new Date().toISOString(),
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
`;
  fs.writeFileSync(apiMediaListRoutePath, apiMediaListContent, "utf-8");
  console.log("\u2713 Created /app/api/changelog/media/list/route.ts");
} else {
  console.log("\u2713 /app/api/changelog/media/list/route.ts already exists");
}
if (!fs.existsSync(apiMediaUploadRoutePath)) {
  if (!fs.existsSync(apiMediaUploadDir)) {
    fs.mkdirSync(apiMediaUploadDir, { recursive: true });
  }
  const apiMediaUploadContent = `import { NextResponse } from "next/server"
import { saveMediaFile, getLoginSession, getGitRemoteUrl, parseGitHubRepoFromUrl, getGitBranch } from "chronalog"

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

    const remoteUrl = getGitRemoteUrl();
    const repoInfo = parseGitHubRepoFromUrl(remoteUrl);
    if (!repoInfo) {
      return NextResponse.json(
        { error: "Invalid Git remote URL" },
        { status: 400 }
      );
    }
    const branch = getGitBranch() || 'main';

    const uploadedFiles: Array<{ filename: string; url: string }> = []

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        continue
      }

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Note: Media files are currently only supported via local filesystem
      // GitHub API support for media files may be added in the future
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
`;
  fs.writeFileSync(apiMediaUploadRoutePath, apiMediaUploadContent, "utf-8");
  console.log("\u2713 Created /app/api/changelog/media/upload/route.ts");
} else {
  console.log("\u2713 /app/api/changelog/media/upload/route.ts already exists");
}
if (!fs.existsSync(apiMediaDeleteRoutePath)) {
  if (!fs.existsSync(apiMediaDeleteDir)) {
    fs.mkdirSync(apiMediaDeleteDir, { recursive: true });
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
`;
  fs.writeFileSync(apiMediaDeleteRoutePath, apiMediaDeleteContent, "utf-8");
  console.log("\u2713 Created /app/api/changelog/media/delete/route.ts");
} else {
  console.log("\u2713 /app/api/changelog/media/delete/route.ts already exists");
}
var changelogPageDir = path.join(appDir, "changelog");
var changelogPagePath = path.join(changelogPageDir, "page.tsx");
var changelogTimelinePath = path.join(changelogPageDir, "ChangelogTimeline.tsx");
if (!fs.existsSync(changelogPagePath)) {
  if (!fs.existsSync(changelogPageDir)) {
    fs.mkdirSync(changelogPageDir, { recursive: true });
    console.log("\u2713 Created /app/changelog");
  }
  const changelogPageContent = `import type { Metadata } from "next";
import { GET as getChangelogList } from "../api/changelog/list/route";
import { ChangelogTimeline } from "./ChangelogTimeline";

// Force dynamic rendering since we fetch data at request time
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Changelog",
  description: "View all updates, features, and improvements. Stay up to date with the latest changes and releases.",
  openGraph: {
    title: "Changelog",
    description: "View all updates, features, and improvements. Stay up to date with the latest changes and releases.",
    url: "/changelog",
  },
  alternates: {
    canonical: "/changelog",
  },
};

interface ChangelogEntry {
  slug: string;
  title: string;
  date: string;
  version?: string;
  tags?: string[];
  features?: string[];
  bugfixes?: string[];
  body?: string;
}

async function fetchChangelogEntries(): Promise<ChangelogEntry[]> {
  try {
    // Directly call the route handler function instead of making an HTTP request
    // This avoids Vercel deployment protection and is more efficient
    const response = await getChangelogList();
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.details || \`Failed to fetch changelog entries: \${response.statusText}\`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'API returned unsuccessful response');
    }
    
    if (!Array.isArray(data.entries)) {
      console.error('Invalid entries data:', data);
      throw new Error('Invalid response from API: entries is not an array');
    }
    
    // Sort entries by date, newest first
    return data.entries.sort((a: ChangelogEntry, b: ChangelogEntry) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    console.error('Error fetching changelog entries:', error);
    throw error;
  }
}

export default async function ChangelogPage() {
  let entries: ChangelogEntry[] = [];
  let error: string | null = null;

  try {
    entries = await fetchChangelogEntries();
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load changelog entries";
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Changelog",
    description: "View all updates, features, and improvements",
    url: "/changelog",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="flex min-h-screen flex-col bg-white dark:bg-black">
        <main className="mx-auto w-full max-w-4xl px-6 py-12">
          <div className="mb-12">
            <h1 className="mb-4 text-4xl font-bold text-black dark:text-zinc-50 sm:text-5xl">
              Changelog
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Stay up to date with the latest updates, features, and improvements.
            </p>
          </div>

          {error && (
            <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {!error && <ChangelogTimeline entries={entries} />}
        </main>
      </div>
    </>
  );
}
`;
  fs.writeFileSync(changelogPagePath, changelogPageContent, "utf-8");
  console.log("\u2713 Created /app/changelog/page.tsx");
} else {
  console.log("\u2713 /app/changelog/page.tsx already exists");
}
if (!fs.existsSync(changelogTimelinePath)) {
  const changelogTimelineContent = `"use client";

import { useState, useMemo } from "react";
import { FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChangelogEntry {
  slug: string;
  title: string;
  date: string;
  version?: string;
  tags?: string[];
  features?: string[];
  bugfixes?: string[];
  body?: string;
}

interface ChangelogTimelineProps {
  entries: ChangelogEntry[];
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

export function ChangelogTimeline({ entries }: ChangelogTimelineProps) {
  const [selectedMajorVersion, setSelectedMajorVersion] = useState<string | null>(null);
  const [selectedMinorVersion, setSelectedMinorVersion] = useState<string | null>(null);

  // Get unique major versions (e.g., "1.0.0", "2.0.0")
  const uniqueVersions = useMemo(() => {
    const allVersions = entries
      .map((entry) => entry.version)
      .filter((v): v is string => !!v);

    // Extract unique major versions (e.g., "1", "2", "3")
    const majorVersions = new Set<string>();
    allVersions.forEach((version: string) => {
      const major = version.split(".")[0];
      majorVersions.add(major);
    });

    // Convert to major.0.0 format and sort
    const versions = Array.from(majorVersions)
      .map((major) => \`\${major}.0.0\`)
      .sort((a: string, b: string) => {
        // Sort versions semantically
        const aParts = a.split(".").map(Number);
        const bParts = b.split(".").map(Number);
        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
          const aPart = aParts[i] || 0;
          const bPart = bParts[i] || 0;
          if (aPart !== bPart) return bPart - aPart;
        }
        return 0;
      });
    return versions;
  }, [entries]);

  // Get minor versions for selected major version (only x.y.0, not patch versions)
  const minorVersions = useMemo(() => {
    if (!selectedMajorVersion) return [];

    const majorVersion = selectedMajorVersion.split(".")[0];
    const allVersions = entries
      .map((entry) => entry.version)
      .filter((v): v is string => !!v)
      .filter((v: string) => {
        const entryMajor = v.split(".")[0];
        return entryMajor === majorVersion;
      })
      // Only include minor versions (x.y.0 format, patch must be 0)
      .filter((v: string) => {
        const parts = v.split(".").map(Number);
        return parts.length >= 3 && parts[2] === 0;
      })
      .filter((v: string, index: number, self: string[]) => self.indexOf(v) === index)
      .sort((a: string, b: string) => {
        // Sort versions semantically
        const aParts = a.split(".").map(Number);
        const bParts = b.split(".").map(Number);
        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
          const aPart = aParts[i] || 0;
          const bPart = bParts[i] || 0;
          if (aPart !== bPart) return bPart - aPart;
        }
        return 0;
      });
    return allVersions;
  }, [entries, selectedMajorVersion]);

  // Filter entries based on selected version
  const filteredEntries = useMemo(() => {
    if (!selectedMajorVersion) return entries;

    const majorVersion = selectedMajorVersion.split(".")[0];

    let filtered = entries.filter((entry: ChangelogEntry) => {
      if (!entry.version) return false;
      const entryMajor = entry.version.split(".")[0];
      return entryMajor === majorVersion;
    });

    // If minor version is selected, filter to show all patch versions within that minor version
    if (selectedMinorVersion) {
      const minorVersionParts = selectedMinorVersion.split(".");
      if (minorVersionParts.length >= 2) {
        const majorMinorPrefix = \`\${minorVersionParts[0]}.\${minorVersionParts[1]}.\`;
        filtered = filtered.filter((entry: ChangelogEntry) => {
          return entry.version?.startsWith(majorMinorPrefix);
        });
      }
    }

    return filtered;
  }, [entries, selectedMajorVersion, selectedMinorVersion]);

  if (entries.length === 0) {
    return (
      <div className="mb-12 rounded-lg border border-zinc-200 bg-zinc-50 p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <FileText className="mx-auto mb-4 h-12 w-12 text-zinc-400 dark:text-zinc-600" />
        <h2 className="mb-2 text-xl font-semibold text-black dark:text-zinc-50">
          No changelog entries yet
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Changelog entries will appear here once they're created.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Version Filter */}
      {uniqueVersions.length > 0 && (
        <div className="mb-8 space-y-4">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Filter by Major Version
            </h3>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              <button
                onClick={() => {
                  setSelectedMajorVersion(null);
                  setSelectedMinorVersion(null);
                }}
                className={\`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors \${
                  selectedMajorVersion === null
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300"
                    : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }\`}
              >
                All Versions
              </button>
              {uniqueVersions.map((version: string) => {
                return (
                  <button
                    key={version}
                    onClick={() => {
                      setSelectedMajorVersion(version);
                      setSelectedMinorVersion(null);
                    }}
                    className={\`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors \${
                      selectedMajorVersion === version
                        ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    }\`}
                  >
                    v{version}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Minor Version Selector - only show when major version is selected */}
          {selectedMajorVersion && minorVersions.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Filter by Minor Version
              </h3>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                <button
                  onClick={() => setSelectedMinorVersion(null)}
                  className={\`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors \${
                    selectedMinorVersion === null
                      ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300"
                      : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  }\`}
                >
                  All {selectedMajorVersion.split(".")[0]}.x.x
                </button>
                {minorVersions.map((version: string) => {
                  return (
                    <button
                      key={version}
                      onClick={() => setSelectedMinorVersion(version)}
                      className={\`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors \${
                        selectedMinorVersion === version
                          ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300"
                          : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      }\`}
                    >
                      v{version}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Timeline */}
      {filteredEntries.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No entries found for the selected filter.
          </p>
        </div>
      ) : (
        <div className="space-y-0">
          {filteredEntries.map((entry, index) => {
            const isLatest = entries.length > 0 && entry.slug === entries[0].slug;
            return (
              <div key={entry.slug} className="relative">
                {/* Timeline line */}
                {index < filteredEntries.length - 1 && (
                  <div className="absolute left-[15px] top-8 h-full w-0.5 bg-zinc-200 dark:bg-zinc-800" />
                )}

                <div className="relative flex gap-4">
                  {/* Date circle */}
                  <div className={\`relative z-0 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 \${isLatest ? "border-blue-500 bg-blue-100 dark:border-blue-400 dark:bg-blue-900/30" : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"}\`}>
                    <div className={\`h-2 w-2 rounded-full \${isLatest ? "bg-blue-600 dark:bg-blue-400" : "bg-zinc-400 dark:bg-zinc-600"}\`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-2 pb-8">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        {formatDate(entry.date)}
                      </span>
                      {entry.version && (
                        <span className={\`rounded-full px-2 py-0.5 text-xs font-semibold \${isLatest ? "bg-blue-200 text-blue-900 dark:bg-blue-900/50 dark:text-blue-200" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"}\`}>
                          {entry.version}
                        </span>
                      )}
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <h3 className={\`flex-1 text-lg font-semibold \${isLatest ? "text-blue-900 dark:text-blue-100" : "text-zinc-900 dark:text-zinc-50"}\`}>
                        {entry.title}
                      </h3>
                    </div>

                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {entry.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {entry.features && entry.features.length > 0 && (
                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                          Features
                        </h4>
                        <ul className="space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                          {entry.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center gap-2">
                              <span className="text-2xl leading-none text-green-600 dark:text-green-400">\u2022</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {entry.bugfixes && entry.bugfixes.length > 0 && (
                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                          Bug Fixes
                        </h4>
                        <ul className="space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                          {entry.bugfixes.map((bugfix, bugfixIndex) => (
                            <li key={bugfixIndex} className="flex items-center gap-2">
                              <span className="text-2xl leading-none text-red-600 dark:text-red-400">\u2022</span>
                              <span>{bugfix}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {entry.body && (
                      <div className="mt-4 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                        <ReactMarkdown
                          components={{
                            p: ({ children }: { children?: React.ReactNode }) => <p className="mb-2">{children}</p>,
                            h1: ({ children }: { children?: React.ReactNode }) => <h1 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{children}</h1>,
                            h2: ({ children }: { children?: React.ReactNode }) => <h2 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">{children}</h2>,
                            h3: ({ children }: { children?: React.ReactNode }) => <h3 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50">{children}</h3>,
                            ul: ({ children }: { children?: React.ReactNode }) => <ul className="ml-4 list-disc space-y-1">{children}</ul>,
                            ol: ({ children }: { children?: React.ReactNode }) => <ol className="ml-4 list-decimal space-y-1">{children}</ol>,
                            li: ({ children }: { children?: React.ReactNode }) => <li>{children}</li>,
                            strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-semibold text-zinc-900 dark:text-zinc-50">{children}</strong>,
                            em: ({ children }: { children?: React.ReactNode }) => <em className="italic">{children}</em>,
                            code: ({ children }: { children?: React.ReactNode }) => <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs dark:bg-zinc-800">{children}</code>,
                            pre: ({ children }: { children?: React.ReactNode }) => <pre className="overflow-x-auto rounded-lg bg-zinc-100 p-3 text-xs dark:bg-zinc-800">{children}</pre>,
                            a: ({ href, children }: { href?: string; children?: React.ReactNode }) => <a href={href} className="text-blue-600 underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">{children}</a>,
                            blockquote: ({ children }: { children?: React.ReactNode }) => <blockquote className="border-l-2 border-zinc-300 pl-3 italic dark:border-zinc-700">{children}</blockquote>,
                            img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
                              // Normalise image paths
                              const { src, alt, ...rest } = props;
                              let imageSrc = typeof src === "string" ? src : "";
                              if (imageSrc.startsWith("chronalog/")) {
                                imageSrc = \`/\${imageSrc}\`;
                              } else if (!imageSrc.startsWith("/") && !imageSrc.startsWith("http")) {
                                imageSrc = \`/\${imageSrc}\`;
                              }
                              return (
                                <img
                                  {...rest}
                                  src={imageSrc}
                                  alt={alt || ""}
                                  className="my-4 max-w-full rounded-lg border border-zinc-200 dark:border-zinc-800"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = "none";
                                  }}
                                />
                              );
                            },
                          }}
                        >
                          {entry.body}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
`;
  fs.writeFileSync(changelogTimelinePath, changelogTimelineContent, "utf-8");
  console.log("\u2713 Created /app/changelog/ChangelogTimeline.tsx");
} else {
  console.log("\u2713 /app/changelog/ChangelogTimeline.tsx already exists");
}
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
`;
  fs.writeFileSync(configPath, configContent, "utf-8");
  console.log("\u2713 Created changelog.config.ts");
} else {
  console.log("\u2713 changelog.config.ts already exists");
}
var chronalogDir = path.join(cwd, "chronalog");
var chronalogChangelogDir = path.join(chronalogDir, "changelog");
var chronalogConfigPath = path.join(chronalogDir, "config.json");
if (!fs.existsSync(chronalogDir)) {
  fs.mkdirSync(chronalogDir, { recursive: true });
  console.log("\u2713 Created /chronalog directory");
} else {
  console.log("\u2713 /chronalog directory already exists");
}
if (!fs.existsSync(chronalogChangelogDir)) {
  fs.mkdirSync(chronalogChangelogDir, { recursive: true });
  console.log("\u2713 Created /chronalog/changelog directory");
} else {
  console.log("\u2713 /chronalog/changelog directory already exists");
}
if (!fs.existsSync(chronalogConfigPath)) {
  const chronalogConfigContent = {
    tags: []
  };
  fs.writeFileSync(chronalogConfigPath, JSON.stringify(chronalogConfigContent, null, 2), "utf-8");
  console.log("\u2713 Created /chronalog/config.json");
} else {
  console.log("\u2713 /chronalog/config.json already exists");
}
console.log("\n\u2728 Chronalog setup complete!");
console.log("\nNext steps:");
console.log("1. Set up GitHub OAuth:");
console.log("   - Create a GitHub OAuth App: https://github.com/settings/developers");
console.log("   - Set Authorization callback URL to: http://localhost:3000/api/changelog/auth/callback");
console.log("   - Add to your .env.local:");
console.log("     CHRONALOG_GITHUB_ID=your_client_id");
console.log("     CHRONALOG_GITHUB_SECRET=your_client_secret");
console.log("   - (Optional) Set CHRONALOG_TOKEN_SECRET for production deployments");
console.log("2. Configure repository settings (for serverless deployments):");
console.log("   - If deploying to Vercel/Cloudflare Pages without Git connection:");
console.log("     Add to your environment variables:");
console.log("     CHRONALOG_REPO_OWNER=your_github_username");
console.log("     CHRONALOG_REPO_SLUG=your_repo_name");
console.log("     CHRONALOG_REPO_BRANCH=main");
console.log("   - Note: If connected to Git, Vercel will auto-detect these values");
console.log("3. Start your dev server: pnpm dev");
console.log("4. Visit your dashboard at: http://localhost:3000/chronalog");
console.log("\nYou can now start creating changelog entries from your dashboard.");
