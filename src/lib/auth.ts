import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  // Remove database adapter for now - use JWT sessions instead
  // adapter: PrismaAdapter(prisma),
  providers: [
    {
      id: "zoho",
      name: "Zoho",
      type: "oauth",
      authorization: "https://accounts.zoho.com/oauth/v2/auth?scope=AaaServer.profile.READ&response_type=code",
      token: "https://accounts.zoho.com/oauth/v2/token",
      userinfo: "https://accounts.zoho.com/oauth/v2/user/info",
      clientId: process.env.ZOHO_CLIENT_ID as string,
      clientSecret: process.env.ZOHO_CLIENT_SECRET as string,
      profile(profile: any) {
        return {
          id: profile.ZUID || profile.zuid,
          name: profile.Display_Name || profile.display_name || `${profile.First_Name || profile.first_name} ${profile.Last_Name || profile.last_name}`,
          email: profile.Email || profile.email,
          image: profile.profile_image_url || null,
        }
      },
    },
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('SignIn callback:', { user, account, profile })
      return true
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect callback:', { url, baseUrl })
      // Redirect to dashboard after successful login
      if (url.startsWith(baseUrl)) return url
      if (url.startsWith('/')) return `${baseUrl}${url}`
      return `${baseUrl}/dashboard`
    },
    async jwt({ token, user, account, profile }) {
      // Save user info to JWT token
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === 'development',
}
