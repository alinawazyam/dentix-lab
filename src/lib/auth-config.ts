import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// Admin emails that can access the admin panel
const ADMIN_EMAILS = [
  'mr.gulnawaz008@gmail.com',
  'drjani3210@gmail.com',
];

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-client-secret',
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Allow all users to sign in
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = ADMIN_EMAILS.includes(user.email || '');
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.isAdmin !== undefined) {
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
  pages: {
    error: '/',
  },
  secret: process.env.NEXTAUTH_SECRET || 'denta-premium-clinic-secret-key-2024-secure',
  debug: process.env.NODE_ENV === 'development',
};

// Extend the Session type
declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isAdmin?: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    isAdmin?: boolean;
  }
}
