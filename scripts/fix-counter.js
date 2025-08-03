const Redis = require('ioredis');
require('dotenv').config({ path: '.env.local' });

async function fixCounter() {
  if (!process.env.REDIS_URL) {
    console.log('REDIS_URL not set');
    console.log('Please create .env.local file with REDIS_URL');
    return;
  }
  
  const redis = new Redis(process.env.REDIS_URL);
  
  const id = process.argv[2];
  if (!id) {
    console.log('Usage: node scripts/fix-counter.js <counter-id>');
    console.log('Example: node scripts/fix-counter.js nostalgi-5e343478');
    redis.disconnect();
    return;
  }
  
  console.log(`\n=== Fixing counter: ${id} ===\n`);
  
  try {
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
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  redis.disconnect();
}

fixCounter().catch(console.error);