import { Router } from "express";
import { db } from "../data/database";

const userRouter = Router()

userRouter.get('/', (req, res) => {
  res.json(db.user.getAll())
})

userRouter.get('/:id', (req, res) => {
  const user = db.user.get(req.params.id)
  if (!user) return res.sendStatus(404)
  return res.json(user)
})

userRouter.delete('/:id', (req, res) => {
  db.user.delete(req.params.id)
  return res.sendStatus(204)
})

export default userRouter