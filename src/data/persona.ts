import Database, { SQLQueryBindings } from "bun:sqlite"
import { parse } from 'yaml'

export interface Persona {
  id: number
  author: string
  title: string
  prompt: string
}

interface PersonaCount {
  count: number
}

export default class PersonaTable {
  db: Database

  constructor(db: Database) {
    this.db = db
    this.db.run(`DROP TABLE IF EXISTS Persona;`)
    this.db.run(`
      CREATE TABLE Persona (
        id text PRIMARY KEY NOT NULL,
        author text NOT NULL,
        title text NOT NULL,
        prompt text NOT NULL
      );
    `)
  }

  async load() {
    const yamlFile = Bun.file('src/data/personas.yaml')
    const personas = parse(await yamlFile.text())

    for (const persona of personas) {
      const query = this.db.query(`
        INSERT INTO Persona (
          id, author, title, prompt
        )
        VALUES ($id, $author, $title, $prompt);
      `)

      query.run({
        $id: persona.id,
        $author: persona.author,
        $title: persona.title,
        $prompt: persona.prompt
      })
    }

    return this.getAll().length
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

  getCount(): number {
    return this.db.query<PersonaCount, SQLQueryBindings[]>(`
      SELECT COUNT(id) AS count FROM Persona
    `).get()?.count ?? 0
  }

  getOneRandomly() {
    const personas = this.getAll()
    const index = Math.floor(Math.random() * personas.length)

    return personas[index]
  }
}