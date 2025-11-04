import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const records = db.attendance.getAll()
    const users = db.users.getAll()

    // Calculate analytics
    const totalRecords = records.length
    const totalUsers = users.length

    // Last 7 days analytics
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      return date
    }).reverse()

    const dailyAttendance = last7Days.map((date) => {
      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)

      const dayRecords = records.filter((r) => r.checkIn >= date && r.checkIn < nextDay)

      return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        present: dayRecords.filter((r) => r.status === "present").length,
        late: dayRecords.filter((r) => r.status === "late").length,
        total: dayRecords.length,
      }
    })

    // User attendance summary
    const userSummary = users.map((user) => {
      const userRecords = records.filter((r) => r.userId === user.id)
      const presentCount = userRecords.filter((r) => r.status === "present").length
      const lateCount = userRecords.filter((r) => r.status === "late").length
      const totalDays = userRecords.length
      const attendanceRate = totalDays > 0 ? (presentCount / totalDays) * 100 : 0

      return {
        userId: user.id,
        userName: user.name,
        totalDays,
        presentCount,
        lateCount,
        attendanceRate: Math.round(attendanceRate),
      }
    })

    // Overall statistics
    const totalPresent = records.filter((r) => r.status === "present").length
    const totalLate = records.filter((r) => r.status === "late").length
    const overallAttendanceRate = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0

    return NextResponse.json({
      dailyAttendance,
      userSummary,
      statistics: {
        totalRecords,
        totalUsers,
        totalPresent,
        totalLate,
        overallAttendanceRate,
      },
    })
  } catch (error) {
    console.error("[v0] Analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
