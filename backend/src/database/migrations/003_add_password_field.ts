import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  // Check if password_hash column already exists
  const columnExists = await db
    .selectFrom('information_schema.columns')
    .select('column_name')
    .where('table_name', '=', 'users')
    .where('column_name', '=', 'password_hash')
    .executeTakeFirst()

  // Only add the column if it doesn't exist
  if (!columnExists) {
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
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('users')
    .dropColumn('password_hash')
    .execute()
}