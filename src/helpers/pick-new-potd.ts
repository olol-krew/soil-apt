import { db } from "../data/database";

export default function pickNewPotd() {
  const newPersona = db.persona.getOneRandomly()
  db.potd.create(newPersona)
  return db.potd.getMostRecent()
}