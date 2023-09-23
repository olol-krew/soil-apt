import Database, { SQLQueryBindings } from "bun:sqlite"
import { DateTime } from "luxon"

export interface APTUser {
  id: string
  discordId: string
  username: string
  avatar: string | null
  globalName?: string
  email?: string
  accessToken: string
  refreshToken: string
  createdAt: string
  updatedAt?: string
  isGuildMember: number
}

// override Express User type with ours
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User {
      id: string
      discordId: string
      username: string
      avatar: string | null
      globalName?: string
      email?: string
      accessToken: string
      refreshToken: string
      createdAt: string
      updatedAt?: string
      isGuildMember: number
    }
  }
}

export interface DiscordUser {
  discordId: string
  username: string
  avatar: string | null
  globalName?: string
  bannerColor?: string
  email?: string
  accessToken: string
  refreshToken: string
  guilds?: {
    id: string
    name: string
    icon: string
    owner: boolean
    permissions: number
    permissions_new: string
    features: string[]
  }[]
}

export default class UserTable {
  db: Database

  constructor(db: Database) {
    this.db = db
    // this.db.run(`DROP TABLE IF EXISTS User;`)
    this.db.run(`CREATE TABLE IF NOT EXISTS User(
      id text PRIMARY KEY NOT NULL UNIQUE,
      discordId text NOT NULL,
      username text NOT NULL,
      avatar text,
      globalName text,
      email text,
      accessToken text NOT NULL,
      refreshToken text NOT NULL,
      createdAt text NOT NULL,
      updatedAt text,
      isGuildMember int NOT NULL
    );`)
  }

  create({
    discordId,
    username,
    avatar,
    globalName,
    email,
    accessToken,
    refreshToken,
    guilds
  }: DiscordUser) {
    const id = crypto.randomUUID()

    this.db.query<APTUser, SQLQueryBindings>(`
      INSERT INTO User (
        id,
        discordId,
        username,
        avatar,
        globalName,
        email,
        accessToken,
        refreshToken,
        createdAt,
        isGuildMember
      )
      VALUES (
        $id,
        $discordId,
        $username,
        $avatar,
        $globalName,
        $email,
        $accessToken,
        $refreshToken,
        $createdAt,
        $isGuildMember
      );
    `).get({
      $id: id,
      $discordId: discordId,
      $username: username,
      $avatar: avatar,
      $globalName: globalName || null,
      $email: email || null,
      $accessToken: accessToken,
      $refreshToken: refreshToken,
      $createdAt: DateTime.now().setZone('Europe/Paris').toISO(),
      $isGuildMember: guilds && guilds.filter(g => g.id === Bun.env.DISCORD_GUILD_ID).length > 0 || false
    })

    return this.get(id)
  }

  getAll() {
    return this.db.query<APTUser, SQLQueryBindings[]>(`
      SELECT * FROM User;
    `).all()
  }

  get(id: string) {
    return this.db.query<APTUser, SQLQueryBindings>(`
      SELECT * FROM User WHERE id=$id;
    `).get({
      $id: id
    })
  }

  update({
    id,
    discordId,
    username,
    avatar,
    globalName,
    email,
    accessToken,
    refreshToken
  }: APTUser) {
    this.db.query(`
      UPDATE User
      SET 
        discordId=$discordId,
        username=$username,
        avatar=$avatar,
        globalName=$globalName,
        email=$email,
        accessToken=$accessToken,
        refreshToken=$refreshToken,
        updatedAt=$updatedAt
      WHERE
        id=$id
    `).run({
      $id: id,
      $discordId: discordId,
      $username: username,
      $avatar: avatar,
      $globalName: globalName || null,
      $email: email || null,
      $accessToken: accessToken,
      $refreshToken: refreshToken,
      $updatedAt: DateTime.now().setZone('Europe/Paris').toISO()
    })

    return this.get(id)
  }

  delete(id: string) {
    return this.db.query(`
      DELETE FROM User
      WHERE id=$id
    `).get({
      $id: id
    })
  }
}