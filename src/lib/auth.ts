import { NextAuthOptions } from "next-auth"
import { prisma } from "./prisma"

// Custom Zoho Provider with proper OAuth2 configuration
const ZohoProvider = {
  id: "zoho",
  name: "Zoho",
  type: "oauth" as const,
  authorization: {
    url: "https://accounts.zoho.com/oauth/v2/auth",
    params: {
      scope: "AaaServer.profile.READ",
      response_type: "code",
      access_type: "offline",
    }
  },
  token: {
    url: "https://accounts.zoho.com/oauth/v2/token",
    params: {
      grant_type: "authorization_code",
    }
  },
  userinfo: {
    url: "https://accounts.zoho.com/oauth/v2/user/info",
    async request(context: any) {
      const response = await fetch("https://accounts.zoho.com/oauth/v2/user/info", {
        headers: {
          Authorization: `Bearer ${context.tokens.access_token}`,
        },
      })
      return await response.json()
    },
  },
  clientId: process.env.ZOHO_CLIENT_ID,
  clientSecret: process.env.ZOHO_CLIENT_SECRET,
  profile(profile: any) {
    return {
      id: profile.ZUID,
      name: profile.Display_Name || `${profile.First_Name} ${profile.Last_Name}`,
      email: profile.Email,
      image: null,
    }
  },
}

export const authOptions: NextAuthOptions = {
  providers: [ZohoProvider],
  callbacks: {
    async signIn({ user }) {
      // Simple validation - just check if user data exists
      return !!(user?.email && user?.id)
    },
    async redirect({ url, baseUrl }) {
      // Always redirect to dashboard after successful login
      if (url === `${baseUrl}/dashboard`) return url
      return `${baseUrl}/dashboard`
    },
    async jwt({ token, user }) {
      // Store user data in JWT token (no database needed)
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      // Pass user data from JWT to session
      session.user.id = token.id as string
      session.user.email = token.email as string
      session.user.name = token.name as string
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
}
