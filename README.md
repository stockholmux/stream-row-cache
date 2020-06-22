# Stream Row Cache for Redis

Take your entire result set from a database and cache it in Redis. Later, retrieve it page by page

## Install

```
npm install stream-row-cache
```

## Usage

See `/examples`

## Syntax

### Writing
```
streamRowCache.write(redisClient,yourRedisKey,collectionOfRows,primaryKeyInRows,expiryInSeconds,chunkSize)
```

If you do not want an expiry, then set the `expiryInSeconds` argument to `-1`

### Reading
```
streamRowCache.read(redisClient,yourRedisKey,cursor,numberOfChunks)
```

### Reading in Reverse
```
streamRowCache.readRev(redisClient,yourRedisKey,cursor,numberOfChunks)
```

## "Chunks"

Chunks represent the smallest unit of rows that you want to return. For example, let's say you want pages in the sizes of 10, 25, and 50. You would set your chunk size to 5. When getting results for 10 per page, you would retrieve 2 chunks, and for 25 per page, you would retrieve 5 chunks. 

## Cursors

The cursors in this repo are really Redis Stream entry IDs. If you want to start from the begining in ascending order, use an initial cursor of `-` (the lowest possible) and for a reverse order, use '+' (the highest possibe). For each page you pass the cursor to the next page for more results.

If you want to go to an arbitrary page, supply the starting chunk. So, for example, if you have ten chunks per page, page two would start on cursor `0-11`.

## Limits 

In theory, this will work for up to `Number.MAX_SAFE_INTEGER` (9,007,199,254,740,991) chunks, anything over will not work predictably due to percision issues. 