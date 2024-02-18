import Database, { SQLQueryBindings } from "bun:sqlite";

export interface CurrentPersona {
  id: string
  personaId: number
  changedAt: string
}

export default class CurrentPersonaTable {
  db: Database

  constructor(db: Database) {
    this.db = db
    this.db.run(`
      CREATE TABLE IF NOT EXISTS CurrentPersona (
        id text PRIMARY KEY NOT NULL,
        personaId INTEGER NOT NULL,
        changedAt TEXT NOT NULL
      );
    `)
  }

  get(id: string) {
    return this.db.query<CurrentPersona, SQLQueryBindings>(`
      SELECT * FROM CurrentPersona
      WHERE id=$id;
    `).get({
      $id: id
    })
  }

  getCurrent() {
    return this.db.query<CurrentPersona, SQLQueryBindings>(`
      SELECT *
      FROM CurrentPersona
      ORDER BY changedAt DESC
      LIMIT 1;
    `).get({})
  }

  create(persona_id: number) {
    const id = crypto.randomUUID()

    this.db.query<CurrentPersona, SQLQueryBindings>(`
      INSERT INTO CurrentPersona(
        id, personaId, changedAt
      )
      VALUES ($id, $personaId, $changedAt);
    `).run({
      $id: id,
      $personaId: persona_id,
      $changedAt: new Date().toISOString()
    })

    return this.get(id)
  }
}