import { SaveChangelogRequest, ParsedChangelogEntry } from './client.js';
export { ChangelogEntry, extractVersion, generateSlug, incrementVersion, isValidVersion, normaliseTags, parseChangelogEntry, serialiseChangelogEntry } from './client.js';
import { GraphQLClient } from 'graphql-request';

/**
 * Result of saving a changelog entry
 */
interface SaveChangelogResult {
    filePath: string;
    gitCommit?: {
        success: boolean;
        error?: string;
    };
}
/**
 * Saves a changelog entry to the filesystem and optionally commits to Git
 * Automatically uses GitHub API in serverless environments if access token is provided
 * @param entry The changelog entry to save
 * @param changelogDir The directory where changelog files are stored (default: from config or "changelog")
 * @param autoCommit Whether to automatically commit to Git (default: from config or true)
 * @param options Optional: accessToken and remoteUrl for GitHub API mode
 * @returns The result with file path and Git commit status
 */
declare function saveChangelogEntry(entry: SaveChangelogRequest, changelogDir?: string, autoCommit?: boolean, options?: {
    accessToken?: string;
    remoteUrl?: string | null;
    branch?: string;
}): Promise<SaveChangelogResult>;
/**
 * Reads a changelog entry from the filesystem
 * Automatically uses GitHub API in serverless environments if access token is provided
 * @param slug The slug of the changelog entry
 * @param changelogDir The directory where changelog files are stored (default: from config or "changelog")
 * @param options Optional: accessToken and remoteUrl for GitHub API mode
 * @returns The parsed changelog entry
 */
declare function readChangelogEntry(slug: string, changelogDir?: string, options?: {
    accessToken?: string;
    remoteUrl?: string | null;
    branch?: string;
}): Promise<ParsedChangelogEntry>;
/**
 * Lists all changelog entries
 * Automatically uses GitHub API in serverless environments if access token is provided
 * @param changelogDir The directory where changelog files are stored (default: from config or "changelog")
 * @param options Optional: accessToken and remoteUrl for GitHub API mode
 * @returns Array of parsed changelog entries
 */
declare function listChangelogEntries(changelogDir?: string, options?: {
    accessToken?: string;
    remoteUrl?: string | null;
    branch?: string;
}): Promise<ParsedChangelogEntry[]>;
/**
 * Filters changelog entries by tags
 * @param entries Array of changelog entries to filter
 * @param tags Tags to filter by (entry must have at least one matching tag)
 * @returns Filtered array of changelog entries
 */
declare function filterChangelogEntriesByTags(entries: ParsedChangelogEntry[], tags: string[]): ParsedChangelogEntry[];
/**
 * Gets all unique tags from changelog entries
 * @param entries Array of changelog entries
 * @returns Array of unique tags
 */
declare function getAllTags(entries: ParsedChangelogEntry[]): string[];
/**
 * Saves a media file to the public directory
 * @param fileBuffer The file buffer to save
 * @param filename The filename to save as
 * @param mediaDir The directory where media files are stored (default: "public/chronalog")
 * @returns The public URL path to the saved file
 */
declare function saveMediaFile(fileBuffer: Buffer, filename: string, mediaDir?: string): string;
/**
 * Lists all media files in the media directory
 * @param mediaDir The directory where media files are stored (default: "public/chronalog")
 * @returns Array of media file information
 */
declare function listMediaFiles(mediaDir?: string): Array<{
    filename: string;
    url: string;
    size: number;
    modified: Date;
}>;
/**
 * Reads predefined tags from chronalog/config.json in the project root
 * @param configDir The directory for the config file (default: "chronalog")
 * @returns Array of predefined tags
 */
declare function readPredefinedTags(configDir?: string): string[];
/**
 * Saves predefined tags to chronalog/config.json in the project root
 * @param tags Array of tags to save
 * @param configDir The directory for the config file (default: "chronalog")
 * @returns Success status
 */
declare function savePredefinedTags(tags: string[], configDir?: string): {
    success: boolean;
    error?: string;
};
/**
 * Saves home URL to chronalog/config.json in the project root
 * @param homeUrl The home URL to save
 * @param configDir The directory for the config file (default: "chronalog")
 * @returns Success status
 */
declare function saveHomeUrl(homeUrl: string, configDir?: string): {
    success: boolean;
    error?: string;
};

/**
 * Checks if the current directory is a Git repository
 */
declare function isGitRepository(cwd?: string): boolean;
/**
 * Checks if Git is installed and available
 */
declare function isGitInstalled(): boolean;
/**
 * Checks if the working directory is clean (no uncommitted changes)
 */
