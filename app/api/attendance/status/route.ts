import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const todayRecord = db.attendance.getTodayByUserId(userId)

    return NextResponse.json({ record: todayRecord || null })
  } catch (error) {
    console.error("[v0] Get status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
