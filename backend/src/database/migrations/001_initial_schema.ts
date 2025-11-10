import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  // Create roles table
  await db.schema
    .createTable('roles')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('permissions', 'jsonb')
    .addColumn('description', 'varchar')
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute()

  // Create stations table
  await db.schema
    .createTable('stations')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('code', 'varchar', (col) => col.notNull())
    .addColumn('address', 'varchar')
    .addColumn('is_active', 'boolean', (col) => col.defaultTo(true).notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute()

  // Create users table
  await db.schema
    .createTable('users')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('employee_id', 'varchar', (col) => col.notNull().unique())
    .addColumn('first_name', 'varchar', (col) => col.notNull())
    .addColumn('last_name', 'varchar', (col) => col.notNull())
    .addColumn('email', 'varchar', (col) => col.notNull().unique())
    .addColumn('phone', 'varchar')
    .addColumn('role_id', 'integer', (col) => col.notNull())
    .addColumn('station_id', 'integer')
    .addColumn('platoon', 'varchar', (col) => col.check(sql`platoon IN ('A', 'B', 'C', 'Admin')`))
    .addColumn('shift_pattern', 'varchar', (col) => col.check(sql`shift_pattern IN ('24_48', 'M_F')`))
    .addColumn('is_active', 'boolean', (col) => col.defaultTo(true).notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addForeignKeyConstraint('users_role_id_fk', ['role_id'], 'roles', ['id'])
    .addForeignKeyConstraint('users_station_id_fk', ['station_id'], 'stations', ['id'])
    .execute()

  // Create absence_types table
  await db.schema
    .createTable('absence_types')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('requires_note', 'boolean', (col) => col.defaultTo(false).notNull())
    .addColumn('note_requirement_days', 'integer')
    .addColumn('specific_forms', 'jsonb')
    .addColumn('is_active', 'boolean', (col) => col.defaultTo(true).notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .execute()

  // Create absences table
  await db.schema
    .createTable('absences')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('employee_id', 'integer', (col) => col.notNull())
    .addColumn('absence_type_id', 'integer', (col) => col.notNull())
    .addColumn('start_date', 'timestamp', (col) => col.notNull())
    .addColumn('expected_end_date', 'timestamp')
    .addColumn('actual_end_date', 'timestamp')
    .addColumn('reason_category', 'varchar', (col) => col.check(sql`reason_category IN ('Illness', 'Injury', 'Family', 'Mental Health', 'Other')`).notNull())
    .addColumn('severity_level', 'varchar', (col) => col.check(sql`severity_level IN ('Minor', 'Moderate', 'Severe', 'Critical')`).notNull())
    .addColumn('status', 'varchar', (col) => col.check(sql`status IN ('Reported', 'Under Review', 'Active', 'Follow-up Required', 'Resolved', 'Closed')`).notNull())
    .addColumn('reporting_officer_id', 'integer', (col) => col.notNull())
    .addColumn('assigned_manager_id', 'integer')
    .addColumn('management_level', 'varchar', (col) => col.check(sql`management_level IN ('Monitor Only', 'Light Management', 'Active Management', 'Intensive Management')`).notNull())
    .addColumn('is_self_reported', 'boolean', (col) => col.defaultTo(false).notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addForeignKeyConstraint('absences_employee_id_fk', ['employee_id'], 'users', ['id'])
    .addForeignKeyConstraint('absences_absence_type_id_fk', ['absence_type_id'], 'absence_types', ['id'])
    .addForeignKeyConstraint('absences_reporting_officer_id_fk', ['reporting_officer_id'], 'users', ['id'])
    .addForeignKeyConstraint('absences_assigned_manager_id_fk', ['assigned_manager_id'], 'users', ['id'])
    .execute()

  // Create mental_health_absences table
  await db.schema
    .createTable('mental_health_absences')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('absence_id', 'integer', (col) => col.notNull())
    .addColumn('risk_level', 'varchar', (col) => col.check(sql`risk_level IN ('Low', 'Moderate', 'High', 'Critical')`).notNull())
    .addColumn('suicide_risk_assessment', 'boolean', (col) => col.defaultTo(false).notNull())
    .addColumn('requires_immediate_support', 'boolean', (col) => col.defaultTo(false).notNull())
    .addColumn('eap_referral_made', 'boolean', (col) => col.defaultTo(false).notNull())
    .addColumn('support_resources_provided', 'jsonb')
    .addColumn('safety_plan_created', 'boolean', (col) => col.defaultTo(false).notNull())
    .addColumn('follow_up_protocol', 'varchar', (col) => col.check(sql`follow_up_protocol IN ('Standard', 'Enhanced', 'Critical')`).notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addForeignKeyConstraint('mental_health_absences_absence_id_fk', ['absence_id'], 'absences', ['id'])
    .execute()

  // Create question_templates table
  await db.schema
    .createTable('question_templates')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('question_text', 'varchar', (col) => col.notNull())
    .addColumn('question_type', 'varchar', (col) => col.check(sql`question_type IN ('text', 'select', 'multi-select', 'boolean')`).notNull())
    .addColumn('options', 'jsonb')
    .addColumn('depends_on_question_id', 'integer')
    .addColumn('depends_on_answer', 'varchar')
    .addColumn('is_required', 'boolean', (col) => col.defaultTo(false).notNull())
    .addColumn('category', 'varchar', (col) => col.check(sql`category IN ('Initial', 'Follow-up', 'Medical', 'Mental Health', 'Return-to-Work')`).notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addForeignKeyConstraint('question_templates_depends_on_fk', ['depends_on_question_id'], 'question_templates', ['id'])
    .execute()

  // Create absence_questions table
  await db.schema
    .createTable('absence_questions')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('absence_id', 'integer', (col) => col.notNull())
    .addColumn('question_template_id', 'integer', (col) => col.notNull())
    .addColumn('answer', 'varchar', (col) => col.notNull())
    .addColumn('answered_by_id', 'integer', (col) => col.notNull())
    .addColumn('answered_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addForeignKeyConstraint('absence_questions_absence_id_fk', ['absence_id'], 'absences', ['id'])
    .addForeignKeyConstraint('absence_questions_question_template_id_fk', ['question_template_id'], 'question_templates', ['id'])
    .addForeignKeyConstraint('absence_questions_answered_by_fk', ['answered_by_id'], 'users', ['id'])
    .execute()

  // Create workflow_steps table
  await db.schema
    .createTable('workflow_steps')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('absence_id', 'integer', (col) => col.notNull())
    .addColumn('step_type', 'varchar', (col) => col.check(sql`step_type IN ('Initial Report', 'Manager Assignment', 'Follow-up Call', 'Document Review', 'Return Assessment')`).notNull())
    .addColumn('assigned_to_id', 'integer', (col) => col.notNull())
    .addColumn('due_date', 'timestamp', (col) => col.notNull())
    .addColumn('completed_at', 'timestamp')
    .addColumn('status', 'varchar', (col) => col.check(sql`status IN ('Pending', 'In Progress', 'Completed', 'Overdue')`).notNull())
    .addColumn('notes', 'text')
    .addColumn('priority', 'varchar', (col) => col.check(sql`priority IN ('Low', 'Medium', 'High', 'Critical')`).notNull())
    .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
    .addForeignKeyConstraint('workflow_steps_absence_id_fk', ['absence_id'], 'absences', ['id'])
    .addForeignKeyConstraint('workflow_steps_assigned_to_fk', ['assigned_to_id'], 'users', ['id'])
    .execute()

  // Create indexes for better performance
  await db.schema
    .createIndex('absences_employee_id_index')
    .on('absences')
    .column('employee_id')
    .execute()

  await db.schema
    .createIndex('absences_status_index')
    .on('absences')
    .column('status')
    .execute()

  await db.schema
    .createIndex('workflow_steps_due_date_index')
    .on('workflow_steps')
    .column('due_date')
    .execute()

  await db.schema
    .createIndex('users_station_id_index')
    .on('users')
    .column('station_id')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop tables in reverse order
  await db.schema.dropTable('workflow_steps').execute()
  await db.schema.dropTable('absence_questions').execute()
  await db.schema.dropTable('question_templates').execute()
  await db.schema.dropTable('mental_health_absences').execute()
  await db.schema.dropTable('absences').execute()
  await db.schema.dropTable('absence_types').execute()
  await db.schema.dropTable('users').execute()
  await db.schema.dropTable('stations').execute()
  await db.schema.dropTable('roles').execute()
}