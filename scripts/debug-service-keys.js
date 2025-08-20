const Redis = require('ioredis');
require('dotenv').config({ path: '.env.local' });

async function debugServiceKeys() {
  const redis = new Redis(process.env.REDIS_URL);
  
  console.log('=== Debug Service Keys ===\n');
  
  // BBSサービスの例: nostalgic-fb60d4e2
  const bbsId = 'nostalgic-fb60d4e2';
  console.log(`Examining BBS: ${bbsId}`);
  
  const bbsData = await redis.get(bbsId);
  console.log(`BBS entity data:`, JSON.stringify(JSON.parse(bbsData), null, 2));
  
  // Rankingサービスの例: nostalgic-9c044ad0  
  const rankingId = 'nostalgic-9c044ad0';
  console.log(`\nExamining Ranking: ${rankingId}`);
  
  const rankingData = await redis.get(rankingId);
  console.log(`Ranking entity data:`, JSON.stringify(JSON.parse(rankingData), null, 2));
  
  // カウンターサービスの例: nostalgic-b89803bb
  const counterId = 'nostalgic-b89803bb';
  console.log(`\nExamining Counter: ${counterId}`);
  
  const counterData = await redis.get(counterId);
  console.log(`Counter entity data:`, JSON.stringify(JSON.parse(counterData), null, 2));
  
  await redis.disconnect();
}

debugServiceKeys().catch(console.error);