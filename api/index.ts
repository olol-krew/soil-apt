import express from "express"
import session from "express-session"
import passport from "passport"
import { CronJob } from "cron"
import "./strategies/discord"

import { log } from "../common/helpers/logger"
import { loadPotd, pickNewPotd } from "./helpers/potd-helpers"
import { db } from "./data/database"

import authRouter from "./routes/auth"
import personaRouter from "./routes/personas"
import potdRouter from "./routes/potd"
import userRouter from "./routes/users"
import promptRouter from "./routes/prompts"

const app = express()
const port = (Bun.env.API_PORT && +Bun.env.API_PORT) || 3001

const potd = loadPotd()
log.info(`Persona of the day is ${potd.title}`)

const potdJob = new CronJob('0 0 * * *', () => {
  log.info(`Picking a new persona of the day`)
  const currentPotd = db.potd.getMostRecent()

  let newPotd = pickNewPotd()
  while (newPotd!.personaId === currentPotd!.personaId || !db.persona.get(newPotd!.personaId)) {
    log.warn(`Invalid persona ID ${newPotd?.personaId}, new attempt.`)
    newPotd = pickNewPotd()
  }
})
potdJob.start()

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
  console.log(`${req.method} - ${req.url}${req.user ? " from " + req.user.username : " from " + (req.get('User-Agent') === 'SoilAPT-bot' ? 'bot' : 'anonymous')}`)
  next()
})

app.use('/api/auth', authRouter)

app.use((req, res, next) => {
  if (req.ip === 'localhost' && req.get('User-Agent') === 'SoilAPT-bot') next()
  if (!req.user) return res.sendStatus(401)
  if (!req.user.isGuildMember) return res.sendStatus(403)
  else next()
})

app.use('/api/personas', personaRouter)
app.use('/api/potd', potdRouter)
app.use('/api/users', userRouter)
app.use('/api/prompts', promptRouter)

app.listen(port, () => {
  console.log(`API server listening on port ${port}.`)
})