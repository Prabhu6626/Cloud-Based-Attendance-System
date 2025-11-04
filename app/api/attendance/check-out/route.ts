import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const todayRecord = db.attendance.getTodayByUserId(userId)

    if (!todayRecord) {
      return NextResponse.json({ error: "No check-in record found for today" }, { status: 400 })
    }

    if (todayRecord.checkOut) {
      return NextResponse.json({ error: "Already checked out today" }, { status: 400 })
    }

    const updatedRecord = db.attendance.update(todayRecord.id, {
      checkOut: new Date(),
    })

    return NextResponse.json({ success: true, record: updatedRecord })
  } catch (error) {
    console.error("[v0] Check-out error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
