// Example API route: /app/api/changelog/tags/route.ts
// This file shows how to implement the GET endpoint for predefined tags

import { NextResponse } from "next/server"
import { readPredefinedTags, getLoginSession } from "chronalog"

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
    const tags = readPredefinedTags()
    return NextResponse.json(
      {
        success: true,
        tags,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error reading predefined tags:", error)
    return NextResponse.json(
      {
        error: "Failed to read predefined tags",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
