import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
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
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: "database",
  },
  debug: process.env.NODE_ENV === 'development',
}
