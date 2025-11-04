import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { userId, userName, location, notes } = await request.json()

    if (!userId || !userName) {
      return NextResponse.json({ error: "User ID and name are required" }, { status: 400 })
    }

    // Check if user already checked in today
    const existingRecord = db.attendance.getTodayByUserId(userId)
    if (existingRecord) {
      return NextResponse.json({ error: "Already checked in today" }, { status: 400 })
    }

    const checkInTime = new Date()
    const workStartTime = new Date()
    workStartTime.setHours(9, 0, 0, 0)

    const status = checkInTime > workStartTime ? "late" : "present"

    const record = db.attendance.create({
      userId,
      userName,
      checkIn: checkInTime,
      status,
      location,
      notes,
    })

    return NextResponse.json({ success: true, record })
  } catch (error) {
    console.error("[v0] Check-in error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
