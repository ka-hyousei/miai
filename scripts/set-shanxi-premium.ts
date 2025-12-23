import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

function createPrismaClient() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

const prisma = createPrismaClient()

async function main() {
  // 查找所有出生地是山西的用户
  const shanxiProfiles = await prisma.profile.findMany({
    where: {
      hometown: {
        contains: '山西',
      },
    },
    include: {
      user: {
        include: {
          subscription: true,
        },
      },
    },
  })

  console.log(`找到 ${shanxiProfiles.length} 个山西用户`)

  for (const profile of shanxiProfiles) {
    const user = profile.user

    // 如果用户已经有有效的订阅，跳过
    if (user.subscription && user.subscription.status === 'ACTIVE') {
      console.log(`用户 ${profile.nickname} (${user.email}) 已经是会员，跳过`)
      continue
    }

    // 设置永久高级会员（结束日期设为2099年）
    const endDate = new Date('2099-12-31')

    if (user.subscription) {
      // 更新现有订阅
      await prisma.subscription.update({
        where: { userId: user.id },
        data: {
          plan: 'PREMIUM',
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: endDate,
        },
      })
    } else {
      // 创建新订阅
      await prisma.subscription.create({
        data: {
          userId: user.id,
          plan: 'PREMIUM',
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: endDate,
        },
      })
    }

    console.log(`✅ 已将用户 ${profile.nickname} (${user.email}) 设置为高级会员`)
  }

  console.log('\n完成!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
