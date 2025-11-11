import { db } from './db.js'
import type { Database } from './schema.js'

export async function seedDatabase() {
  console.log('Seeding database with initial data...')

  // Clear existing data (optional - be careful in production)
  // await clearExistingData()

  // Seed roles
  const roles = await seedRoles()
  
  // Seed stations
  const stations = await seedStations()
  
  // Seed absence types
  const absenceTypes = await seedAbsenceTypes()
  
  // Seed question templates
  const questionTemplates = await seedQuestionTemplates()
  
  // Seed users
  const users = await seedUsers(roles, stations)
  
  console.log('Database seeding completed successfully!')
}

async function seedRoles() {
  console.log('Seeding roles...')
  
  const roles = [
    {
      name: 'Firefighter',
      permissions: { can_report_absence: true, can_view_own_data: true },
      description: 'Frontline firefighter'
    },
    {
      name: 'Captain',
      permissions: { can_report_absence: true, can_manage_team: true, can_approve_absences: true },
      description: 'Team captain/manager'
    },
    {
      name: 'Battalion Chief',
      permissions: { can_report_absence: true, can_manage_department: true, can_approve_absences: true, can_view_reports: true },
      description: 'Department manager'
    },
    {
      name: 'Admin',
      permissions: { full_access: true },
      description: 'System administrator'
    }
  ]

  const insertedRoles = []
  for (const role of roles) {
    const inserted = await db
      .insertInto('roles')
      .values(role)
      .returning('id')
      .executeTakeFirst()
    insertedRoles.push(inserted)
  }

  return insertedRoles
}

async function seedStations() {
  console.log('Seeding stations...')
  
  const stations = [
    { name: 'Station 1', code: 'S1', address: '123 Main St', is_active: true },
    { name: 'Station 2', code: 'S2', address: '456 Oak Ave', is_active: true },
    { name: 'Station 3', code: 'S3', address: '789 Pine Rd', is_active: true },
    { name: 'Training Center', code: 'TC', address: '101 Training Blvd', is_active: true }
  ]

  const insertedStations = []
  for (const station of stations) {
    const inserted = await db
      .insertInto('stations')
      .values(station)
      .returning('id')
      .executeTakeFirst()
    insertedStations.push(inserted)
  }

  return insertedStations
}

async function seedAbsenceTypes() {
  console.log('Seeding absence types...')
  
  const absenceTypes = [
    {
      name: 'Sick Leave',
      requires_note: true,
      note_requirement_days: 3,
      specific_forms: ['Medical Certificate'],
      is_active: true
    },
    {
      name: 'Injury - On Duty',
      requires_note: true,
      note_requirement_days: 1,
      specific_forms: ['Incident Report', 'WorkSafe Form'],
      is_active: true
    },
    {
      name: 'Injury - Off Duty',
      requires_note: true,
      note_requirement_days: 3,
      specific_forms: ['Medical Certificate'],
      is_active: true
    },
    {
      name: 'Family Emergency',
      requires_note: false,
      note_requirement_days: null,
      specific_forms: [],
      is_active: true
    },
    {
      name: 'Mental Health',
      requires_note: false,
      note_requirement_days: null,
      specific_forms: ['EAP Referral'],
      is_active: true
    },
    {
      name: 'Preventive Care',
      requires_note: false,
      note_requirement_days: null,
      specific_forms: [],
      is_active: true
    }
  ]

  const insertedAbsenceTypes = []
  for (const absenceType of absenceTypes) {
    const inserted = await db
      .insertInto('absence_types')
      .values(absenceType)
      .returning('id')
      .executeTakeFirst()
    insertedAbsenceTypes.push(inserted)
  }

  return insertedAbsenceTypes
}

