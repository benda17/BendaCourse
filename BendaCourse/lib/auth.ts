import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production'

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    console.log('[verifyToken] Token verified successfully for:', decoded.email)
    return decoded
  } catch (error) {
    console.error('[verifyToken] Token verification failed:', error instanceof Error ? error.message : 'Unknown error')
    console.log('[verifyToken] JWT_SECRET exists:', !!JWT_SECRET)
    console.log('[verifyToken] Token length:', token.length)
    console.log('[verifyToken] Token preview:', token.substring(0, 50) + '...')
    return null
  }
}

export function generateResetToken(): string {
  return jwt.sign({ type: 'reset' }, JWT_SECRET, { expiresIn: '1h' })
}

