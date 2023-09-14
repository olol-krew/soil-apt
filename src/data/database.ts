import { Database } from 'bun:sqlite'
import PromptTable from './prompt'
import UserTable from './user'
import PersonaTable from './persona'
import PotdTable from './potd'

class SoilAptDb {
  db: Database
  prompt: PromptTable
  user: UserTable
  persona: PersonaTable
  potd: PotdTable

  constructor() {
    this.db = new Database("soilaptdb.db", { create: true })
    this.prompt = new PromptTable(this.db)
    this.user = new UserTable(this.db)
    this.persona = new PersonaTable(this.db)
    this.potd = new PotdTable(this.db)
  }
}

export const db = new SoilAptDb()