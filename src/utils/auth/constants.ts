// Authentication constants
export const TOKEN_NAME = process.env.NEXT_PUBLIC_CHRONALOG_TOKEN_NAME || 'chronalog_token'
export const MAX_AGE = 60 * 60 * 24 * 30 // 30 days
// Generate a default secret if not provided (for development only)
// In production, you should set CHRONALOG_TOKEN_SECRET explicitly
export const TOKEN_SECRET =
  process.env.CHRONALOG_TOKEN_SECRET || 'chronalog-dev-secret-change-in-production'

// Cookie settings
export const COOKIE_SETTINGS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  sameSite: 'lax' as const
} as const

// Session validation
export const SESSION_ERROR_MESSAGES = {
  INVALID_SESSION: 'Invalid session data',
  SESSION_EXPIRED: 'Session expired',
  INVALID_STRUCTURE: 'Invalid session structure detected'
} as const
