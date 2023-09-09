import { Database } from 'bun:sqlite'
import PromptTable from './prompt'
import UserTable from './user'

class SoilAptDb {
  db: Database
  prompt: PromptTable
  user: UserTable

  constructor() {
    this.db = new Database("soilaptdb.db")
    this.prompt = new PromptTable(this.db)
    this.user = new UserTable(this.db)
  }
}

export const db = new SoilAptDb()