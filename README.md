# Chronalog

A Git-backed changelog system for Next.js. Manage your changelog entries with a beautiful admin interface. Git-backed, no database, own your data.

Visit [www.chronalog.dev](https://www.chronalog.dev) for more information.

## Features

- **Git-backed**: All changes are automatically committed to your Git repository. Full version control for your changelog.
- **MDX Support**: Write changelog entries in MDX format. Rich content with markdown support and custom components.
- **Customisable**: Configure folder paths, route paths, and commit message formats to match your workflow.
- **Quick Setup**: Get started in minutes. No database setup, no complex configuration. Just install and go.
- **No Database**: Everything is file-based. Your changelog entries are stored as MDX files in your repository.
- **TypeScript**: Fully typed with TypeScript. Get autocomplete and type safety throughout your changelog system.

## Requirements

- Next.js 14.0.0 or higher
- React 18.0.0 or higher
- Tailwind CSS 4.0.0 or higher
- Git (for auto-commit functionality)

## Installation

Install Chronalog in your Next.js project using pnpm:

```bash
pnpm add chronalog
```

## Getting Started

### Initialisation

Run the init command to scaffold the necessary files and directories:

```bash
pnpm chronalog init
```

This will create:

- Admin page at `/app/(cms)/chronalog/page.tsx`
- Settings page at `/app/(cms)/chronalog/settings/page.tsx`
- API routes for saving, listing, and fetching changelog entries
- GitHub OAuth authentication routes
- Configuration file at `changelog.config.ts`
- Changelog directory at `chronalog/changelog`

### GitHub OAuth Setup

Chronalog uses GitHub OAuth for authentication. Set up your GitHub OAuth app:

1. Create a GitHub OAuth App at [https://github.com/settings/developers](https://github.com/settings/developers)
2. Set the Authorization callback URL to: `http://localhost:3000/api/changelog/auth/callback`
3. Add the following to your `.env.local` file:

```env
CHRONALOG_GITHUB_ID=your_client_id
CHRONALOG_GITHUB_SECRET=your_client_secret
CHRONALOG_TOKEN_SECRET=your_secret_key
```

Note: `CHRONALOG_TOKEN_SECRET` is optional for local development but recommended for production.

## Deployment

### Deploying to Vercel

When deploying to Vercel or other serverless platforms, Chronalog uses the GitHub API to fetch changelog entries since the filesystem is read-only. To ensure your public changelog page works correctly, you need to set up a GitHub access token.

### Creating a GitHub Personal Access Token

Create a GitHub personal access token for your deployment:

1. Go to [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a descriptive name (e.g., "Chronalog Vercel Deployment")
4. Select the appropriate scopes:
   - `repo` - Full control of private repositories (if your repo is private)
   - `public_repo` - Access public repositories (if your repo is public)
5. Click "Generate token" and copy it immediately (you won't be able to see it again)

### Adding the Token to Vercel

Add the token as an environment variable in your Vercel project:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new environment variable:
   - **Name:** `CHRONALOG_GITHUB_TOKEN`
   - **Value:** Your GitHub personal access token
   - **Environment:** Select all (Production, Preview, Development)
4. Click "Save"
5. Redeploy your application for the changes to take effect

Environment Variable:

```env
CHRONALOG_GITHUB_TOKEN=your_github_token
```

### How It Works

Chronalog uses the access token in the following priority order:

1. **User session token** - If a user is logged in via GitHub OAuth, their session token is used (highest priority)
2. **Environment variable token** - The `CHRONALOG_GITHUB_TOKEN` is used as a fallback for public pages
3. **No token** - For public repositories, the GitHub REST API is used without authentication (may be subject to rate limits)

**Note:** For private repositories, an access token is required. The environment variable token ensures your public changelog page works without requiring users to log in.

### Repository Configuration (Optional)

If your Vercel deployment is not connected to Git, or if Git commands are not available in your serverless environment, you can manually specify your repository details using these environment variables:

```env
CHRONALOG_REPO_OWNER=your_github_username
CHRONALOG_REPO_SLUG=your_repo_name
CHRONALOG_REPO_BRANCH=main
```

**When to use these:** These are only needed if Chronalog cannot automatically detect your repository from Git commands. Vercel automatically provides `VERCEL_GIT_REPO_OWNER` and `VERCEL_GIT_REPO_SLUG` when your project is connected to Git, so you typically don't need to set these manually.

### Complete Environment Variables List

Here's a complete list of all environment variables you may need in Vercel:

```env
CHRONALOG_GITHUB_ID=your_client_id
CHRONALOG_GITHUB_SECRET=your_client_secret
CHRONALOG_GITHUB_TOKEN=your_github_token
CHRONALOG_TOKEN_SECRET=your_secret_key
CHRONALOG_REPO_OWNER=your_github_username
CHRONALOG_REPO_SLUG=your_repo_name
CHRONALOG_REPO_BRANCH=main
```

- **Required for OAuth:** `CHRONALOG_GITHUB_ID` and `CHRONALOG_GITHUB_SECRET` are needed for GitHub OAuth authentication in the admin interface.
- **Required for deployment:** `CHRONALOG_GITHUB_TOKEN` ensures your public changelog page works without requiring user authentication.
- **Optional:** `CHRONALOG_TOKEN_SECRET` is recommended for production to secure session tokens. `CHRONALOG_REPO_OWNER`, `CHRONALOG_REPO_SLUG`, and `CHRONALOG_REPO_BRANCH` are only needed if Git commands are unavailable.

## Changelog Entry Schema

Changelog entries are stored as MDX files with YAML frontmatter. Here's the complete schema:

### Required Fields

- `title` (string) - The title of the changelog entry
- `date` (string) - ISO datetime format: YYYY-MM-DDTHH:mm:ss.sssZ
- `body` (string) - The main content/body of the changelog entry (MDX/HTML)

### Optional Fields

- `version` (string) - Version number (e.g., "1.0.0")
- `tags` (string[]) - Array of tags for categorisation
- `features` (string[]) - Array of feature descriptions
- `bugfixes` (string[]) - Array of bug fix descriptions

### Example Entry

```mdx
---
title: Version 1.0.0 Release
date: 2024-01-15T14:30:00.000Z
version: 1.0.0
tags:
  - "release"
  - "feature"
features:
  - "Added user authentication system"
  - "Implemented dark mode"
bugfixes:
  - "Fixed login redirect issue"
---

This release includes major new features and important bug fixes.

## Highlights

- Complete authentication overhaul
- Improved performance across the board
- Better user experience
```

## API Usage

### Saving Entries

Save changelog entries via the API endpoint:

```http
POST /api/changelog/save
Content-Type: application/json

{
  "title": "New Feature Release",
  "version": "1.0.0",
  "date": "2024-01-15",
  "tags": ["feature", "release"],
  "features": ["Added new authentication"],
  "bugfixes": ["Fixed login issue"],
  "body": "This is the main content..."
}
```

### Reading Entries

Use the Chronalog utilities to read and list entries:

```typescript
import { 
  listChangelogEntries, 
  readChangelogEntry,
  filterChangelogEntriesByTags,
  getAllTags 
} from "chronalog";

// List all entries
const entries = listChangelogEntries();

// Read a specific entry
const entry = readChangelogEntry("my-entry-slug");

// Filter by tags
const featureEntries = filterChangelogEntriesByTags(
  entries, 
  ["feature"]
);

// Get all available tags
const tags = getAllTags(entries);
```

## License

MIT
