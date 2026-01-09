/**
 * Increments a semantic version number
 * @param version Current version string (e.g., "1.2.3")
 * @param type Type of increment: "major", "minor", or "patch"
 * @returns New version string
 */
export function incrementVersion(
  version: string,
  type: "major" | "minor" | "patch"
): string {
  // Remove any leading 'v' if present
  const cleanVersion = version.replace(/^v/i, "")

  // Parse version string
  const parts = cleanVersion.split(".")
  const major = parseInt(parts[0] || "0", 10)
  const minor = parseInt(parts[1] || "0", 10)
  const patch = parseInt(parts[2] || "0", 10)

  // Increment based on type
  let newMajor = major
  let newMinor = minor
  let newPatch = patch

  switch (type) {
    case "major":
      newMajor = major + 1
      newMinor = 0
      newPatch = 0
      break
    case "minor":
      newMinor = minor + 1
      newPatch = 0
      break
    case "patch":
      newPatch = patch + 1
      break
  }

  return `${newMajor}.${newMinor}.${newPatch}`
}

/**
 * Validates if a string is a valid semantic version
 * @param version Version string to validate
 * @returns True if valid semantic version
 */
export function isValidVersion(version: string): boolean {
  // Remove leading 'v' if present
  const cleanVersion = version.replace(/^v/i, "")

  // Check if it matches semantic version pattern (major.minor.patch)
  const semverPattern = /^\d+\.\d+\.\d+$/
  return semverPattern.test(cleanVersion)
}

/**
 * Extracts version from a changelog entry
 * @param version Optional version string
 * @returns Version string or null
 */
export function extractVersion(version?: string): string | null {
  if (!version) return null

  // Remove leading 'v' if present and return
  return version.replace(/^v/i, "")
}
