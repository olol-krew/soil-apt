import { Database } from 'bun:sqlite'
import AuthUserTable from './auth-user'
import PersonaTable from './persona'
import CurrentPersonaTable from './current-persona'

class SoilAptDb {
  db: Database
  persona: PersonaTable
  authUser: AuthUserTable
  currentPersona: CurrentPersonaTable

  constructor() {
    this.db = new Database("./files/soilaptdb.db")
    this.authUser = new AuthUserTable(this.db)
    this.persona = new PersonaTable(this.db)
    this.currentPersona = new CurrentPersonaTable(this.db)
  }
}

export const db = new SoilAptDb()