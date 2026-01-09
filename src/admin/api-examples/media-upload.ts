/**
 * Example API route for uploading media files
 * 
 * Place this file at: app/api/changelog/media/upload/route.ts
 * 
 * This route handles file uploads and saves them to public/chronalog
 */

import { NextResponse } from "next/server"
import { saveMediaFile, getLoginSession } from "chronalog"

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
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      )
    }

    const uploadedFiles: Array<{ filename: string; url: string }> = []

    for (const file of files) {
      // Validate file type (only images for now)
      if (!file.type.startsWith("image/")) {
        continue
      }

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Save file
      const url = saveMediaFile(buffer, file.name)

      uploadedFiles.push({
        filename: file.name,
        url,
      })
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        { error: "No valid image files provided" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
        files: uploadedFiles,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error uploading media:", error)
    return NextResponse.json(
      {
        error: "Failed to upload media",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
