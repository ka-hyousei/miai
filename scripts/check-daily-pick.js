const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 查找所有每日推荐
  const recommendations = await prisma.dailyRecommendation.findMany({
    include: {
      target: {
        include: {
          profile: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  console.log('=== Daily Recommendations ===\n');

  for (const rec of recommendations) {
    console.log('---');
    console.log('Date:', rec.date);
    console.log('targetId (User ID):', rec.targetId);
    console.log('Profile ID:', rec.target?.profile?.id || 'NO PROFILE');
    console.log('Nickname:', rec.target?.profile?.nickname || 'UNKNOWN');
  }

  // 查找所有女性用户
  console.log('\n=== Female Profiles ===\n');
  const femaleProfiles = await prisma.profile.findMany({
    where: { gender: 'FEMALE' },
    select: {
      id: true,
      userId: true,
      nickname: true
    }
  });

  for (const p of femaleProfiles) {
    console.log(`Nickname: ${p.nickname}, Profile ID: ${p.id}, User ID: ${p.userId}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
