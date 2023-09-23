import express from "express"
import session from "express-session"
import passport from "passport"
import "./strategies/discord"

import authRouter from "./routes/auth"
import personaRouter from "./routes/personas"
import potdRouter from "./routes/potd"
import userRouter from "./routes/users"

const app = express()
const port = (Bun.env.API_PORT && +Bun.env.API_PORT) || 3001

app.use(express.json())
app.use(express.urlencoded())
app.use(session({
  secret: "on verra plus tard",
  resave: false,
  saveUninitialized: false,
}))

app.use(passport.initialize())
app.use(passport.session())
app.use((req, res, next) => {
  console.log(`${req.method} - ${req.url}${req.user ? " from " + req.user.username : " from anonymous"}`)
  next()
})

app.use('/api/auth', authRouter)

app.use((req, res, next) => {
  if (req.ip === 'localhost' /*&& req.get('User-Agent') === 'SoilAPT-bot'*/) next()
  if (!req.user) return res.sendStatus(401)
  else next()
})

app.use('/api/personas', personaRouter)
app.use('/api/potd', potdRouter)
app.use('/api/users', userRouter)

app.listen(port, () => {
  console.log(`API server listening on port ${port}.`)
})