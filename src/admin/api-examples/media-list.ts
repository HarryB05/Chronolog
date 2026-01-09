/**
 * Example API route for listing media files
 * 
 * Place this file at: app/api/changelog/media/list/route.ts
 * 
 * This route lists all media files in public/chronalog
 */

import { NextResponse } from "next/server"
import { listMediaFiles, getLoginSession } from "chronalog"

export async function GET() {
  // Check authentication
  const session = await getLoginSession()
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const files = listMediaFiles()

    return NextResponse.json(
      {
        success: true,
        files: files.map((file) => ({
          filename: file.filename,
          url: file.url,
          size: file.size,
          modified: file.modified.toISOString(),
        })),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error listing media files:", error)
    return NextResponse.json(
      {
        error: "Failed to list media files",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
