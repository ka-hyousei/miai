import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  console.log('--- All Tables in Database ---');
  const tables = await pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);

  for (const row of tables.rows) {
    console.log(row.table_name);
  }

  await pool.end();
}

main().catch(console.error);
