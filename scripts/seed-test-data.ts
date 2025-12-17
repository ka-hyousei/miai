import { PrismaClient, Gender, VisaType, JapaneseLevel, FuturePlan } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// テストユーザーデータ
const testUsers = [
  {
    email: 'test-female1@example.com',
    password: 'Test1234',
    profile: {
      nickname: '小美',
      gender: Gender.FEMALE,
      birthDate: new Date('1995-03-15'),
      prefecture: '東京都',
      city: '新宿区',
      bio: '日本で働いている中国人です。真剣な出会いを探しています。趣味は料理と旅行です。',
      height: 162,
      occupation: 'IT企業勤務',
      visaType: VisaType.WORK_VISA,
      yearsInJapan: 5,
      japaneseLevel: JapaneseLevel.N1,
      futurePlan: FuturePlan.STAY_LONG_TERM,
      nationality: '中国',
      hometown: '上海',
    }
  },
  {
    email: 'test-female2@example.com',
    password: 'Test1234',
    profile: {
      nickname: '雪儿',
      gender: Gender.FEMALE,
      birthDate: new Date('1998-07-22'),
      prefecture: '大阪府',
      city: '大阪市',
      bio: '留学生として日本に来ました。優しい人と出会いたいです。',
      height: 158,
      occupation: '大学院生',
      visaType: VisaType.STUDENT_VISA,
      yearsInJapan: 2,
      japaneseLevel: JapaneseLevel.N2,
      futurePlan: FuturePlan.UNDECIDED,
      nationality: '中国',
      hometown: '北京',
    }
  },
  {
    email: 'test-female3@example.com',
    password: 'Test1234',
    profile: {
      nickname: '樱花',
      gender: Gender.FEMALE,
      birthDate: new Date('1992-11-08'),
      prefecture: '神奈川県',
      city: '横浜市',
      bio: '永住権を持っています。日本での生活が大好きです。一緒に幸せな家庭を築きたいです。',
      height: 165,
      occupation: '貿易会社勤務',
      visaType: VisaType.PERMANENT_RESIDENT,
      yearsInJapan: 10,
      japaneseLevel: JapaneseLevel.N1,
      futurePlan: FuturePlan.STAY_LONG_TERM,
      nationality: '中国',
      hometown: '広州',
    }
  },
  {
    email: 'test-male1@example.com',
    password: 'Test1234',
    profile: {
      nickname: '志明',
      gender: Gender.MALE,
      birthDate: new Date('1990-05-20'),
      prefecture: '東京都',
      city: '渋谷区',
      bio: 'エンジニアとして働いています。誠実で思いやりのある人です。',
      height: 175,
      occupation: 'ソフトウェアエンジニア',
      visaType: VisaType.WORK_VISA,
      yearsInJapan: 7,
      japaneseLevel: JapaneseLevel.N1,
      futurePlan: FuturePlan.STAY_LONG_TERM,
      nationality: '中国',
      hometown: '深圳',
    }
  },
  {
    email: 'test-male2@example.com',
    password: 'Test1234',
    profile: {
      nickname: '大伟',
      gender: Gender.MALE,
      birthDate: new Date('1993-09-12'),
      prefecture: '愛知県',
      city: '名古屋市',
      bio: '自動車会社で働いています。休日はスポーツを楽しんでいます。',
      height: 178,
      occupation: '自動車メーカー勤務',
      visaType: VisaType.WORK_VISA,
      yearsInJapan: 4,
      japaneseLevel: JapaneseLevel.N2,
      futurePlan: FuturePlan.STAY_LONG_TERM,
      nationality: '中国',
      hometown: '天津',
    }
  },
  {
    email: 'test-male3@example.com',
    password: 'Test1234',
    profile: {
      nickname: '小龙',
      gender: Gender.MALE,
      birthDate: new Date('1996-02-28'),
      prefecture: '福岡県',
      city: '福岡市',
      bio: '料理人として日本で修行中です。将来は自分の店を持ちたいです。',
      height: 172,
      occupation: '料理人',
      visaType: VisaType.WORK_VISA,
      yearsInJapan: 3,
      japaneseLevel: JapaneseLevel.N3,
      futurePlan: FuturePlan.STAY_LONG_TERM,
      nationality: '中国',
      hometown: '成都',
    }
  },
]

async function main() {
  console.log('Creating test users...')

  for (const userData of testUsers) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    })

    if (existingUser) {
      console.log(`User ${userData.email} already exists, skipping...`)
      continue
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10)

    // Create user with profile
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        emailVerified: new Date(),
        profile: {
          create: userData.profile
        }
      }
    })

    console.log(`Created user: ${userData.email} (${userData.profile.nickname})`)
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
