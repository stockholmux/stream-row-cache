const { promisify } = require("util");
const incrStreamId = (sId) => sId.split('-').map((p,i) => i === 0 ? p : +p+1 ).join('-');
const decrStreamId = (sId) => sId.split('-').map((p,i) => i === 0 ? p : +p-1 ).join('-');

function chunk(array, size) {
  const chunked_arr = [];
  let index = 0;
  while (index < array.length) {
    chunked_arr.push(array.slice(index, size + index));
    index += size;
  }
  return chunked_arr;
}



async function read(client, key,cursor,chunkCount) {
  return new Promise(function(resolve) {
    client.xrange(key,cursor,'+','COUNT',chunkCount,(err,results) => {
      if (err) { throw err; } else {
        let newCursor = '';
        let items = [];
        results.forEach((entry) => {
          newCursor = entry[0];
          items = items.concat(entry[1]);
        });
        resolve({
          newCursor : incrStreamId(newCursor),
          rowCount  : items.length,
          rows :  chunk(items,2).map((c) => [ c[0], JSON.parse(c[1])]) 
        });
      }
    });
  });
}

function readRev(client,key,cursor,chunkCount) {
  return new Promise(function(resolve) {
    client.xrevrange(key,cursor,'-','COUNT',chunkCount,(err,results) => {
      if (err) { throw err; } else {
        let newCursor = '';
        let items = [];
        results.forEach((entry) => {
          items = items.concat(entry[1].reverse());
        });
        newCursor = results[results.length-1] ? decrStreamId(results[results.length-1][0]) : undefined;
        resolve({
          newCursor : newCursor,
          rowCount  : items.length,
          rows :  chunk(items,2).map((c) => [ c[1], JSON.parse(c[0])])
        });
      }
    });
  });
}
async function write(client,redisKey,rows,primaryKey,expiry,chunkSize) {
  const xaddAsync = promisify(client.xadd).bind(client);
  const expireAsync = promisify(client.expire).bind(client);
  const all = chunk(rows.map((row) => [row[primaryKey], JSON.stringify(row)]),chunkSize)
    .map((chunk,i) => {
      return xaddAsync(redisKey,`0-${i+1}`,...chunk.flat(Infinity));
    });
    try {
      return [await all, expiry !== -1 ? await expireAsync(redisKey,expiry) : null]
    } catch (e) {
      return e;
    }
}

module.exports = {
  write,
  read,
  readRev
};