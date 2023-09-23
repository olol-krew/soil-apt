import { Router } from "express";
import { db } from "../data/database";
import { log } from "../../common/helpers/logger";

const potdRouter = Router()

potdRouter.get('/', (req, res) => {
  const potd = db.potd.getMostRecent()

  if (!potd) {
    log.error(`No POTD in DB.`)
    return res.sendStatus(500)
  }

  return res.json(potd)
})

// potdRouter.get('/:id', (req, res) => { })

potdRouter.put('/:id', (req, res) => {
  const { personaId } = req.body
  if (!personaId) return res.sendStatus(400)
  const potd = db.potd.get(req.params.id)
  if (!potd) return res.sendStatus(404)
  db.potd.update({ id: potd.id, personaId, pickedAt: potd.pickedAt })
})

// potdRouter.delete('/:id', (req, res) => { })

// potdRouter.put('/:id', (req, res) => { })

export default potdRouter