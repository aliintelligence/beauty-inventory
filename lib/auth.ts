// Simple admin authentication
export const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'Bobbyhead12'
}

export function validateCredentials(username: string, password: string): boolean {
  return username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password
}

export function setAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('gurl_aesthetic_auth', 'authenticated')
    localStorage.setItem('gurl_aesthetic_auth_time', Date.now().toString())
  }
}

export function getAuthToken(): boolean {
  if (typeof window === 'undefined') return false
  
  const token = localStorage.getItem('gurl_aesthetic_auth')
  const authTime = localStorage.getItem('gurl_aesthetic_auth_time')
  
  if (!token || !authTime) return false
  
  // Check if token is less than 24 hours old
  const tokenTime = parseInt(authTime)
  const twentyFourHours = 24 * 60 * 60 * 1000
  const isValid = Date.now() - tokenTime < twentyFourHours
  
  if (!isValid) {
    clearAuthToken()
    return false
  }
  
  return token === 'authenticated'
}

export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('gurl_aesthetic_auth')
    localStorage.removeItem('gurl_aesthetic_auth_time')
  }
}