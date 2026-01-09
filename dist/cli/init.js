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
// Using flat export path for Turbopack compatibility with linked packages
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
// Using flat export path for Turbopack compatibility with linked packages
export { default } from "chronalog/admin-settings"
`;
  fs.writeFileSync(settingsPagePath, settingsPageContent, "utf-8");
  console.log("\u2713 Created /app/(cms)/chronalog/settings/page.tsx");
} else {
  console.log("\u2713 /app/(cms)/chronalog/settings/page.tsx already exists");
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

  return NextResponse.json({
    configured: missing.length === 0,
    missing: missing.length > 0 ? missing : undefined
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
console.log("2. Start your dev server: pnpm dev");
console.log("3. Visit your dashboard at: http://localhost:3000/chronalog");
console.log("\nYou can now start creating changelog entries from your dashboard.");
