"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import { ChevronDown, ChevronUp, Edit, CheckCircle2, X } from "lucide-react"
import { Editor } from "./components/Editor"
import { AdminLayout } from "./components/Layout"
import { CommitCombobox } from "./components/ui/commit-combobox"
import { incrementVersion, isValidVersion } from "../client"
import type { ParsedChangelogEntry } from "../client"

interface SaveResponse {
  success: boolean
  message: string
  path: string
  error?: string
  gitCommit?: {
    success: boolean
    error?: string
  }
}

export default function ChangelogAdminPage() {
  const [title, setTitle] = useState("")
  const [version, setVersion] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [features, setFeatures] = useState<string[]>([])
  const [featureInput, setFeatureInput] = useState("")
  const [editingFeature, setEditingFeature] = useState<number | null>(null)
  const [editingFeatureValue, setEditingFeatureValue] = useState("")
  const [bugfixes, setBugfixes] = useState<string[]>([])
  const [bugfixInput, setBugfixInput] = useState("")
  const [editingBugfix, setEditingBugfix] = useState<number | null>(null)
  const [editingBugfixValue, setEditingBugfixValue] = useState("")
  const [body, setBody] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [latestEntry, setLatestEntry] = useState<ParsedChangelogEntry | null>(null)
  const [allEntries, setAllEntries] = useState<ParsedChangelogEntry[]>([])
  const [showVersionIncrement, setShowVersionIncrement] = useState(false)
  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })
  const [repoInfo, setRepoInfo] = useState<{ owner: string; name: string } | null>(null)
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set())
  const [selectedMajorVersion, setSelectedMajorVersion] = useState<string | null>(null)
  const [selectedMinorVersion, setSelectedMinorVersion] = useState<string | null>(null)
  const [predefinedTags, setPredefinedTags] = useState<string[]>([])
  const [commits, setCommits] = useState<Array<{ hash: string; shortHash: string; message: string; author: string; date: string }>>([])
  const [selectedCommitHash, setSelectedCommitHash] = useState<string>("")
  const [isLoadingCommits, setIsLoadingCommits] = useState(false)
  const [editingSlug, setEditingSlug] = useState<string | null>(null)

  // Fetch latest entry and all entries on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [latestResponse, listResponse, settingsResponse] = await Promise.all([
          fetch("/api/changelog/latest"),
          fetch("/api/changelog/list"),
          fetch("/api/changelog/settings"),
        ])

        const latestData = await latestResponse.json()
        const listData = await listResponse.json()
        const settingsData = await settingsResponse.json()

        if (latestData.success && latestData.entry) {
          setLatestEntry(latestData.entry)
        }

        if (listData.success && listData.entries) {
          setAllEntries(listData.entries)
        }

        // Parse repository info from remote URL
        if (settingsData.success && settingsData.info?.remoteUrl) {
          const remoteUrl = settingsData.info.remoteUrl
          const match = remoteUrl.match(/(?:github\.com[/:]|git@github\.com:)([^/]+)\/([^/]+?)(?:\.git)?$/)
          if (match) {
            setRepoInfo({
              owner: match[1],
              name: match[2].replace('.git', '')
            })
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      }
    }
    fetchData()
  }, [])

  // Auto-dismiss save status after 3 seconds
  useEffect(() => {
    if (saveStatus.type === "success") {
      const timer = setTimeout(() => {
        setSaveStatus({ type: null, message: "" })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [saveStatus.type])

  const handleVersionIncrement = (type: "major" | "minor" | "patch") => {
    if (latestEntry?.version && isValidVersion(latestEntry.version)) {
      const newVersion = incrementVersion(latestEntry.version, type)
      setVersion(newVersion)
      setShowVersionIncrement(false)
    }
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const trimmedTag = tagInput.trim()
      if (trimmedTag && !tags.includes(trimmedTag.toLowerCase())) {
        setTags([...tags, trimmedTag.toLowerCase()])
        setTagInput("")
      }
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  // Fetch predefined tags on mount
  useEffect(() => {
    async function fetchTags() {
      try {
        const response = await fetch("/api/changelog/tags")
        const data = await response.json()
        if (data.success) {
          setPredefinedTags(data.tags || [])
        }
      } catch (error) {
        console.error("Failed to fetch predefined tags:", error)
      }
    }
    fetchTags()
  }, [])

  // Fetch git commits on mount
  useEffect(() => {
    async function fetchCommits() {
      setIsLoadingCommits(true)
      try {
        const response = await fetch("/api/changelog/commits")
        const data = await response.json()
        if (data.success && data.commits) {
          setCommits(data.commits)
        }
      } catch (error) {
        console.error("Failed to fetch git commits:", error)
      } finally {
        setIsLoadingCommits(false)
      }
    }
    fetchCommits()
  }, [])

  const handleSelectPredefinedTag = (tag: string) => {
    if (!tags.includes(tag.toLowerCase())) {
      setTags([...tags, tag.toLowerCase()])
    }
  }

  const handleFeatureKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const trimmedFeature = featureInput.trim()
      if (trimmedFeature) {
        setFeatures([...features, trimmedFeature])
        setFeatureInput("")
      }
    }
  }

  const removeFeature = (indexToRemove: number) => {
    setFeatures(features.filter((_, index) => index !== indexToRemove))
  }

  const startEditingFeature = (index: number, value: string) => {
    setEditingFeature(index)
    setEditingFeatureValue(value)
  }

  const saveFeatureEdit = (index: number) => {
    if (editingFeatureValue.trim()) {
      const newFeatures = [...features]
      newFeatures[index] = editingFeatureValue.trim()
      setFeatures(newFeatures)
    }
    setEditingFeature(null)
    setEditingFeatureValue("")
  }

  const cancelFeatureEdit = () => {
    setEditingFeature(null)
    setEditingFeatureValue("")
  }

  const handleBugfixKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const trimmedBugfix = bugfixInput.trim()
      if (trimmedBugfix) {
        setBugfixes([...bugfixes, trimmedBugfix])
        setBugfixInput("")
      }
    }
  }

  const removeBugfix = (indexToRemove: number) => {
    setBugfixes(bugfixes.filter((_, index) => index !== indexToRemove))
  }

  const startEditingBugfix = (index: number, value: string) => {
    setEditingBugfix(index)
    setEditingBugfixValue(value)
  }

  const saveBugfixEdit = (index: number) => {
    if (editingBugfixValue.trim()) {
      const newBugfixes = [...bugfixes]
      newBugfixes[index] = editingBugfixValue.trim()
      setBugfixes(newBugfixes)
    }
    setEditingBugfix(null)
    setEditingBugfixValue("")
  }

  const cancelBugfixEdit = () => {
    setEditingBugfix(null)
    setEditingBugfixValue("")
  }

  const loadEntryForEditing = (entry: ParsedChangelogEntry) => {
    setEditingSlug(entry.slug)
    setTitle(entry.title)
    setVersion(entry.version || "")
    // Extract date part from ISO string
    const dateStr = entry.date ? new Date(entry.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
    setDate(dateStr)
    setTags(entry.tags || [])
    setTagInput("")
    setFeatures(entry.features || [])
    setFeatureInput("")
    setBugfixes(entry.bugfixes || [])
    setBugfixInput("")
    setBody(entry.body || "")
    setSelectedCommitHash(entry.commitHash || "")
    setShowVersionIncrement(false)
    setSaveStatus({ type: null, message: "" })
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const cancelEditing = () => {
    setEditingSlug(null)
    setTitle("")
    setVersion("")
    setDate(new Date().toISOString().split("T")[0])
    setTags([])
    setTagInput("")
    setFeatures([])
    setFeatureInput("")
    setBugfixes([])
    setBugfixInput("")
    setBody("")
    setSelectedCommitHash("")
    setShowVersionIncrement(false)
    setSaveStatus({ type: null, message: "" })
  }

  const refreshEntries = async () => {
    try {
      const [latestResponse, listResponse] = await Promise.all([
        fetch("/api/changelog/latest"),
        fetch("/api/changelog/list"),
      ])

      const latestData = await latestResponse.json()
      const listData = await listResponse.json()

      if (latestData.success && latestData.entry) {
        setLatestEntry(latestData.entry)
      }

      if (listData.success && listData.entries) {
        setAllEntries(listData.entries)
      }
    } catch (error) {
      console.error("Failed to refresh entries:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveStatus({ type: null, message: "" })

    try {
      const response = await fetch("/api/changelog/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          version: version.trim(),
          date: date || undefined,
          tags: tags.length > 0 ? tags : undefined,
          features: features.length > 0 ? features : undefined,
          bugfixes: bugfixes.length > 0 ? bugfixes : undefined,
          body,
            commitHash: selectedCommitHash || undefined,
            slug: editingSlug || undefined,
        }),
      })

      const data: SaveResponse = await response.json()

      if (data.success) {
        setSaveStatus({
          type: "success",
          message: data.message,
        })

        // Show Git commit status if available
        const gitCommit = data.gitCommit
        if (gitCommit) {
          if (gitCommit.success) {
            setSaveStatus((prev) => ({
              ...prev,
              message: `${prev.message} (committed to Git)`,
            }))
          } else if (gitCommit.error) {
            setSaveStatus((prev) => ({
              ...prev,
              message: `${prev.message} (Git commit failed: ${gitCommit.error})`,
            }))
          }
        }

        // Reset form after successful save (notification will auto-dismiss)
        setTimeout(() => {
          setEditingSlug(null)
          setTitle("")
          setVersion("")
          setDate(new Date().toISOString().split("T")[0])
          setTags([])
          setTagInput("")
          setFeatures([])
          setFeatureInput("")
          setBugfixes([])
          setBugfixInput("")
          setBody("")
          setSelectedCommitHash("")
          setShowVersionIncrement(false)
          setSaveStatus({ type: null, message: "" })
          // Refresh entries
          refreshEntries()
        }, 3000)
      } else {
        setSaveStatus({
          type: "error",
          message: data.error || "Failed to save changelog entry",
        })
      }
    } catch (error) {
      setSaveStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to save changelog entry",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Get unique major versions from entries (only show x.0.0 versions)
  const uniqueVersions = useMemo(() => {
    const allVersions = allEntries
      .map((entry: ParsedChangelogEntry) => entry.version)
      .filter((v): v is string => !!v)
    
    // Extract unique major versions (e.g., "1", "2", "3")
    const majorVersions = new Set<string>()
    allVersions.forEach((version: string) => {
      const major = version.split(".")[0]
      majorVersions.add(major)
    })
    
    // Convert to major.0.0 format and sort
    const versions = Array.from(majorVersions)
      .map((major: string) => `${major}.0.0`)
      .sort((a: string, b: string) => {
        // Sort versions semantically (e.g., 2.0.0 > 1.0.0)
        const aParts = a.split(".").map(Number)
        const bParts = b.split(".").map(Number)
        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
          const aPart = aParts[i] || 0
          const bPart = bParts[i] || 0
          if (aPart !== bPart) return bPart - aPart
        }
        return 0
      })
    return versions
  }, [allEntries])

  // Get minor versions for selected major version (only x.y.0, not patch versions)
  const minorVersions = useMemo(() => {
    if (!selectedMajorVersion) return []
    
    const majorVersion = selectedMajorVersion.split(".")[0]
    const allVersions = allEntries
      .map((entry: ParsedChangelogEntry) => entry.version)
      .filter((v): v is string => !!v)
      .filter((v: string) => {
        const entryMajor = v.split(".")[0]
        return entryMajor === majorVersion
      })
      // Only include minor versions (x.y.0 format, patch must be 0)
      .filter((v: string) => {
        const parts = v.split(".").map(Number)
        return parts.length >= 3 && parts[2] === 0
      })
      .filter((v: string, index: number, self: string[]) => self.indexOf(v) === index)
      .sort((a: string, b: string) => {
        // Sort versions semantically
        const aParts = a.split(".").map(Number)
        const bParts = b.split(".").map(Number)
        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
          const aPart = aParts[i] || 0
          const bPart = bParts[i] || 0
          if (aPart !== bPart) return bPart - aPart
        }
        return 0
      })
    return allVersions
  }, [allEntries, selectedMajorVersion])

  // Filter entries based on selected version
  const filteredEntries = useMemo(() => {
    if (!selectedMajorVersion) return allEntries
    
    const majorVersion = selectedMajorVersion.split(".")[0]
    
    let filtered = allEntries.filter((entry: ParsedChangelogEntry) => {
      if (!entry.version) return false
      const entryMajor = entry.version.split(".")[0]
      return entryMajor === majorVersion
    })
    
    // If minor version is selected, filter to show all patch versions within that minor version
    if (selectedMinorVersion) {
      const minorVersionParts = selectedMinorVersion.split(".")
      if (minorVersionParts.length >= 2) {
        const majorMinorPrefix = `${minorVersionParts[0]}.${minorVersionParts[1]}.`
        filtered = filtered.filter((entry: ParsedChangelogEntry) => {
          return entry.version?.startsWith(majorMinorPrefix)
        })
      }
    }
    
    return filtered
  }, [allEntries, selectedMajorVersion, selectedMinorVersion])

  const toggleExpand = (slug: string) => {
    setExpandedEntries((prev: Set<string>) => {
      const newSet = new Set(prev)
      if (newSet.has(slug)) {
        newSet.delete(slug)
      } else {
        newSet.add(slug)
      }
      return newSet
    })
  }

  // Calculate if content should be truncated (rough estimate: ~500 characters)
  const shouldTruncate = (entry: ParsedChangelogEntry) => {
    const contentLength = 
      entry.title.length +
      (entry.body?.length || 0) +
      (entry.features?.join(" ").length || 0) +
      (entry.bugfixes?.join(" ").length || 0)
    return contentLength > 500
  }

  // Find the entry being edited
  const editingEntry = editingSlug 
    ? allEntries.find((entry: ParsedChangelogEntry) => entry.slug === editingSlug)
    : null

  return (
    <AdminLayout>
      {/* Success Notification */}
      {saveStatus.type === "success" && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-top-5 fade-in-0">
          <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-white px-4 py-3 shadow-lg dark:border-green-800 dark:bg-zinc-900">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {saveStatus.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSaveStatus({ type: null, message: "" })}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {saveStatus.type === "error" && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-top-5 fade-in-0">
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-white px-4 py-3 shadow-lg dark:border-red-800 dark:bg-zinc-900">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <X className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {saveStatus.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSaveStatus({ type: null, message: "" })}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
          {/* Left: Create/Edit Form */}
          <div className="space-y-6">
            {/* Form Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {editingSlug && editingEntry 
                  ? `Edit: ${editingEntry.title}` 
                  : "Create Changelog Entry"}
              </h2>
              {editingSlug && (
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
              )}
            </div>
            {editingSlug && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  You are editing an existing changelog entry. Changes will update the existing entry.
                </p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50"
                >
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                  placeholder="e.g., New Feature: Authentication System"
                />
              </div>

              {/* Version and Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="version"
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
                >
                  Version <span className="text-red-500">*</span>
                </label>
                    {latestEntry?.version && !editingSlug && (
                      <button
                        type="button"
                        onClick={() => setShowVersionIncrement(!showVersionIncrement)}
                        className="text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                      >
                        {showVersionIncrement ? "Cancel" : "Increment from " + latestEntry.version}
                      </button>
                    )}
                  </div>
                  {showVersionIncrement && latestEntry?.version && !editingSlug && (
                    <div className="mb-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleVersionIncrement("major")}
                        className="flex-1 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                      >
                        Major
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVersionIncrement("minor")}
                        className="flex-1 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                      >
                        Minor
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVersionIncrement("patch")}
                        className="flex-1 rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-xs font-medium text-green-700 transition-colors hover:bg-green-100 dark:border-green-700 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
                      >
                        Patch
                      </button>
                    </div>
                  )}
                  <input
                    type="text"
                    id="version"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    disabled={!!editingSlug}
                    className={`w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 ${
                      editingSlug ? "cursor-not-allowed opacity-60" : ""
                    }`}
                    placeholder="e.g., 1.0.0"
                  />
                  {editingSlug && (
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      Version cannot be changed when editing
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="date"
                    className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50"
                  >
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    disabled={!!editingSlug}
                    className={`w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 ${
                      editingSlug ? "cursor-not-allowed opacity-60" : ""
                    }`}
                  />
                  {editingSlug && (
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      Date cannot be changed when editing
                    </p>
                  )}
                </div>
        </div>

              {/* Tags */}
              <div>
                <label
                  htmlFor="tags"
                  className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50"
                >
                  Tags
                </label>
                
                {/* Predefined Tags (if available) */}
                {predefinedTags.length > 0 && (
                  <div className="mb-3">
                    <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
                      Predefined tags:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {predefinedTags.map((tag: string) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleSelectPredefinedTag(tag)}
                          disabled={tags.includes(tag.toLowerCase())}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                            tags.includes(tag.toLowerCase())
                              ? "cursor-not-allowed bg-zinc-300 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-500"
                              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                          }`}
                        >
                          {tag}
                          {tags.includes(tag.toLowerCase()) && (
                            <span className="ml-1">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected Tags and Input */}
                <div className="flex flex-wrap gap-2 rounded-lg border border-zinc-300 bg-white p-2 focus-within:border-zinc-500 focus-within:ring-2 focus-within:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-1 rounded-full bg-zinc-200 px-3 py-1 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-700"
                        aria-label={`Remove ${tag} tag`}
                      >
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    className="flex-1 border-0 bg-transparent px-2 py-1 text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-50 dark:placeholder:text-zinc-600"
                    placeholder={tags.length === 0 ? "Type a tag and press Enter" : "Add another tag"}
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {predefinedTags.length > 0 
                    ? "Click predefined tags above or type a new tag and press Enter"
                    : "Type a tag and press Enter to add it"}
                </p>
              </div>

              {/* Features */}
              <div>
                <label
                  htmlFor="features"
                  className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50"
                >
                  Features
                </label>
                <div className="space-y-2">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="group rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800"
                    >
                      {editingFeature === index ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingFeatureValue}
                            onChange={(e) => setEditingFeatureValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                saveFeatureEdit(index)
                              } else if (e.key === "Escape") {
                                cancelFeatureEdit()
                              }
                            }}
                            onBlur={() => saveFeatureEdit(index)}
                            className="flex-1 rounded border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => saveFeatureEdit(index)}
                            className="rounded p-1 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                            aria-label="Save"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={cancelFeatureEdit}
                            className="rounded p-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                            aria-label="Cancel"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span
                            className="flex-1 cursor-pointer text-sm text-zinc-900 dark:text-zinc-50"
                            onClick={() => startEditingFeature(index, feature)}
                          >
                            {feature}
                          </span>
                          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => startEditingFeature(index, feature)}
                              className="rounded p-1 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
                              aria-label="Edit"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => removeFeature(index)}
                              className="rounded p-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                              aria-label="Remove"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <input
                    type="text"
                    id="features"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={handleFeatureKeyDown}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                    placeholder={features.length === 0 ? "Type a feature and press Enter" : "Add another feature"}
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Type a feature and press Enter to add it
                </p>
              </div>

              {/* Bug Fixes */}
              <div>
                <label
                  htmlFor="bugfixes"
                  className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50"
                >
                  Bug Fixes
                </label>
                <div className="space-y-2">
                  {bugfixes.map((bugfix, index) => (
                    <div
                      key={index}
                      className="group rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800"
                    >
                      {editingBugfix === index ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingBugfixValue}
                            onChange={(e) => setEditingBugfixValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                saveBugfixEdit(index)
                              } else if (e.key === "Escape") {
                                cancelBugfixEdit()
                              }
                            }}
                            onBlur={() => saveBugfixEdit(index)}
                            className="flex-1 rounded border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => saveBugfixEdit(index)}
                            className="rounded p-1 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                            aria-label="Save"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={cancelBugfixEdit}
                            className="rounded p-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                            aria-label="Cancel"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span
                            className="flex-1 cursor-pointer text-sm text-zinc-900 dark:text-zinc-50"
                            onClick={() => startEditingBugfix(index, bugfix)}
                          >
                            {bugfix}
                          </span>
                          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => startEditingBugfix(index, bugfix)}
                              className="rounded p-1 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
                              aria-label="Edit"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => removeBugfix(index)}
                              className="rounded p-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                              aria-label="Remove"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <input
                    type="text"
                    id="bugfixes"
                    value={bugfixInput}
                    onChange={(e) => setBugfixInput(e.target.value)}
                    onKeyDown={handleBugfixKeyDown}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                    placeholder={bugfixes.length === 0 ? "Type a bug fix and press Enter" : "Add another bug fix"}
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Type a bug fix and press Enter to add it
                </p>
              </div>

              {/* Commit Selection */}
              <div>
                <label
                  htmlFor="commit"
                  className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50"
                >
                  Link to Commit
                </label>
                <CommitCombobox
                  commits={commits}
                  value={selectedCommitHash}
                  onValueChange={setSelectedCommitHash}
                  isLoading={isLoadingCommits}
                />
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Select a commit to link this changelog entry to a specific commit in your repository
                </p>
              </div>

              {/* Body Editor */}
              <div>
                <label
                  htmlFor="body"
                  className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50"
                >
                  Body <span className="text-red-500">*</span>
                </label>
                <Editor content={body} onChange={setBody} />
              </div>


              {/* Submit Button */}
              <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving || !title || !body || !version}
                className="rounded-lg bg-black px-6 py-2 text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                {isSaving ? (editingSlug ? "Updating..." : "Saving...") : (editingSlug ? "Update Changelog Entry" : "Save Changelog Entry")}
              </button>
              </div>
            </form>
          </div>

          {/* Right: Timeline */}
          <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto scrollbar-hide">
            {/* Version Selector - Sticky */}
            {uniqueVersions.length > 0 && (
              <div className="sticky top-0 z-20 mb-6 space-y-4 bg-zinc-50/95 backdrop-blur-sm pb-6 pt-4 shadow-sm dark:bg-black/95">
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    Filter by Major Version
                  </h3>
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                    <button
                      onClick={() => {
                        setSelectedMajorVersion(null)
                        setSelectedMinorVersion(null)
                      }}
                      className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                        selectedMajorVersion === null
                          ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300"
                          : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      }`}
                    >
                      All Versions
                    </button>
                    {uniqueVersions.map((version: string) => {
                      return (
                        <button
                          key={version}
                          onClick={() => {
                            setSelectedMajorVersion(version)
                            setSelectedMinorVersion(null)
                          }}
                          className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                            selectedMajorVersion === version
                              ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300"
                              : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                          }`}
                        >
                          v{version}
                        </button>
                      )
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
                        className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                          selectedMinorVersion === null
                            ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300"
                            : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        }`}
                      >
                        All {selectedMajorVersion.split(".")[0]}.x.x
                      </button>
                      {minorVersions.map((version: string) => {
                        return (
                          <button
                            key={version}
                            onClick={() => setSelectedMinorVersion(version)}
                            className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                              selectedMinorVersion === version
                                ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300"
                                : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                            }`}
                          >
                            v{version}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-8 pt-4">
              {filteredEntries.length === 0 ? (
                <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    No changelog entries yet. Create your first entry!
                  </p>
                </div>
              ) : (
                filteredEntries.map((entry: ParsedChangelogEntry, index: number) => {
                  // Check if this is the latest entry overall (compare with first entry in allEntries)
                  const isLatest = allEntries.length > 0 && entry.slug === allEntries[0].slug
                  const isExpanded = expandedEntries.has(entry.slug)
                  const needsTruncation = shouldTruncate(entry)
                  const showTruncated = needsTruncation && !isExpanded
                  
                  return (
                    <div key={entry.slug} className="relative">
                      {/* Timeline line */}
                      {index < filteredEntries.length - 1 && (
                        <div className="absolute left-[15px] top-8 h-full w-0.5 bg-zinc-200 dark:bg-zinc-800" />
                      )}

                      <div className="relative flex gap-4">
                        {/* Date circle */}
                        <div className={`relative z-0 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${isLatest ? "border-blue-500 bg-blue-100 dark:border-blue-400 dark:bg-blue-900/30" : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"}`}>
                          <div className={`h-2 w-2 rounded-full ${isLatest ? "bg-blue-600 dark:bg-blue-400" : "bg-zinc-400 dark:bg-zinc-600"}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-2 pb-8">
                          <div className={showTruncated ? "max-h-96 overflow-hidden" : ""}>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                              {formatDate(entry.date)}
                            </span>
                            {entry.updatedAt && (
                              <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                                Updated {formatDate(entry.updatedAt)}
                              </span>
                            )}
                            {entry.version && (
                              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${isLatest ? "bg-blue-200 text-blue-900 dark:bg-blue-900/50 dark:text-blue-200" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"}`}>
                                {entry.version}
                              </span>
                            )}
                            {entry.commitHash && repoInfo && (
                              <a
                                href={`https://github.com/${repoInfo.owner}/${repoInfo.name}/commit/${entry.commitHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-medium text-blue-600 hover:text-blue-700 underline dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                View Commit ({entry.commitHash.substring(0, 7)})
                              </a>
                            )}
                          </div>

                          <div className="flex items-start justify-between gap-4">
                            <h3 className={`flex-1 text-lg font-semibold ${isLatest ? "text-blue-900 dark:text-blue-100" : "text-zinc-900 dark:text-zinc-50"}`}>
                            {entry.title}
                          </h3>
                            <button
                              type="button"
                              onClick={() => loadEntryForEditing(entry)}
                              disabled={editingSlug === entry.slug}
                              className={`flex shrink-0 items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                                editingSlug === entry.slug
                                  ? "cursor-not-allowed border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                  : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                              }`}
                              title={editingSlug === entry.slug ? "Currently editing this entry" : "Edit this entry"}
                            >
                              {editingSlug === entry.slug ? (
                                <>
                                  <Edit className="h-3 w-3" />
                                  <span>Editing</span>
                                  <span className="inline-flex">
                                    <span className="animate-ellipsis">.</span>
                                    <span className="animate-ellipsis-delay-1">.</span>
                                    <span className="animate-ellipsis-delay-2">.</span>
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Edit className="h-3 w-3" />
                                  Edit
                                </>
                              )}
                            </button>
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
                                  <span className="text-2xl leading-none text-green-600 dark:text-green-400">•</span>
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
                                  <span className="text-2xl leading-none text-red-600 dark:text-red-400">•</span>
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
                                  let imageSrc = typeof props.src === "string" ? props.src : ""
                                  if (imageSrc.startsWith("chronalog/")) {
                                    imageSrc = `/${imageSrc}`
                                  } else if (!imageSrc.startsWith("/") && !imageSrc.startsWith("http")) {
                                    imageSrc = `/${imageSrc}`
                                  }
                                  return (
                                    <img
                                      {...props}
                                      src={imageSrc}
                                      alt={props.alt || ""}
                                      className="my-4 max-w-full rounded-lg border border-zinc-200 dark:border-zinc-800"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement
                                        target.style.display = "none"
                                      }}
                                    />
                                  )
                                },
                              }}
                            >
                              {entry.body}
                            </ReactMarkdown>
                          </div>
                        )}
                          </div>
                          
                          {/* Expand/Collapse Button */}
                          {needsTruncation && (
                            <button
                              onClick={() => toggleExpand(entry.slug)}
                              className="mt-2 flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="h-3 w-3" />
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-3 w-3" />
                                  Show More
                                </>
                              )}
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
