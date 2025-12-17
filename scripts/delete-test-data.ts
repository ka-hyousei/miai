import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const testEmails = [
  'test-female1@example.com',
  'test-female2@example.com',
  'test-female3@example.com',
  'test-male1@example.com',
  'test-male2@example.com',
  'test-male3@example.com',
]

async function main() {
  console.log('Deleting test users...')

  for (const email of testEmails) {
    const result = await prisma.user.deleteMany({
      where: { email }
    })
    if (result.count > 0) {
      console.log(`Deleted: ${email}`)
    } else {
      console.log(`Not found: ${email}`)
    }
  }

  console.log('Done!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
