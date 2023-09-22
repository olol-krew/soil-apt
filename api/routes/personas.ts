import { Router } from 'express'
import { db } from '../data/database'
import { Persona } from '../data/persona'

const personaRouter = Router()

personaRouter.get('/', (req, res) => {
  const personas = db.persona.getAll()
  res.json(personas)
})

personaRouter.get('/:id', (req, res) => {
  const { id } = req.params
  const persona = db.persona.get(+id)
  console.log(persona)
  res.json(persona)
})

personaRouter.post('/', (req, res) => {
  const body: Persona = req.body
  db.persona.create(body)
  res.send(201)
})

export default personaRouter