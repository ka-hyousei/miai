import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'メールアドレス', type: 'email' },
        password: { label: 'パスワード', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('メールアドレスとパスワードを入力してください')
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { profile: true },
          })

          if (!user || !user.password) {
            throw new Error('ユーザーが存在しません。新規登録してください')
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            throw new Error('パスワードが正しくありません')
          }

          return {
            id: user.id,
            email: user.email,
            hasProfile: !!user.profile,
          }
        } catch (error) {
          // データベース接続エラーやテーブル不存在エラーの場合
          if (error instanceof Error) {
            if (error.message.includes('does not exist') ||
                error.message.includes('Connection') ||
                error.message.includes('connect')) {
              throw new Error('システムエラーが発生しました。しばらくしてから再度お試しください。')
            }
            // 既に日本語のエラーメッセージの場合はそのまま投げる
            if (error.message.includes('メール') || error.message.includes('パスワード') || error.message.includes('ユーザー')) {
              throw error
            }
          }
          throw new Error('ログインに失敗しました。アカウントをお持ちでない場合は新規登録してください。')
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30天
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30天
      },
    },
  },
  pages: {
    signIn: '/login',
    newUser: '/profile/setup',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.hasProfile = (user as { hasProfile?: boolean }).hasProfile
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.hasProfile = token.hasProfile as boolean
      }
      return session
    },
  },
}
