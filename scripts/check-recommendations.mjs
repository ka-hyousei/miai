import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  console.log('--- All Daily Recommendations ---');
  const recs = await pool.query(
    'SELECT id, "userId", "targetId", date FROM "DailyRecommendation" ORDER BY date DESC LIMIT 10'
  );

  for (const row of recs.rows) {
    console.log(`Date: ${row.date}, User: ${row.userId}, Target: ${row.targetId}`);

    // Check if target user exists
    const targetUser = await pool.query(
      'SELECT id, email FROM "User" WHERE id = $1',
      [row.targetId]
    );

    if (targetUser.rows.length === 0) {
      console.log('  ⚠️ TARGET USER DOES NOT EXIST!');
    } else {
      // Get profile
      const profile = await pool.query(
        'SELECT id, nickname FROM "Profile" WHERE "userId" = $1',
        [row.targetId]
      );
      if (profile.rows.length > 0) {
        console.log(`  ✓ Profile: ${profile.rows[0].nickname} (Profile ID: ${profile.rows[0].id})`);
      } else {
        console.log('  ⚠️ USER EXISTS BUT NO PROFILE!');
      }
    }
  }

  await pool.end();
}

main().catch(console.error);
