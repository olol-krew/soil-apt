import express from "express"
import session from "express-session"
import personaRouter from "./routes/personas"
import authRouter from "./routes/auth"
import { db } from "./data/database"
import passport from "passport"
import "./strategies/discord"

const app = express()
const port = (Bun.env.API_PORT && +Bun.env.API_PORT) || 3001

app.use(express.json())
app.use(express.urlencoded())
app.use(session({
  secret: "on verra plus tard",
  resave: false,
  saveUninitialized: false,
}))

app.use((req, res, next) => {
  console.log(`${req.method} - ${req.url}`)
  next()
})

app.use(passport.initialize())
app.use(passport.session())

app.use('/api/auth', authRouter)

// app.use((req, res, next) => {
//   if (!req.user) res.send(401)
//   next()
// })

app.use('/api/personas', personaRouter)

app.listen(port, () => {
  console.log(`API server listening on port ${port}.`)
})