import { NextAuthOptions } from "next-auth";
import Auth0Provider from "next-auth/providers/auth0";

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/auth/signin', 
  },
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      issuer: process.env.AUTH0_DOMAIN,
      authorization: {
        params: {
          audience: process.env.AUTH0_AUDIENCE,
          scope:
            process.env.AUTH0_SCOPE || "openid profile email offline_access",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        if (account.refresh_token) {
          token.refreshToken = account.refresh_token;
        }
        if (account.expires_at) {
          token.accessTokenExpires =
            (account.expires_at - 120) * 1000;
        }
      }
      return token;
    },

    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken as string,
        refreshToken: token.refreshToken as string | undefined,
        accessTokenExpires: token.accessTokenExpires as number | undefined,
      };
    },
  },
};
