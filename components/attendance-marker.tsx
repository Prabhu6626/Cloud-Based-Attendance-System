"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Clock, MapPin, CheckCircle2, LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface AttendanceRecord {
  id: string
  checkIn: string
  checkOut?: string
  status: string
  location?: string
  notes?: string
}

export function AttendanceMarker() {
  const { user } = useAuth()
  const [location, setLocation] = useState("")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchTodayStatus()
    }
  }, [user])

  const fetchTodayStatus = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/attendance/status?userId=${user.id}`)
      const data = await response.json()
      setTodayRecord(data.record)
    } catch (error) {
      console.error("[v0] Failed to fetch status:", error)
    }
  }

  const handleCheckIn = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/attendance/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          userName: user.name,
          location: location || "Not specified",
          notes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Check-in failed")
      }

      toast({
        title: "Checked in successfully",
        description: `Welcome, ${user.name}! Your attendance has been recorded.`,
      })

      setTodayRecord(data.record)
      setLocation("")
      setNotes("")
    } catch (error) {
      toast({
        title: "Check-in failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckOut = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/attendance/check-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Check-out failed")
      }

      toast({
        title: "Checked out successfully",
        description: "Have a great day!",
      })

      setTodayRecord(data.record)
    } catch (error) {
      toast({
        title: "Check-out failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!todayRecord) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Mark Attendance
          </CardTitle>
          <CardDescription>Check in to record your attendance for today</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                placeholder="Office, Home, Remote..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          <Button onClick={handleCheckIn} disabled={isLoading} className="w-full" size="lg">
            <CheckCircle2 className="mr-2 h-5 w-5" />
            {isLoading ? "Checking in..." : "Check In"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          Attendance Status
        </CardTitle>
        <CardDescription>Your attendance for today</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Check In</p>
              <p className="text-2xl font-bold">{formatTime(todayRecord.checkIn)}</p>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                todayRecord.status === "present"
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
              }`}
            >
              {todayRecord.status === "present" ? "On Time" : "Late"}
            </div>
          </div>

          {todayRecord.checkOut && (
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Check Out</p>
                <p className="text-2xl font-bold">{formatTime(todayRecord.checkOut)}</p>
              </div>
            </div>
          )}

          {todayRecord.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{todayRecord.location}</span>
            </div>
          )}

          {todayRecord.notes && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Notes</p>
              <p className="text-sm text-muted-foreground">{todayRecord.notes}</p>
            </div>
          )}
        </div>

        {!todayRecord.checkOut && (
          <Button
            onClick={handleCheckOut}
            disabled={isLoading}
            variant="outline"
            className="w-full bg-transparent"
            size="lg"
          >
            <LogOut className="mr-2 h-5 w-5" />
            {isLoading ? "Checking out..." : "Check Out"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
