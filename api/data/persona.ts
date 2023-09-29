import Database, { SQLQueryBindings } from "bun:sqlite"
import data from "./personas.toml"

export interface Persona {
  id: string
  author: string
  title: string
  prompt: string
}

export default class PersonaTable {
  db: Database

  constructor(db: Database) {
    this.db = db
    this.db.run(`
      CREATE TABLE IF NOT EXISTS Persona (
        id text PRIMARY KEY NOT NULL,
        author text NOT NULL,
        title text NOT NULL,
        prompt text NOT NULL
      );
    `)
    if (this.getAll().length === 0) this.load()
  }

  load() {
    for (const persona of data.personas) {
      this.db.query(`
        INSERT INTO Persona (
          id, author, title, prompt
        )
        VALUES ($id, $author, $title, $prompt);
      `).run({
        $id: crypto.randomUUID(),
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

  get(id: string) {
    return this.db.query<Persona, SQLQueryBindings>(`
      SELECT * FROM Persona
      WHERE id=$id;
    `).get({
      $id: id
    })
  }

  create({ author, title, prompt }: { author: string, title: string, prompt: string }) {
    const id = crypto.randomUUID()

    this.db.query(`
      INSERT INTO Persona(
        id, author, title, prompt
      )
      VALUES ($id, $author, $title, $prompt);
    `).run({
      $id: crypto.randomUUID(),
      $author: author,
      $title: title,
      $prompt: prompt
    })

    return this.get(id)
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

    return this.get(persona.id)
  }
}