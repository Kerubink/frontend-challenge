export interface User {
  id: string
  email: string
  displayName: string
  username: string
  ens?: string
  walletAlias?: string
  avatarUrl?: string
}

export interface AuthResult {
  token: string
  user: User
}
