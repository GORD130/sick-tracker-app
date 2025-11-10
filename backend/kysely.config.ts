import { defineConfig } from 'kysely-ctl'
import { db } from './src/database/db.js'

export default defineConfig({
  kysely: db,
  migrations: {
    migrationFolder: './src/database/migrations',
  },
})