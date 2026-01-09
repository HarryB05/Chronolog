// Example API route: /app/api/changelog/tags/route.ts
// This file shows how to implement the POST endpoint for saving predefined tags
// Add this to the same file as the GET endpoint above

import { NextResponse } from "next/server"
import { savePredefinedTags, getLoginSession } from "chronalog"

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
    const { tags } = body

    if (!Array.isArray(tags)) {
      return NextResponse.json(
        { error: "Tags must be an array" },
        { status: 400 }
      )
    }

    const result = savePredefinedTags(tags)

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Failed to save predefined tags",
          details: result.error || "Unknown error",
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Tags saved successfully",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error saving predefined tags:", error)
    return NextResponse.json(
      {
        error: "Failed to save predefined tags",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
