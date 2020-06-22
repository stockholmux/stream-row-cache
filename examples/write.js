const
  redis = require('redis'),
  client = redis.createClient(),  
  streamRowCache = require('../index.js'),
  { sql, createPool } = require('slonik');

const pool = createPool(
  `postgres://localhost:5432/testdb`
);

client.flushdb();
pool.connect(async (connection) => {
  let results = await connection.query(sql`SELECT * FROM new_sms_download ORDER BY id ASC`);
  console.log(await streamRowCache.write(client,'listingcache',results.rows,'id',5000,5));
  client.quit();
});