import { User } from "discord.js"
import Database, { SQLQueryBindings } from "bun:sqlite"

export interface dbUser {
  id: string
  name: string
  avatar: string
}

export default class UserTable {
  db: Database

  constructor(db: Database) {
    this.db = db

    this.db.run(`CREATE TABLE IF NOT EXISTS User(
      id text PRIMARY KEY NOT NULL,
      name text NOT NULL,
      avatar text NOT NULL
    );`)
  }

  create({ id, displayName, avatar }: User) {
    return this.db.query(`
      INSERT INTO User (id, name, avatar)
      VALUES ($id, $name, $avatar);
    `).get({
      $id: id,
      $name: displayName,
      $avatar: avatar
    })
  }

  getAll() {
    return this.db.query<dbUser, SQLQueryBindings[]>(`
      SELECT * FROM User;
    `).all()
  }

  get(id: string) {
    return this.db.query<dbUser, SQLQueryBindings>(`
      SELECT * FROM User WHERE id=$id;
    `).get({
      $id: id
    })
  }

  update({ id, displayName, avatar }: User) {
    return this.db.query(`
      UPDATE User
      SET name=$name,
          avatar=$avatar
      WHERE
        id=$id
    `).get({
      $id: id,
      $name: displayName,
      $avatar: avatar
    })
  }

  delete({ id }: User) {
    return this.db.query(`
      DELETE FROM User
      WHERE id=$id
    `).get({
      $id: id
    })
  }
}