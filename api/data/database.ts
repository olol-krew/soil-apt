import { Database } from 'bun:sqlite'
import PromptTable from './prompt'
import AuthUserTable from './auth-user'
import PersonaTable from './persona'
import PotdTable from './potd'
import PromptUserTable from './prompt-user'

class SoilAptDb {
  db: Database
  persona: PersonaTable
  prompt: PromptTable
  authUser: AuthUserTable
  promptUser: PromptUserTable
  potd: PotdTable

  constructor() {
    this.db = new Database("soilaptdb.db")
    this.prompt = new PromptTable(this.db)
    this.authUser = new AuthUserTable(this.db)
    this.persona = new PersonaTable(this.db)
    this.potd = new PotdTable(this.db)
    this.promptUser = new PromptUserTable(this.db)
  }
}

export const db = new SoilAptDb()