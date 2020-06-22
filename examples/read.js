const
  redis = require('redis'),
  client = redis.createClient(),
  streamRowCache = require('../index.js');



(async () => {
  let cursor = '-';
  let fn = streamRowCache.read;
  /*let cursor = '+';
  let fn = streamRowCache.readRev;*/

  let rowCount = 0;
  
  console.time('all');
  do {
    console.time('page');
    let results = await fn(client,'listingcache',cursor,10);
    console.log(cursor)
    console.timeEnd('page');
    //console.log(results);
    cursor = results.newCursor;
    rowCount = results.rowCount;
  } while (rowCount !== 0)
  console.timeEnd('all');
  client.quit();
})();