declare function isWorkingDirectoryClean(cwd?: string): boolean;
/**
 * Stages a file for commit
 */
declare function stageFile(filePath: string, cwd?: string): void;
/**
 * Commits staged changes with a message
 * @returns The commit hash of the created commit
 */
declare function commitChanges(message: string, cwd?: string): string;
/**
 * Gets the Git remote URL (origin)
 * In serverless environments (Vercel), uses environment variables
 * Falls back to git config in local development
 */
declare function getGitRemoteUrl(cwd?: string): string | null;
/**
 * Gets the current Git branch name
 * In serverless environments (Vercel), uses environment variables
 * Falls back to git command in local development
 */
declare function getGitBranch(cwd?: string): string | null;
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
declare function autoCommitChangelog(filePath: string, title: string, commitMessageFormat?: string, cwd?: string): {
    success: boolean;
    commitHash?: string;
    error?: string;
};
/**
 * Gets the GitHub commit URL for a given commit hash
 */
declare function getGitHubCommitUrl(commitHash: string, cwd?: string): string | null;
/**
 * Git commit information
 */
interface GitCommit {
    hash: string;
    message: string;
    author: string;
    date: string;
    shortHash: string;
}
/**
 * Gets a list of recent git commits
 * @param limit Maximum number of commits to return (default: 50)
 * @param cwd Working directory (defaults to process.cwd())
 * @returns Array of commit information
 */
declare function getGitCommitHistory(limit?: number, cwd?: string): GitCommit[];

/**
 * Configuration options for Chronalog
 */
interface ChronalogConfig {
    /**
     * Directory where changelog files are stored (default: "chronalog/changelog")
     */
    changelogDir?: string;
    /**
     * Route path for the admin interface (default: "/chronalog")
     */
    adminRoute?: string;
    /**
     * Route path for the public changelog page (default: "/changelog")
     */
    changelogRoute?: string;
    /**
     * API route path for saving entries (default: "/api/changelog/save")
     */
    apiRoute?: string;
    /**
     * Custom commit message format
     * Use {title} as placeholder for entry title
     * Default: "changelog: {title}"
     */
    commitMessageFormat?: string;
    /**
     * Whether to auto-commit changes (default: true)
     */
    autoCommit?: boolean;
    /**
     * Home URL for the home button in the navbar (default: "/")
     */
    homeUrl?: string;
}
/**
 * Loads Chronalog configuration from changelog.config.ts or changelog.config.js
 * Note: In Next.js environments, config should be loaded at build time.
 * This function attempts to read and parse the config file synchronously.
 *
 * @param cwd Working directory (defaults to process.cwd())
 * @returns Configuration object with defaults merged
 */
declare function loadChronalogConfig(cwd?: string): Required<ChronalogConfig>;
/**
 * Gets the default configuration
 */
declare function getDefaultConfig(): Required<ChronalogConfig>;

type LoginSession = {
    user: {
        name: string;
        login: string;
        email: string;
        image: string;
    };
    access_token: string;
    expires: Date;
    refresh_token?: string;
    refresh_token_expires?: Date;
};
declare function setLoginSession(session: LoginSession): Promise<boolean>;
declare function getLoginSession(): Promise<LoginSession | null>;
declare function clearLoginSession(): Promise<void>;

declare function getAccessToken(code: {
    code: string;
} | {
    refresh_token: string;
    grant_type: 'refresh_token';
}): Promise<{
    access_token: string | null;
    expires_in: number;
    refresh_token: string | undefined;
    refresh_token_expires_in: number | undefined;
}>;
declare function fetchGitHubUser(token: string): Promise<any>;
declare function checkRepository(token: string, repoOwner: string, repoName: string): Promise<boolean>;
declare function checkCollaborator(token: string, repoOwner: string, repoName: string, userName: string): Promise<boolean>;
declare function parseGitHubRepoFromUrl(url: string | null): {
    owner: string;
    name: string;
} | null;

/**
 * Creates a GraphQL client for GitHub API
 */
declare function createGitHubClient(accessToken: string): GraphQLClient;
/**
 * Gets the current branch OID (commit SHA)
 */
declare function getBranchOid(client: GraphQLClient, owner: string, name: string, branch?: string): Promise<string>;
/**
 * Gets file content from GitHub
 */
declare function getFileContent(client: GraphQLClient, owner: string, name: string, filePath: string, branch?: string): Promise<string | null>;
/**
 * Lists files in a directory
 */
declare function listFiles(client: GraphQLClient, owner: string, name: string, path: string, branch?: string): Promise<Array<{
    path: string;
    name: string;
    type: string;
}>>;
/**
 * Creates a commit with file changes
 */
