import { SaveChangelogRequest, ParsedChangelogEntry } from './client.js';
export { ChangelogEntry, extractVersion, generateSlug, incrementVersion, isValidVersion, normaliseTags, parseChangelogEntry, serialiseChangelogEntry } from './client.js';

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
 * @param entry The changelog entry to save
 * @param changelogDir The directory where changelog files are stored (default: from config or "changelog")
 * @param autoCommit Whether to automatically commit to Git (default: from config or true)
 * @returns The result with file path and Git commit status
 */
declare function saveChangelogEntry(entry: SaveChangelogRequest, changelogDir?: string, autoCommit?: boolean): SaveChangelogResult;
/**
 * Reads a changelog entry from the filesystem
 * @param slug The slug of the changelog entry
 * @param changelogDir The directory where changelog files are stored (default: from config or "changelog")
 * @returns The parsed changelog entry
 */
declare function readChangelogEntry(slug: string, changelogDir?: string): ParsedChangelogEntry;
/**
 * Lists all changelog entries
 * @param changelogDir The directory where changelog files are stored (default: from config or "changelog")
 * @returns Array of parsed changelog entries
 */
declare function listChangelogEntries(changelogDir?: string): ParsedChangelogEntry[];
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
 */
declare function getGitRemoteUrl(cwd?: string): string | null;
/**
 * Gets the current Git branch name
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

declare function chronalog(): string;

export { type ChronalogConfig, type GitCommit, type LoginSession, ParsedChangelogEntry, SaveChangelogRequest, type SaveChangelogResult, autoCommitChangelog, checkCollaborator, checkRepository, chronalog, clearLoginSession, commitChanges, fetchGitHubUser, filterChangelogEntriesByTags, getAccessToken, getAllTags, getDefaultConfig, getGitBranch, getGitCommitHistory, getGitHubCommitUrl, getGitRemoteUrl, getLoginSession, isGitInstalled, isGitRepository, isWorkingDirectoryClean, listChangelogEntries, listMediaFiles, loadChronalogConfig, parseGitHubRepoFromUrl, readChangelogEntry, readPredefinedTags, saveChangelogEntry, saveHomeUrl, saveMediaFile, savePredefinedTags, setLoginSession, stageFile };
