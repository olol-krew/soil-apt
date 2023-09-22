import passport from "passport";
import { Strategy, Scope } from "passport-discord-auth";

const { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET } = Bun.env
if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) throw new Error('OAuth credentials missing.')

passport.use(new Strategy({
  clientId: DISCORD_CLIENT_ID,
  clientSecret: DISCORD_CLIENT_SECRET,
  callbackUrl: 'http://localhost:3004/api/auth/discord/redirect',
  scope: [Scope.Email]
}, (accessToken, refreshToken, profile, done) => {
  console.log(accessToken)
  console.log(refreshToken)
  console.log(profile)
}))