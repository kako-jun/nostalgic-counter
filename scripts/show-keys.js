const Redis = require('ioredis');
require('dotenv').config({ path: '.env.local' });

async function showKeys() {
  const redis = new Redis(process.env.REDIS_URL);
  
  const keys = await redis.keys('*');
  console.log(`Found ${keys.length} keys:\n`);
  
  // サービス関連のキーのみ抽出
  const serviceKeys = keys.filter(key => {
    return key.includes('nostalgic-') || key.includes('llll-ll-') || key.includes('osaka-kenpo-');
  }).sort();
  
  console.log('Service-related keys:');
  for (const key of serviceKeys) {
    const type = await redis.type(key);
    const ttl = await redis.ttl(key);
    console.log(`${key.padEnd(40)} (${type.padEnd(6)}) TTL:${ttl}`);
    
    // メインエンティティと思われるキーのデータを表示
    if (!key.includes(':') && type === 'string') {
      try {
        const data = await redis.get(key);
        console.log(`  DATA: ${data.substring(0, 100)}...`);
      } catch (e) {
        console.log(`  DATA: Error reading - ${e.message}`);
      }
    }
  }
  
  await redis.disconnect();
}

showKeys().catch(console.error);