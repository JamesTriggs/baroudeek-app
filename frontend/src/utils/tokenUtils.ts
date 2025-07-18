const TOKEN_KEY = 'token'

export const tokenUtils = {
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY)
  },

  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token)
  },

  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY)
  },

  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp < currentTime
    } catch (error) {
      return true
    }
  },

  getTokenPayload: (token: string): any | null => {
    try {
      return JSON.parse(atob(token.split('.')[1]))
    } catch (error) {
      return null
    }
  },

  shouldRefreshToken: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      const timeUntilExpiry = payload.exp - currentTime
      // Refresh if token expires within 5 minutes
      return timeUntilExpiry < 300
    } catch (error) {
      return true
    }
  }
}

export default tokenUtils