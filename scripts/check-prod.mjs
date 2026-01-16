import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://neondb_owner:npg_6hxcKCtl5MBP@ep-rough-violet-ahzr1tmi-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

async function main() {
  const targetId = 'cmk854wo9000004jxbgthlume';

  console.log('=== Checking Production Database ===\n');

  // List all tables
  console.log('--- Tables ---');
  const tables = await pool.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' ORDER BY table_name
  `);
  for (const row of tables.rows) {
    console.log(row.table_name);
  }

  // Check if target ID exists
  console.log('\n--- Checking ID:', targetId, '---');

  const profileResult = await pool.query(
    'SELECT id, "userId", nickname FROM "Profile" WHERE id = $1',
    [targetId]
  );
  if (profileResult.rows.length > 0) {
    console.log('Found in Profile:', profileResult.rows[0]);
  } else {
    console.log('NOT in Profile table');
  }

  const userResult = await pool.query(
    'SELECT id, email FROM "User" WHERE id = $1',
    [targetId]
  );
  if (userResult.rows.length > 0) {
    console.log('Found in User:', userResult.rows[0]);
  } else {
    console.log('NOT in User table');
  }

  // List all profiles
  console.log('\n--- All Profiles ---');
  const profiles = await pool.query(
    'SELECT id, "userId", nickname FROM "Profile" ORDER BY "createdAt" DESC'
  );
  for (const row of profiles.rows) {
    console.log(`${row.nickname} | Profile ID: ${row.id} | User ID: ${row.userId}`);
  }

  // Check DailyRecommendation
  console.log('\n--- Daily Recommendations ---');
  try {
    const recs = await pool.query(
      'SELECT * FROM "DailyRecommendation" ORDER BY date DESC LIMIT 5'
    );
    console.log('Total:', recs.rows.length);
    for (const row of recs.rows) {
      console.log(row);
    }
  } catch (e) {
    console.log('Error querying DailyRecommendation:', e.message);
  }

  await pool.end();
}

main().catch(console.error);
