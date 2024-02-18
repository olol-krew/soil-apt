import express from "express"
import session from "express-session"
import passport from "passport"
import "./strategies/discord"

import { log } from "../common/helpers/logger"

import authRouter from "./routes/auth"
import personaRouter from "./routes/personas"
import userRouter from "./routes/auth-users"

const app = express()
const port = (Bun.env.API_PORT && +Bun.env.API_PORT) || 3001

app.use(express.json())
app.use(express.urlencoded())
app.use(session({
  secret: Bun.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
}))

app.use(passport.initialize())
app.use(passport.session())
app.use((req, res, next) => {
  log.info(`${req.method} - ${req.url}${req.user ? " from " + req.user.username : " from " + (req.get('User-Agent') === 'SoilAPT-bot' ? 'bot' : 'anonymous')} @${req.ip}`)
  next()
})

app.use('/api/auth', authRouter)

app.use((req, res, next) => {
  if (req.get('Authorization') === `Basic ${btoa(Bun.env.BOT_TOKEN!)}` && req.get('User-Agent') === 'SoilAPT-bot') return next()
  if (!req.user) return res.sendStatus(401)
  if (!req.user.isGuildMember) return res.sendStatus(403)
  else next()
})

app.use('/api/personas', personaRouter)
app.use('/api/users', userRouter)

app.listen(port, () => {
  log.info(`API server listening on port ${port}.`)
})