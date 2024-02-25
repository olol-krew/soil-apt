import { Router } from 'express'
import { db } from '../database/database'
import { DateTime } from 'luxon'

const personaRouter = Router()

personaRouter.get('/current', (req, res) => {
  let currentId: number | undefined = undefined
  const current = db.currentPersona.getCurrent()

  if (current === null || DateTime.fromISO(current.changedAt) < DateTime.now().minus({ hours: 1 })) {
    currentId = Bun.env.DEFAULT_PERSONA ? +Bun.env.DEFAULT_PERSONA : 1
  } else currentId = current.personaId

  const persona = db.persona.get(currentId)

  return persona ? res.json(persona) : res.sendStatus(404)
})

personaRouter.get('/', (req, res) => {
  const personas = db.persona.getAll()
  res.json(personas)
})

personaRouter.get('/:id', (req, res) => {
  const { id } = req.params
  const persona = db.persona.get(+id)
  return res.json(persona)
})

personaRouter.post('/', (req, res) => {
  const { author, title, prompt } = req.body
  db.persona.create({ author, title, prompt })
  return res.status(201)
})

personaRouter.delete('/:id', (req, res) => {
  const { id } = req.params
  db.persona.delete(id)
  return res.sendStatus(204)
})

personaRouter.put('/:id', (req, res) => {
  const { id } = req.params
  const { author, title, prompt } = req.body
  const oldUser = db.persona.get(+id)
  if (!oldUser) return res.sendStatus(404)
  db.persona.update({ id: +id, author, title, prompt })
  return res.sendStatus(201)
})

personaRouter.post('/change/:id', (req, res) => {
  const { id } = req.params
  const currentPersona = db.currentPersona.create(+id)
  if (!currentPersona) return res.sendStatus(500)
  return res.sendStatus(201)
})

export default personaRouter