import { Router } from "express";
import { db } from "../data/database";
import { log } from "../../common/helpers/logger";

const potdRouter = Router()

potdRouter.get('/', (req, res) => {
  const potd = db.potd.getMostRecent()

  if (!potd) {
    log.error(`No POTD in DB.`)
    res.sendStatus(500)
  }

  res.json(potd)
})

// potdRouter.get('/:id', (req, res) => { })

potdRouter.put('/:id', (req, res) => {
  console.log(req.params)
})

// potdRouter.delete('/:id', (req, res) => { })

// potdRouter.put('/:id', (req, res) => { })

export default potdRouter