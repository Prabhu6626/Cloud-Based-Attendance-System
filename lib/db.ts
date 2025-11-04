// In-memory database for demo purposes
// This can be easily replaced with a real cloud database (Supabase, Neon, etc.)

export interface User {
  id: string
  email: string
  password: string // In production, this should be hashed
  name: string
  role: "admin" | "user"
  createdAt: Date
}

export interface AttendanceRecord {
  id: string
  userId: string
  userName: string
  checkIn: Date
  checkOut?: Date
  status: "present" | "absent" | "late"
  notes?: string
  location?: string
}

// In-memory storage
const users: User[] = [
  {
    id: "1",
    email: "admin@example.com",
    password: "admin123", // In production, use hashed passwords
    name: "Admin User",
    role: "admin",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    email: "john@example.com",
    password: "user123",
    name: "John Doe",
    role: "user",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "3",
    email: "jane@example.com",
    password: "user123",
    name: "Jane Smith",
    role: "user",
    createdAt: new Date("2024-01-01"),
  },
]

const attendanceRecords: AttendanceRecord[] = [
  {
    id: "1",
    userId: "2",
    userName: "John Doe",
    checkIn: new Date("2024-01-15T09:00:00"),
    checkOut: new Date("2024-01-15T17:30:00"),
    status: "present",
    location: "Office",
  },
  {
    id: "2",
    userId: "3",
    userName: "Jane Smith",
    checkIn: new Date("2024-01-15T09:15:00"),
    checkOut: new Date("2024-01-15T17:45:00"),
    status: "late",
    location: "Office",
  },
]

// Database operations
export const db = {
  users: {
    findByEmail: (email: string) => users.find((u) => u.email === email),
    findById: (id: string) => users.find((u) => u.id === id),
    getAll: () => users.filter((u) => u.role === "user"),
  },
  attendance: {
    create: (record: Omit<AttendanceRecord, "id">) => {
      const newRecord: AttendanceRecord = {
        ...record,
        id: Date.now().toString(),
      }
      attendanceRecords.push(newRecord)
      return newRecord
    },
    update: (id: string, updates: Partial<AttendanceRecord>) => {
      const index = attendanceRecords.findIndex((r) => r.id === id)
      if (index !== -1) {
        attendanceRecords[index] = { ...attendanceRecords[index], ...updates }
        return attendanceRecords[index]
      }
      return null
    },
    getByUserId: (userId: string) => attendanceRecords.filter((r) => r.userId === userId),
    getAll: () => attendanceRecords,
    getByDateRange: (startDate: Date, endDate: Date) =>
      attendanceRecords.filter((r) => r.checkIn >= startDate && r.checkIn <= endDate),
    getTodayByUserId: (userId: string) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      return attendanceRecords.find((r) => r.userId === userId && r.checkIn >= today && r.checkIn < tomorrow)
    },
  },
}
