import Database, { SQLQueryBindings } from "bun:sqlite"

export interface PromptUser {
  id: string
  name: string
  avatar: string
}

export default class PromptUserTable {
  db: Database

  constructor(db: Database) {
    this.db = db

    this.db.run(`CREATE TABLE IF NOT EXISTS PromptUser(
      id text PRIMARY KEY NOT NULL,
      name text NOT NULL,
      avatar text NOT NULL
    );`)
  }

  create({ id, name, avatar }: PromptUser) {
    this.db.query(`
      INSERT INTO PromptUser (id, name, avatar)
      VALUES ($id, $name, $avatar);
    `).get({
      $id: id,
      $name: name,
      $avatar: avatar
    })

    return this.get(id)
  }

  getAll() {
    return this.db.query<PromptUser, SQLQueryBindings[]>(`
      SELECT * FROM PromptUser;
    `).all()
  }

  get(id: string) {
    return this.db.query<PromptUser, SQLQueryBindings>(`
      SELECT * FROM PromptUser WHERE id=$id;
    `).get({
      $id: id
    })
  }

  update({ id, name, avatar }: PromptUser) {
    this.db.query(`
      UPDATE PromptUser
      SET name=$name,
          avatar=$avatar
      WHERE
        id=$id
    `).get({
      $id: id,
      $name: name,
      $avatar: avatar
    })

    return this.get(id)
  }

  delete(id: string) {
    return this.db.query(`
      DELETE FROM PromptUser
      WHERE id=$id
    `).get({
      $id: id
    })
  }
}