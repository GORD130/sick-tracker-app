import { seedDatabase } from '../src/database/seed.js'

async function runSeed() {
  try {
    console.log('Starting database seeding...')
    await seedDatabase()
    console.log('Database seeding completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Database seeding failed:', error)
    process.exit(1)
  }
}

runSeed()