#!/usr/bin/env node

/**
 * Initialize chronalog/config.json
 * This script can be run as a postinstall hook to ensure the config file exists
 */

import fs from "fs"
import path from "path"

const cwd = process.cwd()
const chronalogDir = path.join(cwd, "chronalog")
const chronalogChangelogDir = path.join(chronalogDir, "changelog")
const chronalogConfigPath = path.join(chronalogDir, "config.json")

// Only run if we're in a Next.js project (has app directory)
const appDir = path.join(cwd, "app")
if (!fs.existsSync(appDir)) {
  // Not a Next.js project, skip initialization
  process.exit(0)
}

// Create chronalog directory if it doesn't exist
if (!fs.existsSync(chronalogDir)) {
  fs.mkdirSync(chronalogDir, { recursive: true })
  console.log("✓ Created /chronalog directory")
}

// Create changelog subdirectory
if (!fs.existsSync(chronalogChangelogDir)) {
  fs.mkdirSync(chronalogChangelogDir, { recursive: true })
  console.log("✓ Created /chronalog/changelog directory")
}

// Create config.json if it doesn't exist
if (!fs.existsSync(chronalogConfigPath)) {
  const chronalogConfigContent = {
    tags: []
  }
  fs.writeFileSync(chronalogConfigPath, JSON.stringify(chronalogConfigContent, null, 2), "utf-8")
  console.log("✓ Created /chronalog/config.json")
}
