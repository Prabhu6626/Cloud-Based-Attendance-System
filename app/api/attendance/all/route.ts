import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const startDate = request.nextUrl.searchParams.get("startDate")
    const endDate = request.nextUrl.searchParams.get("endDate")

    let records

    if (startDate && endDate) {
      records = db.attendance.getByDateRange(new Date(startDate), new Date(endDate))
    } else {
      records = db.attendance.getAll()
    }

    // Sort by most recent first
    records.sort((a, b) => b.checkIn.getTime() - a.checkIn.getTime())

    return NextResponse.json({ records })
  } catch (error) {
    console.error("[v0] Get all attendance error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
