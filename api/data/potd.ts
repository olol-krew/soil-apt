import Database, { SQLQueryBindings } from "bun:sqlite";
import { Persona } from "./persona";
import { DateTime } from "luxon";

export interface Potd {
  id: string
  personaId: number
  datePicked: string
}

export default class PotdTable {
  db: Database

  constructor(db: Database) {
    this.db = db
    // this.db.run(`DROP TABLE IF EXISTS Potd;`)
    this.db.query(`
      CREATE TABLE IF NOT EXISTS Potd (
        id text PRIMARY KEY NOT NULL,
        personaId INTEGER NOT NULL,
        datePicked text NOT NULL
      );
    `).run()
  }

  create(persona: Persona) {
    return this.db.query(`
      INSERT INTO Potd (id, personaId, datePicked)
      VALUES ($id, $personaId, $datePicked);
    `).run({
      $id: crypto.randomUUID(),
      $personaId: persona.id,
      $datePicked: DateTime.now().setZone('Europe/Paris').toISO()
    })
  }

  getMostRecent() {
    return this.db.query<Potd, SQLQueryBindings[]>(`
      SELECT * FROM Potd
      ORDER BY datePicked DESC
      LIMIT 1;
    `).get({})
  }

  getAll() {
    return this.db.query<Potd, SQLQueryBindings[]>(`
      SELECT * FROM Potd;
    `).all()
  }
}