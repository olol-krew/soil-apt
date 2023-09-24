import passport from "passport";
import { Strategy, Scope } from "passport-discord-auth";
import { db } from "../data/database";
import { log } from "../../common/helpers/logger";

const { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET } = Bun.env
if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) throw new Error('OAuth credentials missing.')

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  try {
    const user = db.authUser.get(id as string)
    if (!user) {
      throw new Error(`User with id ${id} not found.`)
    }

    return done(null, user)
  } catch (err) {
    log.error(err)
    done(err, null)
  }
})

passport.use(new Strategy({
  clientId: DISCORD_CLIENT_ID,
  clientSecret: DISCORD_CLIENT_SECRET,
  callbackUrl: 'http://localhost:3004/api/auth/discord/redirect',
  scope: [Scope.Email, Scope.Guilds]
}, (accessToken, refreshToken, profile, done) => {
  const user = db.authUser.get(profile.id)

  try {
    if (user) {
      log.info(`User ${user.username} logged in.`)
      return done(null, user)
    }
    else {
      const newUser = db.authUser.create({
        discordId: profile.id,
        username: profile.username,
        avatar: profile.avatar,
        globalName: profile.global_name,
        email: profile.email,
        accessToken: accessToken,
        refreshToken: refreshToken,
        guilds: profile.guilds
      })

      if (!newUser) {
        log.error(`Failed to create user ${user}.`)
        throw new Error('There was an error when creating the new user')
      }

      log.info(`Created new user ${newUser.username}.`)
      return done(null, newUser)
    }
  } catch (err) {
    log.error(err)
    return done(err as Error, undefined)
  }
}))