async function seedQuestionTemplates() {
  console.log('Seeding question templates...')
  
  const questionTemplates: Array<{
    question_text: string
    question_type: 'text' | 'select' | 'multi-select' | 'boolean'
    options: any
    depends_on_question_id: number | null
    depends_on_answer: string | null
    is_required: boolean
    category: 'Initial' | 'Follow-up' | 'Medical' | 'Mental Health' | 'Return-to-Work'
  }> = [
    // Initial Assessment Questions
    {
      question_text: 'What is the primary reason for your absence?',
      question_type: 'select',
      options: ['Illness', 'Injury', 'Family Emergency', 'Mental Health', 'Preventive Care', 'Other'],
      depends_on_question_id: null,
      depends_on_answer: null,
      is_required: true,
      category: 'Initial'
    },
    {
      question_text: 'When did your symptoms first appear?',
      question_type: 'text',
      options: null,
      depends_on_question_id: 1,
      depends_on_answer: 'Illness',
      is_required: true,
      category: 'Initial'
    },
    {
      question_text: 'Describe the nature of your injury',
      question_type: 'text',
      options: null,
      depends_on_question_id: 1,
      depends_on_answer: 'Injury',
      is_required: true,
      category: 'Initial'
    },
    {
      question_text: 'Did this injury occur while on duty?',
      question_type: 'boolean',
      options: null,
      depends_on_question_id: 3,
      depends_on_answer: null,
      is_required: true,
      category: 'Initial'
    },
    {
      question_text: 'What type of family emergency are you experiencing?',
      question_type: 'select',
      options: ['Childcare', 'Elder Care', 'Medical Emergency', 'Bereavement', 'Other'],
      depends_on_question_id: 1,
      depends_on_answer: 'Family Emergency',
      is_required: true,
      category: 'Initial'
    },
    {
      question_text: 'Are you currently experiencing thoughts of self-harm?',
      question_type: 'boolean',
      options: null,
      depends_on_question_id: 1,
      depends_on_answer: 'Mental Health',
      is_required: true,
      category: 'Initial'
    },
    {
      question_text: 'Do you have access to immediate support?',
      question_type: 'boolean',
      options: null,
      depends_on_question_id: 6,
      depends_on_answer: 'true',
      is_required: true,
      category: 'Initial'
    },

    // Medical Questions
    {
      question_text: 'Have you consulted with a healthcare provider?',
      question_type: 'boolean',
      options: null,
      depends_on_question_id: 1,
      depends_on_answer: 'Illness',
      is_required: false,
      category: 'Medical'
    },
    {
      question_text: 'What is your current temperature?',
      question_type: 'text',
      options: null,
      depends_on_question_id: 1,
      depends_on_answer: 'Illness',
      is_required: false,
      category: 'Medical'
    },
    {
      question_text: 'Are you experiencing any respiratory symptoms?',
      question_type: 'multi-select',
      options: ['Cough', 'Shortness of breath', 'Sore throat', 'Runny nose', 'None'],
      depends_on_question_id: 1,
      depends_on_answer: 'Illness',
      is_required: false,
      category: 'Medical'
    },
    {
      question_text: 'What body part is injured?',
      question_type: 'select',
      options: ['Head/Neck', 'Upper Body', 'Lower Body', 'Back', 'Multiple Areas'],
      depends_on_question_id: 1,
      depends_on_answer: 'Injury',
      is_required: true,
      category: 'Medical'
    },
    {
      question_text: 'Is the injury affecting your mobility?',
      question_type: 'boolean',
      options: null,
      depends_on_question_id: 11,
      depends_on_answer: null,
      is_required: true,
      category: 'Medical'
    },

    // Follow-up Questions
    {
      question_text: 'How are you feeling today compared to yesterday?',
      question_type: 'select',
      options: ['Much Better', 'Slightly Better', 'About the Same', 'Slightly Worse', 'Much Worse'],
      depends_on_question_id: null,
      depends_on_answer: null,
      is_required: true,
      category: 'Follow-up'
    },
    {
      question_text: 'Have your symptoms changed in any way?',
      question_type: 'text',
      options: null,
      depends_on_question_id: 13,
      depends_on_answer: 'Slightly Worse,Much Worse',
      is_required: true,
      category: 'Follow-up'
    },
    {
      question_text: 'Are you able to perform light duties?',
      question_type: 'boolean',
      options: null,
      depends_on_question_id: null,
      depends_on_answer: null,
      is_required: false,
      category: 'Follow-up'
    },
    {
      question_text: 'What type of light duties could you perform?',
      question_type: 'multi-select',
      options: ['Administrative tasks', 'Training', 'Equipment maintenance', 'Station duties', 'None'],
      depends_on_question_id: 15,
      depends_on_answer: 'true',
      is_required: true,
      category: 'Follow-up'
    },

    // Mental Health Questions
    {
      question_text: 'How would you rate your current stress level?',
      question_type: 'select',
      options: ['Low', 'Moderate', 'High', 'Very High'],
      depends_on_question_id: 1,
      depends_on_answer: 'Mental Health',
      is_required: true,
      category: 'Mental Health'
    },
    {
      question_text: 'Are you currently using any support services?',
      question_type: 'multi-select',
      options: ['EAP', 'Therapist', 'Peer Support', 'Family Support', 'None'],
      depends_on_question_id: 17,
      depends_on_answer: null,
      is_required: false,
      category: 'Mental Health'
    },
    {
      question_text: 'What coping strategies are you using?',
      question_type: 'multi-select',
      options: ['Exercise', 'Meditation', 'Social Support', 'Professional Help', 'Other'],
      depends_on_question_id: 17,
      depends_on_answer: null,
      is_required: false,
      category: 'Mental Health'
    },

    // Return-to-Work Questions
    {
      question_text: 'Do you feel ready to return to full duty?',
      question_type: 'boolean',
      options: null,
      depends_on_question_id: null,
      depends_on_answer: null,
      is_required: true,
      category: 'Return-to-Work'
    },
    {
      question_text: 'What concerns do you have about returning to work?',
      question_type: 'text',
      options: null,
      depends_on_question_id: 20,
      depends_on_answer: 'false',
      is_required: true,
      category: 'Return-to-Work'
    },
    {
      question_text: 'Are there any accommodations you need?',
      question_type: 'multi-select',
      options: ['Reduced hours', 'Light duty', 'Modified equipment', 'Temporary assignment', 'None'],
      depends_on_question_id: 20,
      depends_on_answer: 'false',
      is_required: false,
      category: 'Return-to-Work'
    },
    {
      question_text: 'Have you discussed your return with a healthcare provider?',
      question_type: 'boolean',
      options: null,
      depends_on_question_id: null,
      depends_on_answer: null,
      is_required: false,
      category: 'Return-to-Work'
    }
  ]

  const insertedQuestions = []
  for (const question of questionTemplates) {
    const inserted = await db
      .insertInto('question_templates')
      .values(question)
      .returning('id')
      .executeTakeFirst()
    insertedQuestions.push(inserted)
  }

  return insertedQuestions
}

