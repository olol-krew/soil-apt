import { db } from "../data/database";
import { log } from "../../common/helpers/logger";
import isToday from "./is-today";
import { DateTime } from "luxon";
import { Persona } from "../data/persona";

export function pickNewPotd() {
  const newPersona = db.persona.getOneRandomly()
  db.potd.create(newPersona.id)
  return db.potd.getMostRecent()
}

export function forcePotdChange(persona: Persona) {
  db.potd.create(persona);
}

export interface PotdLoadingOptions {
  forceReload?: boolean
}

export function loadPotd(opt?: PotdLoadingOptions): Persona {
  let potd = db.potd.getMostRecent()
  if (!potd || opt?.forceReload) {
    log.info('POTD database is empty or persona don\'t exist anymore, picking a new one...')
    potd = pickNewPotd()
  } else if (!isToday(DateTime.fromISO(potd.pickedAt))) {
    log.info('POTD has expired, picking a new one')
    potd = pickNewPotd()
  } else log.info(`POTD is already defined`)


  const persona = db.persona.get(potd!.personaId)
  if (!persona) {
    log.error(`No persona found with id ${potd!.personaId}`)
    return loadPotd({ forceReload: true })
  }

  log.info(`POTD is ${persona.title}`)

  return persona
}