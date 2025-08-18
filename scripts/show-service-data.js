const Redis = require('ioredis');
require('dotenv').config({ path: '.env.local' });

async function showServiceData() {
  if (!process.env.REDIS_URL) {
    console.log('REDIS_URL not set');
    console.log('Please create .env.local file with REDIS_URL');
    return;
  }
  
  const redis = new Redis(process.env.REDIS_URL);
  
  const service = process.argv[2];
  const id = process.argv[3];
  
  if (!service || !['counter', 'like', 'ranking', 'bbs'].includes(service)) {
    console.log('Usage: node scripts/show-service-data.js <service> [id]');
    console.log('Services: counter, like, ranking, bbs');
    console.log('Example: node scripts/show-service-data.js counter nostalgic-b89803bb');
    redis.disconnect();
    return;
  }
  
  console.log(`\n=== ${service.toUpperCase()} Service Data ===\n`);
  
  try {
    if (id) {
      // 特定IDのデータを表示
      await showSpecificService(redis, service, id);
    } else {
      // 全サービスデータを表示
      await showAllServices(redis, service);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  redis.disconnect();
}

async function showSpecificService(redis, service, id) {
  console.log(`Service: ${service}`);
  console.log(`ID: ${id}\n`);
  
  switch (service) {
    case 'counter':
      await showCounterData(redis, id);
      break;
    case 'like':
      await showLikeData(redis, id);
      break;
    case 'ranking':
      await showRankingData(redis, id);
      break;
    case 'bbs':
      await showBBSData(redis, id);
      break;
  }
}

async function showAllServices(redis, service) {
  const keys = await redis.keys(`${service}:*`);
  const serviceIds = new Set();
  
  keys.forEach(key => {
    const parts = key.split(':');
    if (parts.length >= 2 && !parts[2]) {
      serviceIds.add(parts[1]);
    }
  });
  
  console.log(`Found ${serviceIds.size} ${service} services:\n`);
  
  for (const id of serviceIds) {
    console.log(`--- ${id} ---`);
    await showSpecificService(redis, service, id);
    console.log();
  }
}

async function showCounterData(redis, id) {
  const metadata = await redis.get(`counter:${id}`);
  const total = await redis.get(`counter:${id}:total`);
  const lastVisit = await redis.get(`counter:${id}:lastVisit`);
  const owner = await redis.get(`counter:${id}:owner`);
  
  if (metadata) {
    const data = JSON.parse(metadata);
    console.log(`URL: ${data.url}`);
    console.log(`Created: ${new Date(data.created).toISOString()}`);
    console.log(`Total visits: ${total || 0}`);
    console.log(`Last visit: ${lastVisit ? new Date(lastVisit).toISOString() : 'Never'}`);
    console.log(`Owner hash: ${owner ? owner.substring(0, 8) + '...' : 'None'}`);
    
    // 日別データ
    const dailyKeys = await redis.keys(`counter:${id}:daily:*`);
    if (dailyKeys.length > 0) {
      console.log('\nDaily data:');
      for (const key of dailyKeys.sort()) {
        const date = key.split(':')[3];
        const count = await redis.get(key);
        console.log(`  ${date}: ${count}`);
      }
    }
  } else {
    console.log('Counter not found');
  }
}

async function showLikeData(redis, id) {
  const metadata = await redis.get(`like:${id}`);
  const total = await redis.get(`like:${id}:total`);
  const owner = await redis.get(`like:${id}:owner`);
  
  if (metadata) {
    const data = JSON.parse(metadata);
    console.log(`URL: ${data.url}`);
    console.log(`Created: ${new Date(data.created).toISOString()}`);
    console.log(`Total likes: ${total || 0}`);
    console.log(`Last like: ${data.lastLike ? new Date(data.lastLike).toISOString() : 'Never'}`);
    console.log(`Owner hash: ${owner ? owner.substring(0, 8) + '...' : 'None'}`);
    
    // アクティブなユーザー
    const userKeys = await redis.keys(`like:${id}:users:*`);
    console.log(`Active users: ${userKeys.length}`);
  } else {
    console.log('Like service not found');
  }
}

async function showRankingData(redis, id) {
  const metadata = await redis.get(`ranking:${id}`);
  const owner = await redis.get(`ranking:${id}:owner`);
  
  if (metadata) {
    const data = JSON.parse(metadata);
    console.log(`URL: ${data.url}`);
    console.log(`Created: ${new Date(data.created).toISOString()}`);
    console.log(`Max entries: ${data.maxEntries}`);
    console.log(`Owner hash: ${owner ? owner.substring(0, 8) + '...' : 'None'}`);
    
    // スコアデータ
    const entries = await redis.zrevrange(`ranking:${id}:scores`, 0, 9, 'WITHSCORES');
    const totalEntries = await redis.zcard(`ranking:${id}:scores`);
    
    console.log(`Total entries: ${totalEntries}`);
    if (entries.length > 0) {
      console.log('\nTop 10 scores:');
      for (let i = 0; i < entries.length; i += 2) {
        const name = entries[i];
        const score = entries[i + 1];
        const rank = Math.floor(i / 2) + 1;
        console.log(`  ${rank}. ${name}: ${score}`);
      }
    }
  } else {
    console.log('Ranking service not found');
  }
}

async function showBBSData(redis, id) {
  const metadata = await redis.get(`bbs:${id}`);
  const owner = await redis.get(`bbs:${id}:owner`);
  
  if (metadata) {
    const data = JSON.parse(metadata);
    console.log(`URL: ${data.url}`);
    console.log(`Created: ${new Date(data.created).toISOString()}`);
    console.log(`Last post: ${data.lastPost ? new Date(data.lastPost).toISOString() : 'Never'}`);
    console.log(`Owner hash: ${owner ? owner.substring(0, 8) + '...' : 'None'}`);
    
    // メッセージデータ
    const messageCount = await redis.llen(`bbs:${id}:messages`);
    console.log(`Total messages: ${messageCount}`);
    
    if (messageCount > 0) {
      // 最新5件のメッセージを表示
      const messages = await redis.lrange(`bbs:${id}:messages`, -5, -1);
      console.log('\nLatest 5 messages:');
      messages.forEach((msg, index) => {
        const message = JSON.parse(msg);
        console.log(`  ${messageCount - 4 + index}. [${message.timestamp}] ${message.author}: ${message.message.substring(0, 50)}${message.message.length > 50 ? '...' : ''}`);
      });
    }
  } else {
    console.log('BBS service not found');
  }
}

showServiceData().catch(console.error);