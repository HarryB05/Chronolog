import {
  __require,
  extractVersion,
  generateSlug,
  incrementVersion,
  isValidVersion,
  normaliseTags,
  parseChangelogEntry,
  serialiseChangelogEntry
} from "./chunk-ADRHQY64.js";

// src/filesystem.ts
import fs3 from "fs";
import path3 from "path";

// src/git.ts
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
function isGitRepository(cwd = process.cwd()) {
  const gitDir = path.join(cwd, ".git");
  return fs.existsSync(gitDir);
}
function isGitInstalled() {
  try {
    execSync("git --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}
function isWorkingDirectoryClean(cwd = process.cwd()) {
  try {
    const status = execSync("git status --porcelain", {
      cwd,
      encoding: "utf-8",
      stdio: "pipe"
    });
    return status.trim() === "";
  } catch {
    return false;
  }
}
function stageFile(filePath, cwd = process.cwd()) {
  try {
    execSync(`git add "${filePath}"`, {
      cwd,
      stdio: "pipe"
    });
  } catch (error) {
    throw new Error(`Failed to stage file: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
function commitChanges(message, cwd = process.cwd()) {
  try {
    const beforeCommit = execSync("git rev-parse HEAD", {
      cwd,
      encoding: "utf-8",
      stdio: "pipe"
    }).trim();
    execSync(`git commit -m "${message}"`, {
      cwd,
      stdio: "pipe"
    });
    const commitHash = execSync("git rev-parse HEAD", {
      cwd,
      encoding: "utf-8",
      stdio: "pipe"
    });
    const hash = commitHash.trim();
    if (hash === beforeCommit) {
      throw new Error("Commit did not create a new commit hash");
    }
    return hash;
  } catch (error) {
    throw new Error(`Failed to commit changes: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
function getGitRemoteUrl(cwd = process.cwd()) {
  if (process.env.VERCEL === "1" || process.env.CF_PAGES === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    if (process.env.VERCEL_GIT_REPO_URL) {
      return process.env.VERCEL_GIT_REPO_URL;
    }
    const repoOwner = process.env.CHRONALOG_REPO_OWNER || process.env.VERCEL_GIT_REPO_OWNER || process.env.OST_REPO_OWNER;
    const repoSlug = process.env.CHRONALOG_REPO_SLUG || process.env.VERCEL_GIT_REPO_SLUG || process.env.OST_REPO_SLUG;
    if (repoOwner && repoSlug) {
      return `https://github.com/${repoOwner}/${repoSlug}.git`;
    }
  }
  try {
    if (!isGitRepository(cwd)) {
      return null;
    }
    const remoteUrl = execSync("git config --get remote.origin.url", {
      cwd,
      encoding: "utf-8",
      stdio: "pipe"
    });
    return remoteUrl.trim() || null;
  } catch {
    return null;
  }
}
function getGitBranch(cwd = process.cwd()) {
  if (process.env.VERCEL === "1" || process.env.CF_PAGES === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    if (process.env.VERCEL_GIT_COMMIT_REF) {
      return process.env.VERCEL_GIT_COMMIT_REF;
    }
    if (process.env.CHRONALOG_REPO_BRANCH) {
      return process.env.CHRONALOG_REPO_BRANCH;
    }
    if (process.env.OST_REPO_BRANCH) {
      return process.env.OST_REPO_BRANCH;
    }
    if (process.env.VERCEL_ENV === "production") {
      return "main";
    }
  }
  try {
    if (!isGitRepository(cwd)) {
      return null;
    }
    const branch = execSync("git branch --show-current", {
      cwd,
      encoding: "utf-8",
      stdio: "pipe"
    });
    return branch.trim() || null;
  } catch {
    return null;
  }
}
function autoCommitChangelog(filePath, title, commitMessageFormat = "changelog: {title}", cwd = process.cwd()) {
  if (!isGitInstalled()) {
    return {
      success: false,
      error: "Git is not installed or not available in PATH"
    };
  }
  if (!isGitRepository(cwd)) {
    return {
      success: false,
      error: "Not a Git repository. Initialize Git first."
    };
  }
  try {
    stageFile(filePath, cwd);
    const commitMessage = commitMessageFormat.replace("{title}", title);
    const commitHash = commitChanges(commitMessage, cwd);
    return { success: true, commitHash };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error during commit"
    };
  }
}
function getGitHubCommitUrl(commitHash, cwd = process.cwd()) {
  const remoteUrl = getGitRemoteUrl(cwd);
  if (!remoteUrl) return null;
  const match = remoteUrl.match(/(?:github\.com[/:]|git@github\.com:)([^/]+)\/([^/]+?)(?:\.git)?$/);
  if (match) {
    const owner = match[1];
    const repo = match[2].replace(".git", "");
    return `https://github.com/${owner}/${repo}/commit/${commitHash}`;
  }
  return null;
}
function getGitCommitHistory(limit = 50, cwd = process.cwd()) {
  try {
    if (!isGitRepository(cwd)) {
      return [];
    }
    const format = "%H|%an|%ai|%s";
    const output = execSync(
      `git log -n ${limit} --pretty=format:"${format}"`,
      {
        cwd,
        encoding: "utf-8",
        stdio: "pipe"
      }
    );
    const commits = [];
    const lines = output.trim().split("\n").filter((line) => line.trim());
    for (const line of lines) {
      const parts = line.split("|");
      if (parts.length >= 4) {
        const hash = parts[0];
        const author = parts[1];
        const date = parts[2];
        const message = parts.slice(3).join("|");
        commits.push({
          hash,
          shortHash: hash.substring(0, 7),
          author,
          date,
          message
        });
      }
    }
    return commits;
  } catch (error) {
    console.error("Failed to get git commit history:", error);
    return [];
  }
}

// src/config.ts
import fs2 from "fs";
import path2 from "path";
var DEFAULT_CONFIG = {
  changelogDir: "chronalog/changelog",
  adminRoute: "/chronalog",
  changelogRoute: "/changelog",
  apiRoute: "/api/changelog/save",
  commitMessageFormat: "changelog: {title}",
  autoCommit: true,
  homeUrl: "/"
};
function loadChronalogConfig(cwd = process.cwd()) {
  const configPaths = [
    path2.join(cwd, "changelog.config.ts"),
    path2.join(cwd, "changelog.config.js"),
    path2.join(cwd, "changelog.config.mjs")
  ];
  for (const configPath of configPaths) {
    if (fs2.existsSync(configPath)) {
      try {
        if (configPath.endsWith(".ts")) {
          continue;
        }
        if (typeof __require !== "undefined") {
          const config = __require(configPath);
          const userConfig = config.default || config;
          return {
            ...DEFAULT_CONFIG,
            ...userConfig
          };
        }
      } catch (error) {
        console.warn(`Failed to load config from ${configPath}:`, error);
      }
    }
  }
  return DEFAULT_CONFIG;
}
function getDefaultConfig() {
  return { ...DEFAULT_CONFIG };
}

// src/utils/github-api.ts
import { GraphQLClient } from "graphql-request";
import { encode as toBase64 } from "js-base64";
var GITHUB_GQL_API_URL = "https://api.github.com/graphql";
function createGitHubClient(accessToken) {
  return new GraphQLClient(GITHUB_GQL_API_URL, {
    headers: {
      authorization: `Bearer ${accessToken}`
    }
  });
}
async function getBranchOid(client, owner, name, branch = "main") {
  const query = `
    query GetBranchOid($owner: String!, $name: String!, $branch: String!) {
      repository(owner: $owner, name: $name) {
        ref(qualifiedName: $branch) {
          target {
            oid
          }
        }
      }
    }
  `;
  const data = await client.request(query, { owner, name, branch });
  if (!data.repository?.ref?.target) {
    throw new Error(`Branch ${branch} not found`);
  }
  return data.repository.ref.target.oid;
}
async function getFileContent(client, owner, name, filePath, branch = "main") {
  const query = `
    query GetFile($owner: String!, $name: String!, $filePath: String!) {
      repository(owner: $owner, name: $name) {
        object(expression: $filePath) {
          ... on Blob {
            text
          }
        }
      }
    }
  `;
  try {
    const data = await client.request(query, {
      owner,
      name,
      filePath: `${branch}:${filePath}`
    });
    return data.repository?.object?.text || null;
  } catch (error) {
    return null;
  }
}
async function listFiles(client, owner, name, path4, branch = "main") {
  const query = `
    query ListFiles($owner: String!, $name: String!, $contentPath: String!) {
      repository(owner: $owner, name: $name) {
        object(expression: $contentPath) {
          ... on Tree {
            entries {
              path
              name
              type
            }
          }
        }
      }
    }
  `;
  try {
    const data = await client.request(query, {
      owner,
      name,
      contentPath: `${branch}:${path4}`
    });
    return data.repository?.object?.entries || [];
  } catch (error) {
    return [];
  }
}
async function createCommit(client, owner, name, branch, oid, message, additions, deletions = []) {
  const mutation = `
    mutation CreateCommit($input: CreateCommitOnBranchInput!) {
      createCommitOnBranch(input: $input) {
        commit {
          oid
        }
      }
    }
  `;
  const input = {
    branch: {
      repositoryNameWithOwner: `${owner}/${name}`,
      branchName: branch
    },
    message: {
      headline: message
    },
    fileChanges: {
      additions: additions.map((add) => ({
        path: add.path,
        contents: add.contents
      })),
      deletions: deletions.map((del) => ({
        path: del.path
      }))
    },
    expectedHeadOid: oid
  };
  const data = await client.request(mutation, { input });
  return data.createCommitOnBranch.commit.oid;
}
function createCommitApi({
  message,
  owner,
  oid,
  name,
  branch
}) {
  const additions = [];
  const deletions = [];
  let commitMessage = message ?? "chore: Chronalog commit";
  let commitBody = "Automatically created by Chronalog";
  const setMessage = (title, body) => {
    commitMessage = title ?? commitMessage;
    commitBody = body ?? commitBody;
  };
  const replaceFile = (file, contents, encode = true) => {
    const encoded = encode === true ? toBase64(contents) : contents;
    additions.push({ path: file, contents: encoded });
  };
  const removeFile = (file) => {
    deletions.push({ path: file });
  };
  const createInput = () => {
    return {
      branch: {
        repositoryNameWithOwner: `${owner}/${name}`,
        branchName: branch
      },
      message: {
        headline: commitMessage
      },
      fileChanges: {
        additions,
        deletions
      },
      expectedHeadOid: oid
    };
  };
  return { setMessage, createInput, replaceFile, removeFile };
}

// src/utils/auth/constants.ts
var TOKEN_NAME = process.env.NEXT_PUBLIC_CHRONALOG_TOKEN_NAME || "chronalog_token";
var MAX_AGE = 60 * 60 * 24 * 30;
var TOKEN_SECRET = process.env.CHRONALOG_TOKEN_SECRET || "chronalog-dev-secret-change-in-production";
var COOKIE_SETTINGS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  sameSite: "lax"
};
var SESSION_ERROR_MESSAGES = {
  INVALID_SESSION: "Invalid session data",
  SESSION_EXPIRED: "Session expired",
  INVALID_STRUCTURE: "Invalid session structure detected"
};

// src/utils/auth/github.ts
async function getAccessToken(code) {
  const request = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      client_id: process.env.CHRONALOG_GITHUB_ID,
      client_secret: process.env.CHRONALOG_GITHUB_SECRET,
      ...code
    })
  });
  const text = await request.text();
  const params = new URLSearchParams(text);
  return {
    access_token: params.get("access_token"),
    expires_in: (params.get("expires_in") ? parseInt(params.get("expires_in")) : MAX_AGE) * 1e3,
    refresh_token: params.get("refresh_token") || void 0,
    refresh_token_expires_in: params.get("refresh_token_expires_in") ? parseInt(params.get("refresh_token_expires_in")) * 1e3 : void 0
  };
}
async function fetchGitHubUser(token) {
  const request = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: "token " + token
    }
  });
  return await request.json();
}
async function checkRepository(token, repoOwner, repoName) {
  const response = await fetch(
    `https://api.github.com/repos/${repoOwner}/${repoName}`,
    {
      headers: {
        Authorization: `token ${token}`
      }
    }
  );
  return response.status === 200;
}
async function checkCollaborator(token, repoOwner, repoName, userName) {
  const response = await fetch(
    `https://api.github.com/repos/${repoOwner}/${repoName}/collaborators/${userName}`,
    {
      headers: {
        Authorization: `token ${token}`
      }
    }
  );
  return response.status === 204;
}
function parseGitHubRepoFromUrl(url) {
  if (!url) return null;
  const match = url.match(/(?:github\.com[/:]|git@github\.com:)([^/]+)\/([^/]+?)(?:\.git)?$/);
  if (match) {
    return {
      owner: match[1],
      name: match[2].replace(".git", "")
    };
  }
  return null;
}

