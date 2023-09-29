import Database, { SQLQueryBindings } from "bun:sqlite";
import { Persona } from "./persona";
import { DateTime } from "luxon";

export interface Potd {
  id: string
  personaId: string
  pickedAt: string
  modifiedAt?: string
}

export default class PotdTable {
  db: Database

  constructor(db: Database) {
    this.db = db
    this.db.query(`
      CREATE TABLE IF NOT EXISTS Potd (
        id text PRIMARY KEY NOT NULL,
        personaId INTEGER NOT NULL,
        pickedAt text NOT NULL,
        modifiedAt text
      );
    `).run()
  }

  create(personaId: string) {
    const id = crypto.randomUUID()
    this.db.query(`
      INSERT INTO Potd (id, personaId, pickedAt)
      VALUES ($id, $personaId, $pickedAt);
    `).run({
      $id: id,
      $personaId: personaId,
      $pickedAt: DateTime.now().setZone('Europe/Paris').toISO()
    })

    return this.get(id)
  }

  getMostRecent() {
    return this.db.query<Potd, SQLQueryBindings[]>(`
      SELECT * FROM Potd
      ORDER BY pickedAt DESC
      LIMIT 1;
    `).get({})
  }

  getAll() {
    return this.db.query<Potd, SQLQueryBindings[]>(`
      SELECT * FROM Potd;
    `).all()
  }

  get(id: string) {
    return this.db.query<Potd, SQLQueryBindings>(`
      SELECT * FROM Potd
      WHERE id=$id;
    `).get({
      $id: id
    })
  }

  update({ id, personaId }: Potd) {
    this.db.query(`
      UPDATE Potd
      SET
        personaId=$personaId,
        modifiedAt=$modifiedAt
      WHERE
        id=$id;
    `).run({
      $id: id,
      $personaId: personaId,
      $modifiedAt: DateTime.now().setZone('Europe/Paris').toISO()
    })

    return this.get(id)
  }
}