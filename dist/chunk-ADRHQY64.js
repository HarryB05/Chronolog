var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// src/mdx.ts
function normaliseTags(tags) {
  if (!tags || tags.length === 0) {
    return [];
  }
  return tags.map((tag) => tag.trim().toLowerCase()).filter((tag) => tag.length > 0).filter((tag, index, array) => array.indexOf(tag) === index);
}
function serialiseChangelogEntry(entry) {
  let dateTime;
  if (entry.date) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) {
      const dateOnly = new Date(entry.date);
      const now = /* @__PURE__ */ new Date();
      dateOnly.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
      dateTime = dateOnly.toISOString();
    } else {
      dateTime = entry.date;
    }
  } else {
    dateTime = (/* @__PURE__ */ new Date()).toISOString();
  }
  const frontmatter = {
    title: entry.title,
    date: dateTime
  };
  if (entry.version) {
    frontmatter.version = entry.version;
  }
  if (entry.commitHash) {
    frontmatter.commitHash = entry.commitHash;
  }
  if (entry.slug) {
    frontmatter.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  }
  const tags = normaliseTags(entry.tags);
  if (tags.length > 0) {
    frontmatter.tags = tags;
  }
  if (entry.features && entry.features.length > 0) {
    frontmatter.features = entry.features.map((f) => f.trim()).filter((f) => f.length > 0);
  }
  if (entry.bugfixes && entry.bugfixes.length > 0) {
    frontmatter.bugfixes = entry.bugfixes.map((b) => b.trim()).filter((b) => b.length > 0);
  }
  const frontmatterLines = Object.entries(frontmatter).map(([key, value]) => {
    if (Array.isArray(value)) {
      return `${key}:
${value.map((v) => `  - ${JSON.stringify(v)}`).join("\n")}`;
    }
    if (typeof value === "string" && value.includes(":")) {
      return `${key}: ${JSON.stringify(value)}`;
    }
    return `${key}: ${value}`;
  });
  const frontmatterBlock = `---
${frontmatterLines.join("\n")}
---`;
  return `${frontmatterBlock}

${entry.body}`;
}
function parseChangelogEntry(content, filename) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  if (!match) {
    throw new Error(`Invalid MDX format: missing frontmatter in ${filename}`);
  }
  const frontmatterText = match[1];
  const body = match[2].trim();
  const frontmatter = parseYamlFrontmatter(frontmatterText);
  if (!frontmatter.title) {
    throw new Error(`Missing required field 'title' in ${filename}`);
  }
  if (!frontmatter.date) {
    throw new Error(`Missing required field 'date' in ${filename}`);
  }
  const slug = filename.replace(/\.mdx?$/, "");
  if (frontmatter.tags) {
    frontmatter.tags = normaliseTags(frontmatter.tags);
  }
  return {
    ...frontmatter,
    body,
    slug,
    filename
  };
}
function parseYamlFrontmatter(yaml) {
  const result = {};
  const lines = yaml.split("\n");
  let currentKey = null;
  let currentValue = [];
  let inArray = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("- ")) {
      if (currentKey && inArray) {
        const value2 = trimmed.slice(2).trim();
        const unquoted = value2.replace(/^["']|["']$/g, "");
        currentValue.push(unquoted);
      }
      continue;
    }
    if (currentKey && inArray && currentValue.length > 0) {
      result[currentKey] = currentValue;
      currentValue = [];
      inArray = false;
    }
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex === -1) continue;
    currentKey = trimmed.slice(0, colonIndex).trim();
    let value = trimmed.slice(colonIndex + 1).trim();
    if (value === "" || value === "[]") {
      inArray = true;
      currentValue = [];
      continue;
    }
    if (value.startsWith('"') && value.endsWith('"') || value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }
    if (value === "true") {
      result[currentKey] = true;
    } else if (value === "false") {
      result[currentKey] = false;
    } else if (value === "null") {
      result[currentKey] = null;
    } else if (/^-?\d+$/.test(value)) {
      result[currentKey] = parseInt(value, 10);
    } else if (/^-?\d+\.\d+$/.test(value)) {
      result[currentKey] = parseFloat(value);
    } else {
      result[currentKey] = value;
    }
  }
  if (currentKey && inArray && currentValue.length > 0) {
    result[currentKey] = currentValue;
  }
  return result;
}
function generateSlug(title, providedSlug) {
  if (providedSlug) {
    return providedSlug;
  }
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// src/version.ts
function incrementVersion(version, type) {
  const cleanVersion = version.replace(/^v/i, "");
  const parts = cleanVersion.split(".");
  const major = parseInt(parts[0] || "0", 10);
  const minor = parseInt(parts[1] || "0", 10);
  const patch = parseInt(parts[2] || "0", 10);
  let newMajor = major;
  let newMinor = minor;
  let newPatch = patch;
  switch (type) {
    case "major":
      newMajor = major + 1;
      newMinor = 0;
      newPatch = 0;
      break;
    case "minor":
      newMinor = minor + 1;
      newPatch = 0;
      break;
    case "patch":
      newPatch = patch + 1;
      break;
  }
  return `${newMajor}.${newMinor}.${newPatch}`;
}
function isValidVersion(version) {
  const cleanVersion = version.replace(/^v/i, "");
  const semverPattern = /^\d+\.\d+\.\d+$/;
  return semverPattern.test(cleanVersion);
}
function extractVersion(version) {
  if (!version) return null;
  return version.replace(/^v/i, "");
}

export {
  __require,
  normaliseTags,
  serialiseChangelogEntry,
  parseChangelogEntry,
  generateSlug,
  incrementVersion,
  isValidVersion,
  extractVersion
};
