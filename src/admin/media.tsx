"use client"

import { useState, useEffect, useRef } from "react"
import { Upload, Image as ImageIcon, Loader2, CheckCircle2, X } from "lucide-react"
import { AdminLayout } from "./components/Layout"

interface MediaFile {
  filename: string
  url: string
  size: number
  modified: string
}

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    filename: string
    url: string
  }>({ isOpen: false, filename: "", url: "" })
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch media files on mount
  useEffect(() => {
    fetchMediaFiles()
  }, [])

  // Auto-dismiss upload status after 3 seconds
  useEffect(() => {
    if (uploadStatus.type === "success") {
      const timer = setTimeout(() => {
        setUploadStatus({ type: null, message: "" })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [uploadStatus.type])

  const fetchMediaFiles = async () => {
    try {
      const response = await fetch("/api/changelog/media/list")
      const data = await response.json()
      if (data.success) {
        setFiles(data.files || [])
      }
    } catch (error) {
      console.error("Failed to fetch media files:", error)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    setIsUploading(true)
    setUploadStatus({ type: null, message: "" })

    try {
      const formData = new FormData()
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append("files", selectedFiles[i])
      }

      const response = await fetch("/api/changelog/media/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setUploadStatus({
          type: "success",
          message: `Successfully uploaded ${data.files?.length || 1} file(s)`,
        })
        // Refresh the file list
        await fetchMediaFiles()
        // Clear the input
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } else {
        setUploadStatus({
          type: "error",
          message: data.error || "Failed to upload files",
        })
      }
    } catch (error) {
      setUploadStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to upload files",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const openDeleteDialog = (url: string, filename: string) => {
    setDeleteDialog({ isOpen: true, filename, url })
  }

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, filename: "", url: "" })
  }

  const confirmDelete = async () => {
    const { url, filename } = deleteDialog
    closeDeleteDialog()

    try {
      // Extract filename from URL (e.g., /chronalog/image.jpg -> image.jpg)
      const urlFilename = url.split("/").pop() || filename
      
      const response = await fetch("/api/changelog/media/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filename: urlFilename }),
      })

      const data = await response.json()

      if (data.success) {
        setUploadStatus({
          type: "success",
          message: "File deleted successfully",
        })
        await fetchMediaFiles()
      } else {
        setUploadStatus({
          type: "error",
          message: data.error || "Failed to delete file",
        })
      }
    } catch (error) {
      setUploadStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to delete file",
      })
    }
  }

  const copyToClipboard = (url: string) => {
    // Ensure URL is in the correct format (relative to public folder)
    // Remove any leading protocol/host if present, ensure it starts with /
    let publicUrl = url
    if (publicUrl.startsWith("http://") || publicUrl.startsWith("https://")) {
      // Extract pathname from full URL
      try {
        const urlObj = new URL(publicUrl)
        publicUrl = urlObj.pathname
      } catch {
        // If URL parsing fails, try to extract path manually
        const match = publicUrl.match(/\/[^?#]*/)
        publicUrl = match ? match[0] : url
      }
    }
    // Ensure it starts with /
    if (!publicUrl.startsWith("/")) {
      publicUrl = `/${publicUrl}`
    }
    
    navigator.clipboard.writeText(publicUrl)
    setCopiedUrl(url)
    setTimeout(() => {
      setCopiedUrl(null)
    }, 2000)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i]
  }

  return (
    <AdminLayout>
      {/* Success Notification */}
      {uploadStatus.type === "success" && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-top-5 fade-in-0">
          <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-white px-4 py-3 shadow-lg dark:border-green-800 dark:bg-zinc-900">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {uploadStatus.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setUploadStatus({ type: null, message: "" })}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {uploadStatus.type === "error" && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-top-5 fade-in-0">
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-white px-4 py-3 shadow-lg dark:border-red-800 dark:bg-zinc-900">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <X className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {uploadStatus.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setUploadStatus({ type: null, message: "" })}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Media Library
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Upload and manage images and other media files
        </p>
      </div>

      {/* Upload Section */}
      <div className="mb-8 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Upload Files
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Files will be saved to <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">public/chronalog</code>
            </p>
          </div>
          <label className="cursor-pointer">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
            <div
              className={`flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200 ${
                isUploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Files
                </>
              )}
            </div>
          </label>
        </div>

      </div>

      {/* Media Grid */}
      {files.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <ImageIcon className="mx-auto mb-4 h-12 w-12 text-zinc-400" />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No media files yet. Upload your first file to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {files.map((file) => (
            <div
              key={file.url}
              className="group relative overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                <img
                  src={file.url}
                  alt={file.filename}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  onError={(e) => {
                    // Fallback for non-image files
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                    const parent = target.parentElement
                    if (parent) {
                      parent.innerHTML = `
                        <div class="flex h-full items-center justify-center">
                          <div class="text-center">
                            <svg class="mx-auto h-8 w-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <p class="mt-2 text-xs text-zinc-500">${file.filename}</p>
                          </div>
                        </div>
                      `
                    }
                  }}
                />
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex h-full flex-col items-center justify-center gap-2 p-2">
                  <button
                    onClick={() => copyToClipboard(file.url)}
                    className="relative rounded bg-white px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-zinc-100"
                  >
                    <span
                      className={`transition-opacity duration-200 ${
                        copiedUrl === file.url ? "opacity-0" : "opacity-100"
                      }`}
                    >
                      Copy URL
                    </span>
                    <span
                      className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
                        copiedUrl === file.url ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      Copied
                    </span>
                  </button>
                  <button
                    onClick={() => openDeleteDialog(file.url, file.filename)}
                    className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
                <p className="truncate text-xs font-medium">{file.filename}</p>
                <p className="text-xs text-zinc-400">{formatFileSize(file.size)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <div className="p-6">
              <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Delete File
              </h3>
              <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
                Are you sure you want to delete <span className="font-medium">{deleteDialog.filename}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeDeleteDialog}
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  )
}