// src/utils/github-filesystem.ts
function isServerlessEnvironment() {
  return typeof process !== "undefined" && (process.env.VERCEL === "1" || process.env.CF_PAGES === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME !== void 0 || process.env.NODE_ENV === "production");
}
async function saveChangelogEntryViaGitHub(entry, accessToken, remoteUrl, changelogDir, branch = "main") {
  if (!remoteUrl) {
    if (process.env.VERCEL_GIT_REPO_URL) {
      remoteUrl = process.env.VERCEL_GIT_REPO_URL;
    } else {
      const repoOwner = process.env.CHRONALOG_REPO_OWNER || process.env.VERCEL_GIT_REPO_OWNER || process.env.OST_REPO_OWNER;
      const repoSlug = process.env.CHRONALOG_REPO_SLUG || process.env.VERCEL_GIT_REPO_SLUG || process.env.OST_REPO_SLUG;
      if (repoOwner && repoSlug) {
        remoteUrl = `https://github.com/${repoOwner}/${repoSlug}.git`;
      }
    }
  }
  if (!remoteUrl) {
    throw new Error("Git remote URL is required for GitHub API operations. Set VERCEL_GIT_REPO_URL, CHRONALOG_REPO_OWNER/CHRONALOG_REPO_SLUG, VERCEL_GIT_REPO_OWNER/VERCEL_GIT_REPO_SLUG, or OST_REPO_OWNER/OST_REPO_SLUG environment variables.");
  }
  const repoInfo = parseGitHubRepoFromUrl(remoteUrl);
  if (!repoInfo) {
    throw new Error("Could not parse GitHub repository from remote URL");
  }
  const config = loadChronalogConfig();
  const targetDir = changelogDir || config.changelogDir;
  let filename;
  let originalDate;
  if (entry.slug) {
    filename = `${entry.slug}.mdx`;
    const client2 = createGitHubClient(accessToken);
    const existingContent = await getFileContent(
      client2,
      repoInfo.owner,
      repoInfo.name,
      `${targetDir}/${filename}`,
      branch
    );
    if (existingContent) {
      try {
        const existingEntry = parseChangelogEntry(existingContent, filename);
        originalDate = existingEntry.date;
      } catch (error) {
        console.warn(`Failed to parse existing entry for date preservation: ${error}`);
      }
    }
  } else {
    if (!entry.version || !entry.version.trim()) {
      throw new Error("Version is required for changelog entries");
    }
    const cleanVersion = entry.version.trim().replace(/^v/i, "");
    const versionSlug = cleanVersion.replace(/\./g, "-");
    filename = `v${versionSlug}.mdx`;
  }
  const filePath = `${targetDir}/${filename}`;
  const entryToSerialize = entry.slug && originalDate ? { ...entry, date: originalDate } : entry;
  const mdxContent = serialiseChangelogEntry(entryToSerialize);
  const client = createGitHubClient(accessToken);
  const oid = await getBranchOid(client, repoInfo.owner, repoInfo.name, branch);
  const commitMessage = config.commitMessageFormat.replace("{title}", entry.title);
  const commitApi = createCommitApi({
    message: commitMessage,
    owner: repoInfo.owner,
    oid,
    name: repoInfo.name,
    branch
  });
  commitApi.replaceFile(filePath, mdxContent);
  const input = commitApi.createInput();
  const newOid = await createCommit(client, repoInfo.owner, repoInfo.name, branch, oid, commitMessage, input.fileChanges.additions, input.fileChanges.deletions);
  return {
    filePath,
    gitCommit: {
      success: true
    }
  };
}
async function readChangelogEntryViaGitHub(slug, accessToken, remoteUrl, changelogDir, branch = "main") {
  if (!remoteUrl) {
    if (process.env.VERCEL_GIT_REPO_URL) {
      remoteUrl = process.env.VERCEL_GIT_REPO_URL;
    } else {
      const repoOwner = process.env.CHRONALOG_REPO_OWNER || process.env.VERCEL_GIT_REPO_OWNER || process.env.OST_REPO_OWNER;
      const repoSlug = process.env.CHRONALOG_REPO_SLUG || process.env.VERCEL_GIT_REPO_SLUG || process.env.OST_REPO_SLUG;
      if (repoOwner && repoSlug) {
        remoteUrl = `https://github.com/${repoOwner}/${repoSlug}.git`;
      }
    }
  }
  if (!remoteUrl) {
    throw new Error("Git remote URL is required for GitHub API operations. Set VERCEL_GIT_REPO_URL, CHRONALOG_REPO_OWNER/CHRONALOG_REPO_SLUG, VERCEL_GIT_REPO_OWNER/VERCEL_GIT_REPO_SLUG, or OST_REPO_OWNER/OST_REPO_SLUG environment variables.");
  }
  const repoInfo = parseGitHubRepoFromUrl(remoteUrl);
  if (!repoInfo) {
    throw new Error("Could not parse GitHub repository from remote URL");
  }
  const config = loadChronalogConfig();
  const targetDir = changelogDir || config.changelogDir;
  const filename = `${slug}.mdx`;
  const filePath = `${targetDir}/${filename}`;
  const client = createGitHubClient(accessToken);
  const content = await getFileContent(client, repoInfo.owner, repoInfo.name, filePath, branch);
  if (!content) {
    throw new Error(`Changelog entry not found: ${slug}`);
  }
  return parseChangelogEntry(content, filename);
}
async function listChangelogEntriesViaGitHub(accessToken, remoteUrl, changelogDir, branch = "main") {
  console.log("[Chronalog] listChangelogEntriesViaGitHub called with:", {
    hasAccessToken: !!accessToken,
    remoteUrl,
    changelogDir,
    branch
  });
  if (!remoteUrl) {
    if (process.env.VERCEL_GIT_REPO_URL) {
      remoteUrl = process.env.VERCEL_GIT_REPO_URL;
    } else {
      const repoOwner = process.env.CHRONALOG_REPO_OWNER || process.env.VERCEL_GIT_REPO_OWNER || process.env.OST_REPO_OWNER;
      const repoSlug = process.env.CHRONALOG_REPO_SLUG || process.env.VERCEL_GIT_REPO_SLUG || process.env.OST_REPO_SLUG;
      if (repoOwner && repoSlug) {
        remoteUrl = `https://github.com/${repoOwner}/${repoSlug}.git`;
      }
    }
  }
  if (!remoteUrl) {
    throw new Error("Git remote URL is required for GitHub API operations. Set VERCEL_GIT_REPO_URL, CHRONALOG_REPO_OWNER/CHRONALOG_REPO_SLUG, VERCEL_GIT_REPO_OWNER/VERCEL_GIT_REPO_SLUG, or OST_REPO_OWNER/OST_REPO_SLUG environment variables.");
  }
  const repoInfo = parseGitHubRepoFromUrl(remoteUrl);
  if (!repoInfo) {
    throw new Error("Could not parse GitHub repository from remote URL");
  }
  const config = loadChronalogConfig();
  const targetDir = changelogDir || config.changelogDir;
  console.log("[Chronalog] Using target directory:", targetDir);
  console.log("[Chronalog] Repository info:", {
    owner: repoInfo.owner,
    name: repoInfo.name,
    branch
  });
  let files = [];
  if (accessToken) {
    const client = createGitHubClient(accessToken);
    files = await listFiles(client, repoInfo.owner, repoInfo.name, targetDir, branch);
  } else {
    try {
      const url = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.name}/contents/${targetDir}?ref=${branch}`;
      console.log(`[Chronalog] Fetching directory contents from GitHub API: ${url}`);
      const response = await fetch(url);
      console.log(`[Chronalog] GitHub API response status: ${response.status} ${response.statusText}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`[Chronalog] GitHub API returned data:`, {
          isArray: Array.isArray(data),
          itemCount: Array.isArray(data) ? data.length : "not an array",
          dataType: typeof data
        });
        files = Array.isArray(data) ? data.map((item) => ({
          path: item.path,
          name: item.name,
          type: item.type
        })) : [];
        console.log(`[Chronalog] Processed ${files.length} files from directory listing`);
      } else {
        const errorText = await response.text().catch(() => "Could not read error response");
        let errorData = {};
        try {
          errorData = JSON.parse(errorText);
        } catch {
        }
        console.error(`[Chronalog] GitHub API error (${response.status}):`, {
          status: response.status,
          statusText: response.statusText,
          url,
          errorBody: errorText,
          errorMessage: errorData.message || errorText,
          headers: Object.fromEntries(response.headers.entries())
        });
        if (response.status === 403) {
          const errorMsg = errorData.message || errorText;
          if (errorMsg.includes("private") || errorMsg.includes("permission") || errorMsg.includes("Forbidden")) {
            throw new Error(`Repository appears to be private. An access token is required to access private repositories. Error: ${errorMsg}`);
          }
          if (errorMsg.includes("rate limit") || response.headers.get("x-ratelimit-remaining") === "0") {
            throw new Error(`GitHub API rate limit exceeded. Please try again later or use an access token for higher limits.`);
          }
        }
        if (response.status === 404) {
          throw new Error(`Changelog directory not found at path: ${targetDir}. Please check that the directory exists in the repository at branch '${branch}'.`);
        }
        throw new Error(`Failed to fetch directory contents from GitHub API: ${response.status} ${response.statusText}. ${errorData.message || errorText}`);
      }
    } catch (error) {
      console.error("[Chronalog] Failed to list files via REST API:", error);
      throw error;
    }
  }
  const mdxFiles = files.filter(
    (file) => (file.name.endsWith(".mdx") || file.name.endsWith(".md")) && file.type === "blob"
  );
  const entries = [];
  for (const file of mdxFiles) {
    try {
      let content = null;
      if (accessToken) {
        const client = createGitHubClient(accessToken);
        content = await getFileContent(client, repoInfo.owner, repoInfo.name, file.path, branch);
      } else {
        try {
          const url = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.name}/contents/${file.path}?ref=${branch}`;
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            if (data.content && data.encoding === "base64") {
              content = Buffer.from(data.content, "base64").toString("utf-8");
            } else {
              console.warn(`[Chronalog] File ${file.name} missing content or wrong encoding:`, {
                hasContent: !!data.content,
                encoding: data.encoding
              });
            }
          } else {
            const errorText = await response.text().catch(() => "Could not read error response");
            console.warn(`[Chronalog] Failed to fetch ${file.name} via REST API (${response.status}):`, {
              status: response.status,
              statusText: response.statusText,
              errorBody: errorText
            });
          }
        } catch (error) {
          console.warn(`[Chronalog] Failed to fetch ${file.name} via REST API:`, error);
        }
      }
      if (content) {
        const entry = parseChangelogEntry(content, file.name);
        entries.push(entry);
      }
    } catch (error) {
      console.warn(`Failed to parse ${file.name}:`, error);
    }
  }
  return entries.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });
}
function shouldUseGitHubAPI() {
  return isServerlessEnvironment();
}

// src/filesystem.ts
function findProjectRoot(startDir = process.cwd()) {
  let currentDir = path3.resolve(startDir);
  const root = path3.parse(currentDir).root;
  while (currentDir !== root) {
    const packageJsonPath = path3.join(currentDir, "package.json");
    const nextConfigPath = path3.join(currentDir, "next.config.js");
    const nextConfigTsPath = path3.join(currentDir, "next.config.ts");
    const appDir = path3.join(currentDir, "app");
    const pagesDir = path3.join(currentDir, "pages");
    if (fs3.existsSync(packageJsonPath) && (fs3.existsSync(nextConfigPath) || fs3.existsSync(nextConfigTsPath) || fs3.existsSync(appDir) || fs3.existsSync(pagesDir))) {
      return currentDir;
    }
    currentDir = path3.dirname(currentDir);
  }
  return process.cwd();
}
function isServerlessEnvironment2() {
  return typeof process !== "undefined" && (process.env.VERCEL === "1" || process.env.CF_PAGES === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME !== void 0);
}
async function saveChangelogEntry(entry, changelogDir, autoCommit, options) {
  if (isServerlessEnvironment2() && options?.accessToken && (options?.remoteUrl || getGitRemoteUrl())) {
    return saveChangelogEntryViaGitHub(
      entry,
      options.accessToken,
      options.remoteUrl || getGitRemoteUrl(),
      changelogDir,
      options.branch || "main"
    );
  }
  return saveChangelogEntrySync(entry, changelogDir, autoCommit);
}
function saveChangelogEntrySync(entry, changelogDir, autoCommit) {
  const cwd = findProjectRoot();
  const config = loadChronalogConfig(cwd);
  const targetDir = path3.join(cwd, changelogDir || config.changelogDir);
  const shouldAutoCommit = autoCommit !== void 0 ? autoCommit : config.autoCommit;
  if (!fs3.existsSync(targetDir)) {
    fs3.mkdirSync(targetDir, { recursive: true });
  }
  if (!entry.version || !entry.version.trim()) {
    throw new Error("Version is required for changelog entries. Please provide a version number.");
  }
  let filename;
  let originalDate;
  if (entry.slug) {
    filename = `${entry.slug}.mdx`;
    const filePath2 = path3.join(targetDir, filename);
    if (fs3.existsSync(filePath2)) {
      try {
        const existingContent = fs3.readFileSync(filePath2, "utf-8");
        const existingEntry = parseChangelogEntry(existingContent, filename);
        originalDate = existingEntry.date;
      } catch (error) {
        console.warn(`Failed to read existing entry for date preservation: ${error}`);
      }
    }
  } else {
    const cleanVersion = entry.version.trim().replace(/^v/i, "");
    const versionSlug = cleanVersion.replace(/\./g, "-");
    filename = `v${versionSlug}.mdx`;
  }
  const filePath = path3.join(targetDir, filename);
  const entryToSerialize = entry.slug && originalDate ? { ...entry, date: originalDate } : entry;
  const mdxContent = serialiseChangelogEntry(entryToSerialize);
  fs3.writeFileSync(filePath, mdxContent, "utf-8");
  const result = {
    filePath
  };
  if (shouldAutoCommit) {
    const relativePath = path3.relative(cwd, filePath);
    const gitResult = autoCommitChangelog(
      relativePath,
      entry.title,
      config.commitMessageFormat,
      cwd
    );
    result.gitCommit = gitResult;
  }
  return result;
}
async function readChangelogEntry(slug, changelogDir, options) {
  if (isServerlessEnvironment2() && options?.accessToken && (options?.remoteUrl || getGitRemoteUrl())) {
    return readChangelogEntryViaGitHub(
      slug,
      options.accessToken,
      options.remoteUrl || getGitRemoteUrl(),
      changelogDir,
      options.branch || "main"
    );
  }
  return readChangelogEntrySync(slug, changelogDir);
}
function readChangelogEntrySync(slug, changelogDir) {
  const cwd = findProjectRoot();
  const config = loadChronalogConfig(cwd);
  const targetDir = path3.join(cwd, changelogDir || config.changelogDir);
  const filename = `${slug}.mdx`;
  const filePath = path3.join(targetDir, filename);
  if (!fs3.existsSync(filePath)) {
    throw new Error(`Changelog entry not found: ${slug}`);
  }
  const content = fs3.readFileSync(filePath, "utf-8");
  return parseChangelogEntry(content, filename);
}
async function listChangelogEntries(changelogDir, options) {
  if (isServerlessEnvironment2() && (options?.accessToken || true) && // Try even without token for public repos
  (options?.remoteUrl || getGitRemoteUrl())) {
    try {
      return await listChangelogEntriesViaGitHub(
        options?.accessToken || "",
        options?.remoteUrl || getGitRemoteUrl(),
        changelogDir,
        options?.branch || "main"
      );
    } catch (error) {
      console.error("Failed to list entries via GitHub API:", error);
      throw error;
    }
  }
  return listChangelogEntriesSync(changelogDir);
}
function listChangelogEntriesSync(changelogDir) {
  const cwd = findProjectRoot();
  const config = loadChronalogConfig(cwd);
  const targetDir = path3.join(cwd, changelogDir || config.changelogDir);
  if (!fs3.existsSync(targetDir)) {
    return [];
  }
  const files = fs3.readdirSync(targetDir);
  const mdxFiles = files.filter((file) => file.endsWith(".mdx") || file.endsWith(".md"));
  const entries = [];
  for (const filename of mdxFiles) {
    try {
      const filePath = path3.join(targetDir, filename);
      const content = fs3.readFileSync(filePath, "utf-8");
      const entry = parseChangelogEntry(content, filename);
      entries.push(entry);
    } catch (error) {
      console.warn(`Failed to parse ${filename}:`, error);
    }
  }
  return entries.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });
}
function filterChangelogEntriesByTags(entries, tags) {
  if (tags.length === 0) {
    return entries;
  }
  const normalisedTags = tags.map((tag) => tag.trim().toLowerCase());
  return entries.filter((entry) => {
    if (!entry.tags || entry.tags.length === 0) {
      return false;
    }
    const entryTags = entry.tags.map((tag) => tag.toLowerCase());
    return normalisedTags.some((tag) => entryTags.includes(tag));
  });
}
function getAllTags(entries) {
  const tagSet = /* @__PURE__ */ new Set();
  for (const entry of entries) {
    if (entry.tags && entry.tags.length > 0) {
      for (const tag of entry.tags) {
        tagSet.add(tag.toLowerCase());
      }
    }
  }
  return Array.from(tagSet).sort();
}
function saveMediaFile(fileBuffer, filename, mediaDir = "public/chronalog") {
  const cwd = process.cwd();
  const targetDir = path3.join(cwd, mediaDir);
  if (!fs3.existsSync(targetDir)) {
    fs3.mkdirSync(targetDir, { recursive: true });
  }
  const sanitisedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/^-+|-+$/g, "");
  const filePath = path3.join(targetDir, sanitisedFilename);
  let finalPath = filePath;
  if (fs3.existsSync(finalPath)) {
    const ext = path3.extname(sanitisedFilename);
    const nameWithoutExt = path3.basename(sanitisedFilename, ext);
    const timestamp = Date.now();
    finalPath = path3.join(targetDir, `${nameWithoutExt}-${timestamp}${ext}`);
  }
  fs3.writeFileSync(finalPath, fileBuffer);
  const relativePath = path3.relative(path3.join(cwd, "public"), finalPath);
  return `/${relativePath.replace(/\\/g, "/")}`;
}
function listMediaFiles(mediaDir = "public/chronalog") {
  const cwd = process.cwd();
  const targetDir = path3.join(cwd, mediaDir);
  if (!fs3.existsSync(targetDir)) {
    return [];
  }
  const files = fs3.readdirSync(targetDir);
  const mediaFiles = [];
  for (const filename of files) {
    const filePath = path3.join(targetDir, filename);
    const stats = fs3.statSync(filePath);
    if (stats.isFile()) {
      const relativePath = path3.relative(path3.join(cwd, "public"), filePath);
      const url = `/${relativePath.replace(/\\/g, "/")}`;
      mediaFiles.push({
        filename,
        url,
        size: stats.size,
        modified: stats.mtime
      });
    }
  }
  return mediaFiles.sort((a, b) => b.modified.getTime() - a.modified.getTime());
}
function readPredefinedTags(configDir = "chronalog") {
  const projectRoot = findProjectRoot();
  const configDirPath = path3.join(projectRoot, configDir);
  const configPath = path3.join(configDirPath, "config.json");
  if (!fs3.existsSync(configDirPath)) {
    fs3.mkdirSync(configDirPath, { recursive: true });
  }
  if (!fs3.existsSync(configPath)) {
    const defaultConfig = { tags: [] };
    fs3.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), "utf-8");
    return [];
  }
  try {
    const content = fs3.readFileSync(configPath, "utf-8");
    const cleanedContent = content.replace(/^\uFEFF/, "").trim();
    if (!cleanedContent) {
      return [];
    }
    const data = JSON.parse(cleanedContent);
    if (Array.isArray(data)) {
      return data.filter((tag) => typeof tag === "string");
    } else if (data && typeof data === "object" && Array.isArray(data.tags)) {
      return data.tags.filter((tag) => typeof tag === "string");
    }
    return [];
  } catch (error) {
    console.error("Error reading predefined tags:", error);
    try {
      const defaultConfig = { tags: [] };
      fs3.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), "utf-8");
    } catch (writeError) {
      console.error("Error creating default config:", writeError);
    }
    return [];
  }
}
function savePredefinedTags(tags, configDir = "chronalog") {
  const projectRoot = findProjectRoot();
  const configDirPath = path3.join(projectRoot, configDir);
  const configPath = path3.join(configDirPath, "config.json");
  try {
    if (!fs3.existsSync(configDirPath)) {
      fs3.mkdirSync(configDirPath, { recursive: true });
    }
    let existingConfig = {};
    if (fs3.existsSync(configPath)) {
      try {
        const existingContent = fs3.readFileSync(configPath, "utf-8");
        existingConfig = JSON.parse(existingContent);
      } catch (error) {
        console.warn("Error reading existing config, will create new one:", error);
      }
    }
    const validTags = tags.filter((tag) => typeof tag === "string").map((tag) => tag.trim()).filter((tag) => tag.length > 0).sort();
    const uniqueTags = Array.from(new Set(validTags));
    const updatedConfig = {
      ...existingConfig,
      tags: uniqueTags
    };
    const content = JSON.stringify(updatedConfig, null, 2);
    fs3.writeFileSync(configPath, content, "utf-8");
    if (!fs3.existsSync(configPath)) {
      throw new Error(`Config file was not created at ${configPath}`);
    }
    const writtenContent = fs3.readFileSync(configPath, "utf-8");
    const writtenConfig = JSON.parse(writtenContent);
    if (JSON.stringify(writtenConfig.tags) !== JSON.stringify(uniqueTags)) {
      throw new Error(
        `Config file content mismatch. Expected: ${JSON.stringify(uniqueTags)}, Got: ${JSON.stringify(writtenConfig.tags)}`
      );
    }
    return { success: true };
  } catch (error) {
    console.error("Error saving predefined tags:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
function saveHomeUrl(homeUrl, configDir = "chronalog") {
  const projectRoot = findProjectRoot();
  const configDirPath = path3.join(projectRoot, configDir);
  const configPath = path3.join(configDirPath, "config.json");
  try {
    if (!fs3.existsSync(configDirPath)) {
      fs3.mkdirSync(configDirPath, { recursive: true });
    }
    let existingConfig = {};
    if (fs3.existsSync(configPath)) {
      try {
        const existingContent = fs3.readFileSync(configPath, "utf-8");
        const cleanedContent = existingContent.replace(/^\uFEFF/, "").trim();
        if (cleanedContent) {
          existingConfig = JSON.parse(cleanedContent);
        }
      } catch (error) {
        console.warn("Error reading existing config, will create new one:", error);
      }
    }
    const validHomeUrl = typeof homeUrl === "string" && homeUrl.trim() ? homeUrl.trim() : "/";
    const updatedConfig = {
      ...existingConfig,
      homeUrl: validHomeUrl
    };
    const content = JSON.stringify(updatedConfig, null, 2);
    fs3.writeFileSync(configPath, content, "utf-8");
    return { success: true };
  } catch (error) {
    console.error("Error saving home URL:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

// src/utils/auth/auth.ts
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
function isValidDate(value) {
  if (value instanceof Date) return true;
  if (typeof value === "string") {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }
  return false;
}
function normalizeDates(session) {
  return {
    ...session,
    expires: session.expires instanceof Date ? session.expires : new Date(session.expires),
    refresh_token_expires: session.refresh_token_expires ? session.refresh_token_expires instanceof Date ? session.refresh_token_expires : new Date(session.refresh_token_expires) : void 0
  };
}
function validateSession(session) {
  const isValid = session && typeof session === "object" && session.user && typeof session.user.name === "string" && typeof session.user.login === "string" && typeof session.user.email === "string" && typeof session.user.image === "string" && typeof session.access_token === "string" && isValidDate(session.expires);
  if (!isValid) {
    console.warn("Session validation failed:", {
      hasSession: !!session,
      sessionType: typeof session,
      hasUser: !!session?.user,
      userName: typeof session?.user?.name,
      userLogin: typeof session?.user?.login,
      userEmail: typeof session?.user?.email,
      userImage: typeof session?.user?.image,
      accessToken: typeof session?.access_token,
      expiresValid: isValidDate(session?.expires),
      expiresValue: session?.expires
    });
  }
  return isValid;
}
async function setLoginSession(session) {
  if (!validateSession(session)) {
    throw new Error(SESSION_ERROR_MESSAGES.INVALID_SESSION);
  }
  const secret = new TextEncoder().encode(TOKEN_SECRET);
  const token = await new SignJWT({ ...session }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(session.refresh_token_expires ?? session.expires).sign(secret);
  const cookieStore = await cookies();
  const maxAge = Math.max(
    (session.refresh_token_expires ?? session.expires).getTime() - Date.now(),
    0
    // Ensure maxAge is never negative
  );
  cookieStore.set(TOKEN_NAME, token, {
    maxAge: Math.floor(maxAge / 1e3),
    // Convert to seconds
    expires: session.refresh_token_expires ?? session.expires,
    ...COOKIE_SETTINGS
  });
  return true;
}
async function getLoginSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  if (!token) {
    return null;
  }
  try {
    const secret = new TextEncoder().encode(TOKEN_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const session = normalizeDates(payload);
    if (!validateSession(session)) {
      console.warn(SESSION_ERROR_MESSAGES.INVALID_STRUCTURE, session);
      return null;
    }
    const expires = session.expires.getTime();
    const now = Date.now();
    if (now <= expires) {
      return session;
    }
    if (now > expires && session.refresh_token && (!session.refresh_token_expires || now <= session.refresh_token_expires.getTime())) {
      try {
        const {
          access_token,
          expires_in,
          refresh_token,
          refresh_token_expires_in
        } = await getAccessToken({
          refresh_token: session.refresh_token,
          grant_type: "refresh_token"
        });
        if (access_token) {
          const updatedSession = {
            ...session,
            access_token,
            expires: new Date(now + expires_in),
            refresh_token: refresh_token || session.refresh_token,
            refresh_token_expires: refresh_token_expires_in ? new Date(now + refresh_token_expires_in) : session.refresh_token_expires
          };
          await setLoginSession(updatedSession);
          return updatedSession;
        }
      } catch (refreshError) {
        console.error("Failed to refresh token:", refreshError);
      }
    }
    throw new Error(SESSION_ERROR_MESSAGES.SESSION_EXPIRED);
  } catch (error) {
    console.error("Session validation error:", error);
    return null;
  }
}
async function clearLoginSession() {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, "", {
    maxAge: -1,
    ...COOKIE_SETTINGS
  });
}

// src/utils/github-config.ts
async function readPredefinedTagsViaGitHub(accessToken, remoteUrl, configDir = "chronalog", branch = "main") {
  if (!remoteUrl) {
    if (process.env.VERCEL_GIT_REPO_URL) {
      remoteUrl = process.env.VERCEL_GIT_REPO_URL;
    } else {
      const repoOwner = process.env.CHRONALOG_REPO_OWNER || process.env.VERCEL_GIT_REPO_OWNER || process.env.OST_REPO_OWNER;
      const repoSlug = process.env.CHRONALOG_REPO_SLUG || process.env.VERCEL_GIT_REPO_SLUG || process.env.OST_REPO_SLUG;
      if (repoOwner && repoSlug) {
        remoteUrl = `https://github.com/${repoOwner}/${repoSlug}.git`;
      }
    }
  }
  if (!remoteUrl) {
    throw new Error("Git remote URL is required for GitHub API operations. Set VERCEL_GIT_REPO_URL, CHRONALOG_REPO_OWNER/CHRONALOG_REPO_SLUG, VERCEL_GIT_REPO_OWNER/VERCEL_GIT_REPO_SLUG, or OST_REPO_OWNER/OST_REPO_SLUG environment variables.");
  }
  const repoInfo = parseGitHubRepoFromUrl(remoteUrl);
  if (!repoInfo) {
    throw new Error("Could not parse GitHub repository from remote URL");
  }
  const configPath = `${configDir}/config.json`;
  const client = createGitHubClient(accessToken);
  const content = await getFileContent(client, repoInfo.owner, repoInfo.name, configPath, branch);
  if (!content) {
    return [];
  }
  try {
    const data = JSON.parse(content);
    if (Array.isArray(data)) {
      return data.filter((tag) => typeof tag === "string");
    } else if (data && typeof data === "object" && Array.isArray(data.tags)) {
      return data.tags.filter((tag) => typeof tag === "string");
    }
    return [];
  } catch (error) {
    console.error("Error parsing config.json:", error);
    return [];
  }
}
async function savePredefinedTagsViaGitHub(tags, accessToken, remoteUrl, configDir = "chronalog", branch = "main") {
  if (!remoteUrl) {
    if (process.env.VERCEL_GIT_REPO_URL) {
      remoteUrl = process.env.VERCEL_GIT_REPO_URL;
    } else {
      const repoOwner = process.env.CHRONALOG_REPO_OWNER || process.env.VERCEL_GIT_REPO_OWNER || process.env.OST_REPO_OWNER;
      const repoSlug = process.env.CHRONALOG_REPO_SLUG || process.env.VERCEL_GIT_REPO_SLUG || process.env.OST_REPO_SLUG;
      if (repoOwner && repoSlug) {
        remoteUrl = `https://github.com/${repoOwner}/${repoSlug}.git`;
      }
    }
  }
  if (!remoteUrl) {
    throw new Error("Git remote URL is required for GitHub API operations. Set VERCEL_GIT_REPO_URL, CHRONALOG_REPO_OWNER/CHRONALOG_REPO_SLUG, VERCEL_GIT_REPO_OWNER/VERCEL_GIT_REPO_SLUG, or OST_REPO_OWNER/OST_REPO_SLUG environment variables.");
  }
  const repoInfo = parseGitHubRepoFromUrl(remoteUrl);
  if (!repoInfo) {
    throw new Error("Could not parse GitHub repository from remote URL");
  }
  try {
    const configPath = `${configDir}/config.json`;
    const client = createGitHubClient(accessToken);
    let existingConfig = {};
    const existingContent = await getFileContent(client, repoInfo.owner, repoInfo.name, configPath, branch);
    if (existingContent) {
      try {
        existingConfig = JSON.parse(existingContent);
      } catch (error) {
        console.warn("Error reading existing config, will create new one:", error);
      }
    }
    const validTags = tags.filter((tag) => typeof tag === "string").map((tag) => tag.trim()).filter((tag) => tag.length > 0).sort();
    const uniqueTags = Array.from(new Set(validTags));
    const updatedConfig = {
      ...existingConfig,
      tags: uniqueTags
    };
    const oid = await getBranchOid(client, repoInfo.owner, repoInfo.name, branch);
    const commitApi = createCommitApi({
      message: "chore: update predefined tags",
      owner: repoInfo.owner,
      oid,
      name: repoInfo.name,
      branch
    });
    commitApi.replaceFile(configPath, JSON.stringify(updatedConfig, null, 2));
    const input = commitApi.createInput();
    await createCommit(client, repoInfo.owner, repoInfo.name, branch, oid, "chore: update predefined tags", input.fileChanges.additions, input.fileChanges.deletions);
    return { success: true };
  } catch (error) {
    console.error("Error saving predefined tags via GitHub API:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
async function readHomeUrlViaGitHub(accessToken, remoteUrl, configDir = "chronalog", branch = "main") {
  if (!remoteUrl) {
    const repoOwner = process.env.VERCEL_GIT_REPO_OWNER || process.env.OST_REPO_OWNER;
    const repoSlug = process.env.VERCEL_GIT_REPO_SLUG || process.env.OST_REPO_SLUG;
    if (repoOwner && repoSlug) {
      remoteUrl = `https://github.com/${repoOwner}/${repoSlug}.git`;
    } else if (process.env.VERCEL_GIT_REPO_URL) {
      remoteUrl = process.env.VERCEL_GIT_REPO_URL;
    }
  }
  if (!remoteUrl) {
    return "/";
  }
  const repoInfo = parseGitHubRepoFromUrl(remoteUrl);
  if (!repoInfo) {
    return "/";
  }
  const configPath = `${configDir}/config.json`;
  const client = createGitHubClient(accessToken);
  const content = await getFileContent(client, repoInfo.owner, repoInfo.name, configPath, branch);
  if (!content) {
    return "/";
  }
  try {
    const data = JSON.parse(content);
    if (data && typeof data === "object" && typeof data.homeUrl === "string") {
      return data.homeUrl.trim() || "/";
    }
    return "/";
  } catch (error) {
    console.error("Error parsing config.json:", error);
    return "/";
  }
}
async function saveHomeUrlViaGitHub(homeUrl, accessToken, remoteUrl, configDir = "chronalog", branch = "main") {
  if (!remoteUrl) {
    if (process.env.VERCEL_GIT_REPO_URL) {
      remoteUrl = process.env.VERCEL_GIT_REPO_URL;
    } else {
      const repoOwner = process.env.CHRONALOG_REPO_OWNER || process.env.VERCEL_GIT_REPO_OWNER || process.env.OST_REPO_OWNER;
      const repoSlug = process.env.CHRONALOG_REPO_SLUG || process.env.VERCEL_GIT_REPO_SLUG || process.env.OST_REPO_SLUG;
      if (repoOwner && repoSlug) {
        remoteUrl = `https://github.com/${repoOwner}/${repoSlug}.git`;
      }
    }
  }
  if (!remoteUrl) {
    throw new Error("Git remote URL is required for GitHub API operations. Set VERCEL_GIT_REPO_URL, CHRONALOG_REPO_OWNER/CHRONALOG_REPO_SLUG, VERCEL_GIT_REPO_OWNER/VERCEL_GIT_REPO_SLUG, or OST_REPO_OWNER/OST_REPO_SLUG environment variables.");
  }
  const repoInfo = parseGitHubRepoFromUrl(remoteUrl);
  if (!repoInfo) {
    throw new Error("Could not parse GitHub repository from remote URL");
  }
  try {
    const configPath = `${configDir}/config.json`;
    const client = createGitHubClient(accessToken);
    let existingConfig = {};
    const existingContent = await getFileContent(client, repoInfo.owner, repoInfo.name, configPath, branch);
    if (existingContent) {
      try {
        existingConfig = JSON.parse(existingContent);
      } catch (error) {
        console.warn("Error reading existing config, will create new one:", error);
      }
    }
    const validHomeUrl = typeof homeUrl === "string" && homeUrl.trim() ? homeUrl.trim() : "/";
    const updatedConfig = {
      ...existingConfig,
      homeUrl: validHomeUrl
    };
    const oid = await getBranchOid(client, repoInfo.owner, repoInfo.name, branch);
    const commitApi = createCommitApi({
      message: "chore: update home URL",
      owner: repoInfo.owner,
      oid,
      name: repoInfo.name,
      branch
    });
    commitApi.replaceFile(configPath, JSON.stringify(updatedConfig, null, 2));
    const input = commitApi.createInput();
    await createCommit(client, repoInfo.owner, repoInfo.name, branch, oid, "chore: update home URL", input.fileChanges.additions, input.fileChanges.deletions);
    return { success: true };
  } catch (error) {
    console.error("Error saving home URL via GitHub API:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

// src/utils/github-commits.ts
async function getGitCommitHistoryViaGitHub(accessToken, remoteUrl, limit = 50, branch = "main") {
  if (!remoteUrl) {
    if (process.env.VERCEL_GIT_REPO_URL) {
      remoteUrl = process.env.VERCEL_GIT_REPO_URL;
    } else {
      const repoOwner = process.env.CHRONALOG_REPO_OWNER || process.env.VERCEL_GIT_REPO_OWNER || process.env.OST_REPO_OWNER;
      const repoSlug = process.env.CHRONALOG_REPO_SLUG || process.env.VERCEL_GIT_REPO_SLUG || process.env.OST_REPO_SLUG;
      if (repoOwner && repoSlug) {
        remoteUrl = `https://github.com/${repoOwner}/${repoSlug}.git`;
      }
    }
  }
  if (!remoteUrl) {
    throw new Error("Git remote URL is required for GitHub API operations. Set VERCEL_GIT_REPO_URL, CHRONALOG_REPO_OWNER/CHRONALOG_REPO_SLUG, VERCEL_GIT_REPO_OWNER/VERCEL_GIT_REPO_SLUG, or OST_REPO_OWNER/OST_REPO_SLUG environment variables.");
  }
  const repoInfo = parseGitHubRepoFromUrl(remoteUrl);
  if (!repoInfo) {
    throw new Error("Could not parse GitHub repository from remote URL");
  }
  const client = createGitHubClient(accessToken);
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
  `;
  try {
    const data = await client.request(query, {
      owner: repoInfo.owner,
      name: repoInfo.name,
      branch,
      limit
    });
    if (!data.repository?.ref?.target) {
      return [];
    }
    const commits = data.repository.ref.target.history.edges.map((edge) => {
      const commit = edge.node;
      return {
        hash: commit.oid,
        shortHash: commit.oid.substring(0, 7),
        message: commit.messageHeadline,
        author: commit.author.name,
        date: commit.author.date
      };
    });
    return commits;
  } catch (error) {
    console.error("Error fetching commits via GitHub API:", error);
    return [];
  }
}

// src/index.ts
function chronalog() {
  return "Chronalog initialised";
}
export {
  autoCommitChangelog,
  checkCollaborator,
  checkRepository,
  chronalog,
  clearLoginSession,
  commitChanges,
  createCommit,
  createCommitApi,
  createGitHubClient,
  extractVersion,
  fetchGitHubUser,
  filterChangelogEntriesByTags,
  generateSlug,
  getAccessToken,
  getAllTags,
  getBranchOid,
  getDefaultConfig,
  getFileContent,
  getGitBranch,
  getGitCommitHistory,
  getGitCommitHistoryViaGitHub,
  getGitHubCommitUrl,
  getGitRemoteUrl,
  getLoginSession,
  incrementVersion,
  isGitInstalled,
  isGitRepository,
  isValidVersion,
  isWorkingDirectoryClean,
  listChangelogEntries,
  listChangelogEntriesViaGitHub,
  listFiles,
  listMediaFiles,
  loadChronalogConfig,
  normaliseTags,
  parseChangelogEntry,
  parseGitHubRepoFromUrl,
  readChangelogEntry,
  readChangelogEntryViaGitHub,
  readHomeUrlViaGitHub,
  readPredefinedTags,
  readPredefinedTagsViaGitHub,
  saveChangelogEntry,
  saveChangelogEntryViaGitHub,
  saveHomeUrl,
  saveHomeUrlViaGitHub,
  saveMediaFile,
  savePredefinedTags,
  savePredefinedTagsViaGitHub,
  serialiseChangelogEntry,
  setLoginSession,
  shouldUseGitHubAPI,
  stageFile
};
