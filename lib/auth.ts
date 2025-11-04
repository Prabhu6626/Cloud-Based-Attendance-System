// Simple authentication utilities
// In production, use proper authentication libraries like NextAuth.js

import { db, type User } from "./db"

export interface Session {
  user: Omit<User, "password">
}

export async function login(email: string, password: string): Promise<Session | null> {
  const user = db.users.findByEmail(email)

  if (!user || user.password !== password) {
    return null
  }

  const { password: _, ...userWithoutPassword } = user
  return { user: userWithoutPassword }
}

export async function getCurrentUser(userId: string): Promise<Omit<User, "password"> | null> {
  const user = db.users.findById(userId)
  if (!user) return null

  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}
