import { db } from './db.js'

async function seedDatabase() {
  try {
    console.log('Starting database seeding...')

    // Check if roles already exist
    const existingRoles = await db.selectFrom('roles').select('id').execute()
    if (existingRoles.length === 0) {
      console.log('Seeding roles...')
      
      // Insert roles
      await db.insertInto('roles')
        .values([
          {
            name: 'Firefighter',
            permissions: JSON.stringify({
              can_report_sick: true,
              can_view_own_absences: true,
              can_self_report: true
            }),
            description: 'Frontline firefighter'
          },
          {
            name: 'Lieutenant',
            permissions: JSON.stringify({
              can_report_sick: true,
              can_view_own_absences: true,
              can_self_report: true,
              can_manage_team: true,
              can_assign_managers: true
            }),
            description: 'Team leader'
          },
          {
            name: 'Captain',
            permissions: JSON.stringify({
              can_report_sick: true,
              can_view_own_absences: true,
              can_self_report: true,
              can_manage_team: true,
              can_assign_managers: true,
              can_manage_station: true
            }),
            description: 'Station commander'
          },
          {
            name: 'Battalion Chief',
            permissions: JSON.stringify({
              can_report_sick: true,
              can_view_own_absences: true,
              can_self_report: true,
              can_manage_team: true,
              can_assign_managers: true,
              can_manage_station: true,
              can_manage_multiple_stations: true
            }),
            description: 'Multi-station manager'
          },
          {
            name: 'Administrator',
            permissions: JSON.stringify({
              can_report_sick: true,
              can_view_own_absences: true,
              can_self_report: true,
              can_manage_team: true,
              can_assign_managers: true,
              can_manage_station: true,
              can_manage_multiple_stations: true,
              can_manage_users: true,
              can_view_reports: true
            }),
            description: 'System administrator'
          }
        ])
        .execute()
      
      console.log('Roles seeded successfully')
    }

    // Check if stations already exist
    const existingStations = await db.selectFrom('stations').select('id').execute()
    if (existingStations.length === 0) {
      console.log('Seeding stations...')
      
      // Insert stations
      await db.insertInto('stations')
        .values([
          {
            name: 'Station 1 - Downtown',
            code: 'STN1',
            address: '123 Main Street, Downtown',
            is_active: true
          },
          {
            name: 'Station 2 - Westside',
            code: 'STN2',
            address: '456 Oak Avenue, Westside',
            is_active: true
          },
          {
            name: 'Station 3 - Eastside',
            code: 'STN3',
            address: '789 Pine Road, Eastside',
            is_active: true
          },
          {
            name: 'Station 4 - Northside',
            code: 'STN4',
            address: '321 Elm Street, Northside',
            is_active: true
          },
          {
            name: 'Station 5 - Southside',
            code: 'STN5',
            address: '654 Maple Drive, Southside',
            is_active: true
          }
        ])
        .execute()
      
      console.log('Stations seeded successfully')
    }

    // Check if absence types exist
    const existingAbsenceTypes = await db.selectFrom('absence_types').select('id').execute()
    if (existingAbsenceTypes.length === 0) {
      console.log('Seeding absence types...')
      
      // Insert absence types
      await db.insertInto('absence_types')
        .values([
          {
            name: 'Sick Leave',
            requires_note: true,
            note_requirement_days: 3,
            specific_forms: JSON.stringify(['Doctor Note']),
            is_active: true
          },
          {
            name: 'Personal Leave',
            requires_note: false,
            note_requirement_days: null,
            specific_forms: JSON.stringify([]),
            is_active: true
          },
          {
            name: 'Family Emergency',
            requires_note: false,
            note_requirement_days: null,
            specific_forms: JSON.stringify([]),
            is_active: true
          },
          {
            name: 'Mental Health Day',
            requires_note: false,
            note_requirement_days: null,
            specific_forms: JSON.stringify([]),
            is_active: true
          },
          {
            name: 'Work-Related Injury',
            requires_note: true,
            note_requirement_days: 1,
            specific_forms: JSON.stringify(['Incident Report', 'WorkSafe Form']),
            is_active: true
          }
        ])
        .execute()
      
      console.log('Absence types seeded successfully')
    }

    console.log('Database seeding completed successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log('Seeding process completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Seeding process failed:', error)
      process.exit(1)
    })
}

export { seedDatabase }