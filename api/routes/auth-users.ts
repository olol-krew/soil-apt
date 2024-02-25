import { Router } from "express";
import { db } from "../database/database";

const userRouter = Router()

userRouter.get('/', (req, res) => {
  res.json(db.authUser.getAll())
})

userRouter.get('/:id', (req, res) => {
  const user = db.authUser.get(req.params.id)
  if (!user) return res.sendStatus(404)
  return res.json(user)
})

userRouter.delete('/:id', (req, res) => {
  db.authUser.delete(req.params.id)
  return res.sendStatus(204)
})

export default userRouter