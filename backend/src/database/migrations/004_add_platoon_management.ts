import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  // Create platoons table
  await db.schema
    .createTable('platoons')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(50)', (col) => col.notNull().unique())
    .addColumn('code', 'varchar(10)', (col) => col.notNull().unique())
    .addColumn('description', 'text')
    .addColumn('shift_pattern', 'varchar(20)', (col) => col.notNull())
    .addColumn('is_active', 'boolean', (col) => col.notNull().defaultTo(true))
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`))
    .execute()

  // Insert default platoons
  await db
    .insertInto('platoons')
    .values([
      {
        name: 'A Platoon',
        code: 'A',
        description: 'First shift platoon',
        shift_pattern: '24_48',
        is_active: true
      },
      {
        name: 'B Platoon',
        code: 'B',
        description: 'Second shift platoon',
        shift_pattern: '24_48',
        is_active: true
      },
      {
        name: 'C Platoon',
        code: 'C',
        description: 'Third shift platoon',
        shift_pattern: '24_48',
        is_active: true
      },
      {
        name: 'Admin Platoon',
        code: 'ADMIN',
        description: 'Administrative staff',
        shift_pattern: 'M_F',
        is_active: true
      }
    ])
    .execute()

  // Add platoon_id column to users table
  await db.schema
    .alterTable('users')
    .addColumn('platoon_id', 'integer')
    .execute()

  // Create foreign key constraint separately
  await db.schema
    .alterTable('users')
    .addForeignKeyConstraint(
      'users_platoon_id_fkey',
      ['platoon_id'],
      'platoons',
      ['id']
    )
    .execute()

  // Update existing users to use the new platoon system
  // We'll do this in multiple steps since we can't use ref directly
  const usersWithPlatoons = await db
    .selectFrom('users')
    .select(['id', 'platoon'])
    .where('platoon', 'is not', null)
    .execute()

  for (const user of usersWithPlatoons) {
    const platoon = await db
      .selectFrom('platoons')
      .select('id')
      .where('code', '=', user.platoon as string)
      .executeTakeFirst()

    if (platoon) {
      await db
        .updateTable('users')
        .set({ platoon_id: platoon.id })
        .where('id', '=', user.id)
        .execute()
    }
  }

  // Drop the old platoon column after migration
  await db.schema
    .alterTable('users')
    .dropColumn('platoon')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  // Add back the old platoon column
  await db.schema
    .alterTable('users')
    .addColumn('platoon', 'varchar(10)')
    .execute()

  // Migrate data back
  const usersWithPlatoonIds = await db
    .selectFrom('users')
    .select(['id', 'platoon_id'])
    .where('platoon_id', 'is not', null)
    .execute()

  for (const user of usersWithPlatoonIds) {
    const platoon = await db
      .selectFrom('platoons')
      .select('code')
      .where('id', '=', user.platoon_id as number)
      .executeTakeFirst()

    if (platoon) {
      await db
        .updateTable('users')
        .set({ platoon: platoon.code })
        .where('id', '=', user.id)
        .execute()
    }
  }

  // Drop the foreign key and platoon_id column
  await db.schema
    .alterTable('users')
    .dropConstraint('users_platoon_id_fkey')
    .execute()

  await db.schema
    .alterTable('users')
    .dropColumn('platoon_id')
    .execute()

  // Drop the platoons table
  await db.schema
    .dropTable('platoons')
    .execute()
}