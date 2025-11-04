"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Clock, TrendingUp, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AttendanceRecord {
  id: string
  userId: string
  userName: string
  checkIn: string
  checkOut?: string
  status: string
  location?: string
  notes?: string
}

interface User {
  id: string
  name: string
  email: string
}

export function AdminDashboard() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [attendanceRes, usersRes] = await Promise.all([fetch("/api/attendance/all"), fetch("/api/users")])

      const attendanceData = await attendanceRes.json()
      const usersData = await usersRes.json()

      setRecords(attendanceData.records || [])
      setUsers(usersData.users || [])
    } catch (error) {
      toast({
        title: "Failed to load data",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilter = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Invalid date range",
        description: "Please select both start and end dates",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/attendance/all?startDate=${startDate}&endDate=${endDate}`)
      const data = await response.json()
      setRecords(data.records || [])
    } catch (error) {
      toast({
        title: "Failed to filter data",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearFilter = () => {
    setStartDate("")
    setEndDate("")
    fetchData()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const calculateWorkHours = (checkIn: string, checkOut?: string) => {
    if (!checkOut) return "In Progress"
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const todayRecords = records.filter((r) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const recordDate = new Date(r.checkIn)
    recordDate.setHours(0, 0, 0, 0)
    return recordDate.getTime() === today.getTime()
  })

  const presentToday = todayRecords.filter((r) => r.status === "present").length
  const lateToday = todayRecords.filter((r) => r.status === "late").length
  const totalUsers = users.length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{presentToday}</div>
            <p className="text-xs text-muted-foreground">On time arrivals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Late Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lateToday}</div>
            <p className="text-xs text-muted-foreground">Late arrivals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalUsers > 0 ? Math.round((todayRecords.length / totalUsers) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Today's attendance</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Records</CardTitle>
          <CardDescription>Filter attendance records by date range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleFilter} disabled={isLoading}>
                Apply Filter
              </Button>
              <Button onClick={handleClearFilter} variant="outline" disabled={isLoading}>
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>
            {records.length} record{records.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No attendance records found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.userName}</TableCell>
                      <TableCell>{formatDate(record.checkIn)}</TableCell>
                      <TableCell>{formatTime(record.checkIn)}</TableCell>
                      <TableCell>{record.checkOut ? formatTime(record.checkOut) : "-"}</TableCell>
                      <TableCell>{calculateWorkHours(record.checkIn, record.checkOut)}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            record.status === "present"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                          }`}
                        >
                          {record.status === "present" ? "On Time" : "Late"}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{record.location || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
