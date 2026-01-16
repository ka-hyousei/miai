import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  const targetId = 'cmk854wo9000004jxbgthlume';

  console.log('Checking ID:', targetId);
  console.log('---');

  // Check in Profile table
  const profileResult = await pool.query(
    'SELECT id, "userId", nickname FROM "Profile" WHERE id = $1',
    [targetId]
  );

  if (profileResult.rows.length > 0) {
    console.log('Found in Profile table:', profileResult.rows[0]);
  } else {
    console.log('NOT found in Profile table');
  }

  // Check in User table
  const userResult = await pool.query(
    'SELECT id, email FROM "User" WHERE id = $1',
    [targetId]
  );

  if (userResult.rows.length > 0) {
    console.log('Found in User table:', userResult.rows[0]);

    // Also get the profile for this user
    const profileForUser = await pool.query(
      'SELECT id, "userId", nickname FROM "Profile" WHERE "userId" = $1',
      [targetId]
    );
    if (profileForUser.rows.length > 0) {
      console.log('Profile for this user:', profileForUser.rows[0]);
    }
  } else {
    console.log('NOT found in User table');
  }

  // List all profiles
  console.log('\n--- All Profiles ---');
  const allProfiles = await pool.query(
    'SELECT id, "userId", nickname FROM "Profile" ORDER BY "createdAt" DESC LIMIT 10'
  );
  for (const row of allProfiles.rows) {
    console.log(`Nickname: ${row.nickname}, Profile ID: ${row.id}, User ID: ${row.userId}`);
  }

  await pool.end();
}

main().catch(console.error);
