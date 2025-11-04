"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { TrendingUp, Users, Calendar, Award } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DailyAttendance {
  date: string
  present: number
  late: number
  total: number
}

interface UserSummary {
  userId: string
  userName: string
  totalDays: number
  presentCount: number
  lateCount: number
  attendanceRate: number
}

interface Statistics {
  totalRecords: number
  totalUsers: number
  totalPresent: number
  totalLate: number
  overallAttendanceRate: number
}

export function AnalyticsDashboard() {
  const [dailyAttendance, setDailyAttendance] = useState<DailyAttendance[]>([])
  const [userSummary, setUserSummary] = useState<UserSummary[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/analytics")
      const data = await response.json()

      setDailyAttendance(data.dailyAttendance || [])
      setUserSummary(data.userSummary || [])
      setStatistics(data.statistics)
    } catch (error) {
      toast({
        title: "Failed to load analytics",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {statistics && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalRecords}</div>
              <p className="text-xs text-muted-foreground">All time attendance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">On Time</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalPresent}</div>
              <p className="text-xs text-muted-foreground">Present records</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalLate}</div>
              <p className="text-xs text-muted-foreground">Late records</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Overall Rate</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.overallAttendanceRate}%</div>
              <p className="text-xs text-muted-foreground">On-time percentage</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>7-Day Attendance Trend</CardTitle>
          <CardDescription>Daily attendance breakdown for the last week</CardDescription>
        </CardHeader>
        <CardContent>
          {dailyAttendance.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyAttendance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="hsl(var(--chart-1))" name="On Time" />
                <Bar dataKey="late" fill="hsl(var(--chart-2))" name="Late" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-muted-foreground">No data available for the last 7 days</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Employee Attendance Summary</CardTitle>
          <CardDescription>Individual attendance statistics</CardDescription>
        </CardHeader>
        <CardContent>
          {userSummary.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead className="text-right">Total Days</TableHead>
                    <TableHead className="text-right">On Time</TableHead>
                    <TableHead className="text-right">Late</TableHead>
                    <TableHead className="text-right">Attendance Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userSummary.map((user) => (
                    <TableRow key={user.userId}>
                      <TableCell className="font-medium">{user.userName}</TableCell>
                      <TableCell className="text-right">{user.totalDays}</TableCell>
                      <TableCell className="text-right">{user.presentCount}</TableCell>
                      <TableCell className="text-right">{user.lateCount}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.attendanceRate >= 90
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : user.attendanceRate >= 70
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          }`}
                        >
                          {user.attendanceRate}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No employee data available</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
