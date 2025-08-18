const Redis = require('ioredis');
require('dotenv').config({ path: '.env.local' });

async function fixService() {
  if (!process.env.REDIS_URL) {
    console.log('REDIS_URL not set');
    console.log('Please create .env.local file with REDIS_URL');
    return;
  }
  
  const redis = new Redis(process.env.REDIS_URL);
  
  const service = process.argv[2];
  const id = process.argv[3];
  
  if (!service || !['counter', 'like', 'ranking', 'bbs'].includes(service)) {
    console.log('Usage: node scripts/fix-service.js <service> <id>');
    console.log('Services: counter, like, ranking, bbs');
    console.log('Example: node scripts/fix-service.js counter nostalgic-b89803bb');
    redis.disconnect();
    return;
  }
  
  if (!id) {
    console.log(`Usage: node scripts/fix-service.js ${service} <${service}-id>`);
    console.log(`Example: node scripts/fix-service.js ${service} nostalgic-abc123`);
    redis.disconnect();
    return;
  }
  
  console.log(`\n=== Fixing ${service}: ${id} ===\n`);
  
  try {
    switch (service) {
      case 'counter':
        await fixCounter(redis, id);
        break;
      case 'like':
        await fixLike(redis, id);
        break;
      case 'ranking':
        await fixRanking(redis, id);
        break;
      case 'bbs':
        await fixBBS(redis, id);
        break;
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  redis.disconnect();
}

async function fixCounter(redis, id) {
  // 現在の状態を確認
  const total = await redis.get(`counter:${id}:total`);
  console.log(`Current total: ${total || 0}`);
  
  // 日別データの合計を計算
  const keys = await redis.keys(`counter:${id}:daily:*`);
  let dailySum = 0;
  
  console.log('\nDaily data:');
  for (const key of keys) {
    const count = await redis.get(key);
    const date = key.split(':')[3];
    console.log(`  ${date}: ${count}`);
    dailySum += parseInt(count) || 0;
  }
  
  console.log(`\nSum of daily data: ${dailySum}`);
  console.log(`Current total: ${total || 0}`);
  
  if (dailySum > (parseInt(total) || 0)) {
    console.log('\n⚠️  Total is less than daily sum! Fixing...');
    await redis.set(`counter:${id}:total`, dailySum);
    console.log(`✅ Total updated to: ${dailySum}`);
  } else {
    console.log('\n✅ Total is correct');
  }
}

async function fixLike(redis, id) {
  const metadata = await redis.get(`like:${id}`);
  if (!metadata) {
    console.log('❌ Like service not found');
    return;
  }
  
  const total = await redis.get(`like:${id}:total`);
  console.log(`Current likes: ${total || 0}`);
  
  // アクティブユーザー数をチェック
  const userKeys = await redis.keys(`like:${id}:users:*`);
  console.log(`Active users: ${userKeys.length}`);
  
  // データ整合性チェック
  const data = JSON.parse(metadata);
  if (!data.lastLike && parseInt(total || 0) > 0) {
    console.log('\n⚠️  Missing lastLike timestamp, updating...');
    const now = new Date().toISOString();
    data.lastLike = now;
    await redis.set(`like:${id}`, JSON.stringify(data));
    console.log('✅ LastLike timestamp updated');
  } else {
    console.log('\n✅ Like data is consistent');
  }
}

async function fixRanking(redis, id) {
  const metadata = await redis.get(`ranking:${id}`);
  if (!metadata) {
    console.log('❌ Ranking service not found');
    return;
  }
  
  const totalEntries = await redis.zcard(`ranking:${id}:scores`);
  console.log(`Current entries: ${totalEntries}`);
  
  const data = JSON.parse(metadata);
  console.log(`Max entries: ${data.maxEntries}`);
  
  if (totalEntries > data.maxEntries) {
    console.log('\n⚠️  Too many entries, trimming...');
    const removeCount = totalEntries - data.maxEntries;
    await redis.zremrangebyrank(`ranking:${id}:scores`, 0, removeCount - 1);
    console.log(`✅ Removed ${removeCount} lowest entries`);
  } else {
    console.log('\n✅ Ranking data is consistent');
  }
}

async function fixBBS(redis, id) {
  const metadata = await redis.get(`bbs:${id}`);
  if (!metadata) {
    console.log('❌ BBS service not found');
    return;
  }
  
  const messageCount = await redis.llen(`bbs:${id}:messages`);
  console.log(`Current messages: ${messageCount}`);
  
  // データ整合性チェック
  const data = JSON.parse(metadata);
  if (!data.lastPost && messageCount > 0) {
    console.log('\n⚠️  Missing lastPost timestamp, updating...');
    const latestMessage = await redis.lindex(`bbs:${id}:messages`, -1);
    if (latestMessage) {
      const msg = JSON.parse(latestMessage);
      data.lastPost = msg.timestamp;
      await redis.set(`bbs:${id}`, JSON.stringify(data));
      console.log('✅ LastPost timestamp updated');
    }
  } else {
    console.log('\n✅ BBS data is consistent');
  }
}

fixService().catch(console.error);