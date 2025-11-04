"use client"

import { useState } from "react"
import { LoginForm } from "@/components/login-form"
import { AttendanceMarker } from "@/components/attendance-marker"
import { AdminDashboard } from "@/components/admin-dashboard"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { LogOut, BarChart3, LayoutDashboard, Clock } from "lucide-react"

export default function Home() {
  const { user, login, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("attendance")

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 text-balance">Cloud Attendance System</h1>
            <p className="text-muted-foreground text-pretty">Manage attendance records with cloud backend</p>
          </div>
          <LoginForm onLoginSuccess={login} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Cloud Attendance System</h1>
              <p className="text-sm text-muted-foreground">
                Welcome, {user.name} ({user.role})
              </p>
            </div>
            <Button onClick={logout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {user.role === "admin" ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
              <TabsTrigger value="attendance">
                <Clock className="mr-2 h-4 w-4" />
                Attendance
              </TabsTrigger>
              <TabsTrigger value="dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="attendance">
              <div className="max-w-2xl">
                <AttendanceMarker />
              </div>
            </TabsContent>

            <TabsContent value="dashboard">
              <AdminDashboard />
            </TabsContent>

            <TabsContent value="analytics">
              <AnalyticsDashboard />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="max-w-2xl mx-auto">
            <AttendanceMarker />
          </div>
        )}
      </main>
    </div>
  )
}
