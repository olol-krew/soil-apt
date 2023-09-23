import Database, { SQLQueryBindings } from "bun:sqlite"
import { parse } from 'yaml'

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
    this.db.run(`DROP TABLE IF EXISTS Persona;`)
    this.db.run(`
      CREATE TABLE Persona (
        id text PRIMARY KEY NOT NULL,
        author text NOT NULL,
        title text NOT NULL,
        prompt text NOT NULL
      );
    `)
    this.load().then(() => console.log('Personas loaded')).catch(err => console.error(err))
  }

  async load() {
    const yamlFile = Bun.file('api/data/personas.yaml')
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
    const index = Math.floor(Math.random() * personas.length)

    return personas[index]
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