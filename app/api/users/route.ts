import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const users = db.users.getAll()
    return NextResponse.json({ users })
  } catch (error) {
    console.error("[v0] Get users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
