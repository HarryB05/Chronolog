/**
 * Example API route for deleting media files
 * 
 * Place this file at: app/api/changelog/media/delete/route.ts
 * 
 * This route deletes media files from public/chronalog
 */

import { NextResponse } from "next/server"
import { getLoginSession } from "chronalog"
import fs from "fs"
import path from "path"

export async function POST(request: Request) {
  // Check authentication
  const session = await getLoginSession()
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { filename } = body

    if (!filename) {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 }
      )
    }

    // Sanitise filename to prevent path traversal
    const sanitisedFilename = filename
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/^-+|-+$/g, "")

    const cwd = process.cwd()
    const mediaDir = path.join(cwd, "public", "chronalog")
    const filePath = path.join(mediaDir, sanitisedFilename)

    // Verify file is within the media directory
    if (!filePath.startsWith(mediaDir)) {
      return NextResponse.json(
        { error: "Invalid file path" },
        { status: 400 }
      )
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      )
    }

    // Delete file
    fs.unlinkSync(filePath)

    return NextResponse.json(
      {
        success: true,
        message: "File deleted successfully",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting media file:", error)
    return NextResponse.json(
      {
        error: "Failed to delete media file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