async function seedUsers(roles: any[], stations: any[]) {
  console.log('Seeding users...')
  
  const users: Array<{
    employee_id: string
    first_name: string
    last_name: string
    email: string
    phone: string
    role_id: number
    station_id: number | null
    platoon: 'A' | 'B' | 'C' | 'Admin' | null
    shift_pattern: '24_48' | 'M_F' | null
    password_hash: string
    is_active: boolean
  }> = [
    {
      employee_id: 'FF001',
      first_name: 'John',
      last_name: 'Smith',
      email: 'john.smith@firedept.ca',
      phone: '555-0101',
      role_id: roles[0].id, // Firefighter
      station_id: stations[0].id,
      platoon: 'A',
      shift_pattern: '24_48',
      password_hash: '$2a$10$demoHashForTesting1234567890',
      is_active: true
    },
    {
      employee_id: 'FF002',
      first_name: 'Sarah',
      last_name: 'Johnson',
      email: 'sarah.johnson@firedept.ca',
      phone: '555-0102',
      role_id: roles[0].id, // Firefighter
      station_id: stations[1].id,
      platoon: 'B',
      shift_pattern: '24_48',
      password_hash: '$2a$10$demoHashForTesting1234567890',
      is_active: true
    },
    {
      employee_id: 'CAP001',
      first_name: 'Mike',
      last_name: 'Davis',
      email: 'mike.davis@firedept.ca',
      phone: '555-0103',
      role_id: roles[1].id, // Captain
      station_id: stations[0].id,
      platoon: 'A',
      shift_pattern: '24_48',
      password_hash: '$2a$10$demoHashForTesting1234567890',
      is_active: true
    },
    {
      employee_id: 'BC001',
      first_name: 'Lisa',
      last_name: 'Wilson',
      email: 'lisa.wilson@firedept.ca',
      phone: '555-0104',
      role_id: roles[2].id, // Battalion Chief
      station_id: null,
      platoon: 'Admin',
      shift_pattern: 'M_F',
      password_hash: '$2a$10$demoHashForTesting1234567890',
      is_active: true
    },
    {
      employee_id: 'ADMIN001',
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@firedept.ca',
      phone: '555-0000',
      role_id: roles[3].id, // Admin
      station_id: null,
      platoon: 'Admin',
      shift_pattern: 'M_F',
      password_hash: '$2a$10$demoHashForTesting1234567890',
      is_active: true
    }
  ]

  const insertedUsers = []
  for (const user of users) {
    const inserted = await db
      .insertInto('users')
      .values(user)
      .returning('id')
      .executeTakeFirst()
    insertedUsers.push(inserted)
  }

  return insertedUsers
}

async function clearExistingData() {
  console.log('Clearing existing data...')
  
  // Clear tables in reverse order of dependencies
  const tables = [
    'employee_feedback',
    'resource_impact',
    'cost_calculations',
    'rtw_phase_progress',
    'return_to_work_plans',
    'preventive_interventions',
    'wellness_indicators',
    'self_reporting_logs',
    'self_reporting_eligibility',
    'communication_log',
    'required_documents',
    'contact_attempts',
    'duty_assignments',
    'workflow_steps',
    'absence_questions',
    'question_templates',
    'mental_health_absences',
    'absences',
    'absence_types',
    'users',
    'stations',
    'roles'
  ] as const

  for (const table of tables) {
    await db.deleteFrom(table).execute()
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Seeding failed:', error)
      process.exit(1)
    })
}