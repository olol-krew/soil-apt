import Database, { SQLQueryBindings } from "bun:sqlite"
import data from "./personas.toml"
import { log } from "../../common/helpers/logger"

export interface Persona {
  id: number
  author: string
  title: string
  prompt: string
}

export default class PersonaTable {
  db: Database

  constructor(db: Database) {
    this.db = db
    this.db.run(`
      DROP TABLE IF EXISTS Persona;
    `)
    this.db.run(`
      CREATE TABLE Persona (
        id INTEGER PRIMARY KEY NOT NULL,
        author text NOT NULL,
        title text NOT NULL,
        prompt text NOT NULL
      );
    `)
    if (this.getAll().length === 0) this.load()
  }

  load() {
    log.info(`Loading ${data.personas.length} personas...`)
    for (const persona of data.personas) {
      this.db.query(`
        INSERT INTO Persona (
          id, author, title, prompt
        )
        VALUES ($id, $author, $title, $prompt);
      `).run({
        $id: persona.id,
        $author: persona.author,
        $title: persona.title,
        $prompt: persona.prompt
      })
    }
  }

  getAll() {
    return this.db.query<Persona, SQLQueryBindings[]>(`
      SELECT * FROM Persona;
    `).all()
  }

  get(id: number) {
    return this.db.query<Persona, SQLQueryBindings>(`
      SELECT * FROM Persona
      WHERE id=$id;
    `).get({
      $id: id
    })
  }

  create({ author, title, prompt }: { author: string, title: string, prompt: string }) {
    this.db.query(`
      INSERT INTO Persona(
        author, title, prompt
      )
      VALUES ($author, $title, $prompt);
    `).run({
      $author: author,
      $title: title,
      $prompt: prompt
    })
  }

  getOneRandomly() {
    const personas = this.getAll()
    return personas[Math.floor(Math.random() * personas.length)]
  }

  delete(id: string) {
    this.db.query(`
      DELETE FROM Persona
      WHERE id=$id
    `).run({
      $id: id
    })
  }

  update(persona: Persona) {
    this.db.query(`
      UPDATE Persona
      SET
        author=$author,
        title=$title,
        prompt=$prompt,
      WHERE
        id=$id;
    `).run({
      $id: persona.id,
      $author: persona.author,
      $title: persona.title,
      $prompt: persona.prompt
    })
  }
}