declare function createCommit(client: GraphQLClient, owner: string, name: string, branch: string, oid: string, message: string, additions: Array<{
    path: string;
    contents: string;
}>, deletions?: Array<{
    path: string;
}>): Promise<string>;
/**
 * Helper to create a commit API similar to Outstatic
 */
interface CommitAPI {
    setMessage: (title: string, body?: string) => void;
    replaceFile: (file: string, contents: string, encode?: boolean) => void;
    removeFile: (file: string) => void;
    createInput: () => {
        branch: {
            repositoryNameWithOwner: string;
            branchName: string;
        };
        message: {
            headline: string;
        };
        fileChanges: {
            additions: Array<{
                path: string;
                contents: string;
            }>;
            deletions: Array<{
                path: string;
            }>;
        };
        expectedHeadOid: string;
    };
}
declare function createCommitApi({ message, owner, oid, name, branch, }: {
    message: string;
    owner: string;
    oid: string;
    name: string;
    branch: string;
}): CommitAPI;

/**
 * Saves a changelog entry using GitHub API
 */
declare function saveChangelogEntryViaGitHub(entry: SaveChangelogRequest, accessToken: string, remoteUrl: string | null, changelogDir?: string, branch?: string): Promise<SaveChangelogResult>;
/**
 * Reads a changelog entry using GitHub API
 */
declare function readChangelogEntryViaGitHub(slug: string, accessToken: string, remoteUrl: string | null, changelogDir?: string, branch?: string): Promise<ParsedChangelogEntry>;
/**
 * Lists all changelog entries using GitHub API
 */
declare function listChangelogEntriesViaGitHub(accessToken: string, remoteUrl: string | null, changelogDir?: string, branch?: string): Promise<ParsedChangelogEntry[]>;
/**
 * Determines if we should use GitHub API based on environment
 */
declare function shouldUseGitHubAPI(): boolean;

/**
 * Reads predefined tags from chronalog/config.json using GitHub API
 */
declare function readPredefinedTagsViaGitHub(accessToken: string, remoteUrl: string | null, configDir?: string, branch?: string): Promise<string[]>;
/**
 * Saves predefined tags to chronalog/config.json using GitHub API
 */
declare function savePredefinedTagsViaGitHub(tags: string[], accessToken: string, remoteUrl: string | null, configDir?: string, branch?: string): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Reads home URL from chronalog/config.json using GitHub API
 */
declare function readHomeUrlViaGitHub(accessToken: string, remoteUrl: string | null, configDir?: string, branch?: string): Promise<string>;
/**
 * Saves home URL to chronalog/config.json using GitHub API
 */
declare function saveHomeUrlViaGitHub(homeUrl: string, accessToken: string, remoteUrl: string | null, configDir?: string, branch?: string): Promise<{
    success: boolean;
    error?: string;
}>;

interface GitHubCommit {
    hash: string;
    shortHash: string;
    message: string;
    author: string;
    date: string;
}
/**
 * Gets git commit history using GitHub API
 */
declare function getGitCommitHistoryViaGitHub(accessToken: string, remoteUrl: string | null, limit?: number, branch?: string): Promise<GitHubCommit[]>;

declare function chronalog(): string;

export { type ChronalogConfig, type CommitAPI, type GitCommit, type GitHubCommit, type LoginSession, ParsedChangelogEntry, SaveChangelogRequest, type SaveChangelogResult, autoCommitChangelog, checkCollaborator, checkRepository, chronalog, clearLoginSession, commitChanges, createCommit, createCommitApi, createGitHubClient, fetchGitHubUser, filterChangelogEntriesByTags, getAccessToken, getAllTags, getBranchOid, getDefaultConfig, getFileContent, getGitBranch, getGitCommitHistory, getGitCommitHistoryViaGitHub, getGitHubCommitUrl, getGitRemoteUrl, getLoginSession, isGitInstalled, isGitRepository, isWorkingDirectoryClean, listChangelogEntries, listChangelogEntriesViaGitHub, listFiles, listMediaFiles, loadChronalogConfig, parseGitHubRepoFromUrl, readChangelogEntry, readChangelogEntryViaGitHub, readHomeUrlViaGitHub, readPredefinedTags, readPredefinedTagsViaGitHub, saveChangelogEntry, saveChangelogEntryViaGitHub, saveHomeUrl, saveHomeUrlViaGitHub, saveMediaFile, savePredefinedTags, savePredefinedTagsViaGitHub, setLoginSession, shouldUseGitHubAPI, stageFile };
