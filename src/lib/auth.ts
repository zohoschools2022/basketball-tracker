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
      authorization: {
        url: "https://accounts.zoho.com/oauth/v2/auth",
        params: {
          scope: "AaaServer.profile.READ",
          access_type: "offline",
          prompt: "consent",
        },
      },
      token: "https://accounts.zoho.com/oauth/v2/token",
      userinfo: "https://accounts.zoho.com/oauth/v2/user/info",
      clientId: process.env.ZOHO_CLIENT_ID,
      clientSecret: process.env.ZOHO_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.ZUID,
          name: profile.Display_Name || profile.First_Name + " " + profile.Last_Name,
          email: profile.Email,
          image: profile.profile_image_url,
        }
      },
    },
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // You can add custom logic here to restrict access
      // For example, check if user email belongs to your organization
      return true
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: "database",
  },
}
