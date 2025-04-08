export interface User {
  id: string
  name: string
  email: string
  role: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
}

export interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
}

