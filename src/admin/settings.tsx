"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GitBranch, CheckCircle2, X } from "lucide-react"
import { AdminLayout } from "./components/Layout"

interface RepositoryInfo {
  remoteUrl: string | null
  branch: string | null
  isGitRepository: boolean
  isGitInstalled: boolean
  changelogDir: string
  envVars?: {
    configured: boolean
    CHRONALOG_GITHUB_ID: boolean
    CHRONALOG_GITHUB_SECRET: boolean
  }
}

export default function SettingsPage() {
  const [repoInfo, setRepoInfo] = useState<RepositoryInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [predefinedTags, setPredefinedTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [savingTags, setSavingTags] = useState(false)
  const [tagsStatus, setTagsStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })
  const [homeUrl, setHomeUrl] = useState("/")
  const [savingHomeUrl, setSavingHomeUrl] = useState(false)
  const [homeUrlStatus, setHomeUrlStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })

  useEffect(() => {
    async function fetchRepoInfo() {
      try {
        const response = await fetch("/api/changelog/settings")
        const data = await response.json()
        if (data.success) {
          setRepoInfo(data.info)
        }
      } catch (error) {
        console.error("Failed to fetch repository info:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchRepoInfo()
  }, [])

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

  useEffect(() => {
    async function fetchHomeUrl() {
      try {
        const response = await fetch("/api/changelog/home-url")
        const data = await response.json()
        if (data.success && data.homeUrl) {
          setHomeUrl(data.homeUrl)
        }
      } catch (error) {
        console.error("Failed to fetch home URL:", error)
      }
    }
    fetchHomeUrl()
  }, [])

  // Auto-dismiss tags status after 3 seconds
  useEffect(() => {
    if (tagsStatus.type === "success") {
      const timer = setTimeout(() => {
        setTagsStatus({ type: null, message: "" })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [tagsStatus.type])

  // Auto-dismiss home URL status after 3 seconds
  useEffect(() => {
    if (homeUrlStatus.type === "success") {
      const timer = setTimeout(() => {
        setHomeUrlStatus({ type: null, message: "" })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [homeUrlStatus.type])

  const handleAddTag = async () => {
    const trimmedTag = newTag.trim().toLowerCase()
    if (trimmedTag && !predefinedTags.includes(trimmedTag)) {
      const updatedTags = [...predefinedTags, trimmedTag].sort()
      setPredefinedTags(updatedTags)
      setNewTag("")
      
      // Auto-save when adding a tag
      setSavingTags(true)
      setTagsStatus({ type: null, message: "" })

      try {
        const response = await fetch("/api/changelog/tags", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tags: updatedTags }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || `HTTP error! status: ${response.status}`)
        }

        if (!data.success) {
          throw new Error(data.error || "Failed to save tag")
        }
      } catch (error) {
        console.error("[Settings] Error saving tag:", error)
        setTagsStatus({
          type: "error",
          message: error instanceof Error ? error.message : "Failed to save tag",
        })
        // Revert the tag addition on error
        setPredefinedTags(predefinedTags)
      } finally {
        setSavingTags(false)
      }
    }
  }

  const handleRemoveTag = async (tagToRemove: string) => {
    const updatedTags = predefinedTags.filter((tag: string) => tag !== tagToRemove)
    setPredefinedTags(updatedTags)
    
    // Auto-save when removing a tag
    setSavingTags(true)
    setTagsStatus({ type: null, message: "" })

    try {
      const response = await fetch("/api/changelog/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tags: updatedTags }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to save tags")
      }
    } catch (error) {
      console.error("[Settings] Error saving tags:", error)
      setTagsStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to save tags",
      })
      // Revert the tag removal on error
      setPredefinedTags(predefinedTags)
    } finally {
      setSavingTags(false)
    }
  }

  const handleSaveTags = async () => {
    setSavingTags(true)
    setTagsStatus({ type: null, message: "" })

    console.log("[Settings] Saving tags:", predefinedTags)

    try {
      const response = await fetch("/api/changelog/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tags: predefinedTags }),
      })

      console.log("[Settings] Response status:", response.status)
      console.log("[Settings] Response ok:", response.ok)

      const data = await response.json()
      console.log("[Settings] Response data:", data)

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (data.success) {
        setTagsStatus({
          type: "success",
          message: "Tags saved successfully",
        })
      } else {
        setTagsStatus({
          type: "error",
          message: data.error || "Failed to save tags",
        })
      }
    } catch (error) {
      console.error("[Settings] Error saving tags:", error)
      setTagsStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to save tags",
      })
    } finally {
      setSavingTags(false)
    }
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleSaveHomeUrl = async () => {
    setSavingHomeUrl(true)
    setHomeUrlStatus({ type: null, message: "" })

    try {
      const response = await fetch("/api/changelog/home-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ homeUrl }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (data.success) {
        setHomeUrlStatus({
          type: "success",
          message: "Home URL saved successfully",
        })
      } else {
        setHomeUrlStatus({
          type: "error",
          message: data.error || "Failed to save home URL",
        })
      }
    } catch (error) {
      console.error("[Settings] Error saving home URL:", error)
      setHomeUrlStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to save home URL",
      })
    } finally {
      setSavingHomeUrl(false)
    }
  }

  const formatRemoteUrl = (url: string | null): string => {
    if (!url) return "Not configured"
    
    // Convert SSH URLs to HTTPS for display
    const httpsUrl = url
      .replace(/git@github\.com:/, "https://github.com/")
      .replace(/git@gitlab\.com:/, "https://gitlab.com/")
      .replace(/\.git$/, "")
    
    return httpsUrl
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      {/* Success Notification for Tags */}
      {tagsStatus.type === "success" && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-top-5 fade-in-0">
          <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-white px-4 py-3 shadow-lg dark:border-green-800 dark:bg-zinc-900">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {tagsStatus.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTagsStatus({ type: null, message: "" })}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Error Notification for Tags */}
      {tagsStatus.type === "error" && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-top-5 fade-in-0">
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-white px-4 py-3 shadow-lg dark:border-red-800 dark:bg-zinc-900">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <X className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {tagsStatus.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTagsStatus({ type: null, message: "" })}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Success Notification for Home URL */}
      {homeUrlStatus.type === "success" && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-top-5 fade-in-0">
          <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-white px-4 py-3 shadow-lg dark:border-green-800 dark:bg-zinc-900">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {homeUrlStatus.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setHomeUrlStatus({ type: null, message: "" })}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Error Notification for Home URL */}
      {homeUrlStatus.type === "error" && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-top-5 fade-in-0">
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-white px-4 py-3 shadow-lg dark:border-red-800 dark:bg-zinc-900">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <X className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {homeUrlStatus.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setHomeUrlStatus({ type: null, message: "" })}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="space-y-6">
          {/* Repository Information */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Repository Information
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="mb-3 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Git Status
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Git installed:</span>
                    {repoInfo?.isGitInstalled ? (
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">Yes</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                        <span className="text-sm font-medium text-red-700 dark:text-red-400">No</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Git repository:</span>
                    {repoInfo?.isGitRepository ? (
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">Yes</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                        <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">No</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
                <label className="mb-3 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Environment Variables
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">CHRONALOG_GITHUB_ID:</span>
                    {repoInfo?.envVars?.CHRONALOG_GITHUB_ID ? (
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">Set</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                        <span className="text-sm font-medium text-red-700 dark:text-red-400">Not set</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">CHRONALOG_GITHUB_SECRET:</span>
                    {repoInfo?.envVars?.CHRONALOG_GITHUB_SECRET ? (
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">Set</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                        <span className="text-sm font-medium text-red-700 dark:text-red-400">Not set</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {repoInfo?.isGitRepository && (
                <>
                  <div className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
                    <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Repository URL
                    </label>
                    <div className="mt-2">
                      {repoInfo.remoteUrl ? (
                        <a
                          href={formatRemoteUrl(repoInfo.remoteUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {formatRemoteUrl(repoInfo.remoteUrl)}
                        </a>
                      ) : (
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">
                          No remote configured
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
                    <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Current Branch
                    </label>
                    <div className="mt-2 flex items-center gap-2">
                      <GitBranch className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                      <span className="text-sm font-mono text-zinc-900 dark:text-zinc-50">
                        {repoInfo.branch || "Unknown"}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Configuration */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Configuration
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Changelog Directory
                </label>
                <div className="mt-2">
                  <span className="inline-flex items-center rounded-md bg-zinc-50 px-3 py-2 text-sm font-mono text-zinc-900 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-800/50 dark:text-zinc-50 dark:ring-zinc-700">
                    {repoInfo?.changelogDir || "changelog"}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Home URL
                </label>
                <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
                  Configure where the home button in the navbar takes you.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={homeUrl}
                    onChange={(e) => setHomeUrl(e.target.value)}
                    className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                    placeholder="/"
                  />
                  <button
                    type="button"
                    onClick={handleSaveHomeUrl}
                    disabled={savingHomeUrl}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    {savingHomeUrl ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Predefined Tags */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-6 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Predefined Tags
            </h2>
            
            <div className="space-y-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Define tags that will be available for selection when creating changelog entries. 
                Tags are saved to <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">chronalog/config.json</code> in your project root.
              </p>

              {/* Tags Display */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 rounded-lg border border-zinc-300 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
                    {predefinedTags.length === 0 ? (
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      No tags defined yet. Add your first tag below.
                    </span>
                  ) : (
                    predefinedTags.map((tag: string) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 rounded-full bg-zinc-200 px-3 py-1 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
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
                    ))
                  )}
                </div>
              </div>

              {/* Add Tag Input */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Add New Tag
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                    placeholder="Enter tag name and press Enter"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Add
                  </button>
                </div>
              </div>


              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveTags}
                  disabled={savingTags}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {savingTags ? "Saving..." : "Save Tags"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
