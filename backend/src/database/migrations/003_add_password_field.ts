import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  // Add password_hash column to users table
  await db.schema
    .alterTable('users')
    .addColumn('password_hash', 'varchar')
    .execute()

  // Add temporary password for existing users (they'll need to reset)
  await db
    .updateTable('users')
    .set({ password_hash: '$2a$10$defaultpasswordhashfordemo' })
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('users')
    .dropColumn('password_hash')
    .execute()
}