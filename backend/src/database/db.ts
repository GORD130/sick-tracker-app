import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'
import { Database } from './schema.js'

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/fluentui_app',
    max: 10,
  }),
})

export const db = new Kysely<Database>({
  dialect,
})

export const toUser = (user: any) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
})