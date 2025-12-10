import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      hasProfile: boolean
    }
  }

  interface User {
    id: string
    email: string
    hasProfile?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    hasProfile?: boolean
  }
}
