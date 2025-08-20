const Redis = require('ioredis');
require('dotenv').config({ path: '.env.local' });

async function migrateLegacyServices() {
  if (!process.env.REDIS_URL) {
    console.log('REDIS_URL not set');
    console.log('Please create .env.local file with REDIS_URL');
    return;
  }
  
  const redis = new Redis(process.env.REDIS_URL);
  
  console.log('=== Migrating Legacy Services to New Schema ===\n');
  
  // すべてのキーを取得
  const keys = await redis.keys('*');
  console.log(`Found ${keys.length} total keys in Redis`);
  
  let migratedServices = 0;
  let errors = 0;
  
  // 各サービス種別の処理
  const services = {
    counter: new Set(),
    like: new Set(),
    ranking: new Set(),
    bbs: new Set()
  };
  
  // サービスIDを収集（正しいキー構造: service:id）
  for (const key of keys) {
    const parts = key.split(':');
    if (parts.length >= 2) {
      const [serviceType, serviceId] = parts;
      // メインエンティティキーのみ（:owner, :total などは除外）
      if (services[serviceType] && parts.length === 2) {
        services[serviceType].add(serviceId);
      }
    }
  }
  
  console.log(`Found services: Counter(${services.counter.size}), Like(${services.like.size}), Ranking(${services.ranking.size}), BBS(${services.bbs.size})\n`);
  
  // Counter migration
  console.log('--- Migrating Counters ---');
  for (const id of services.counter) {
    try {
      const entityKey = `counter:${id}`;
      const entityData = await redis.get(entityKey);
      
      if (entityData) {
        const entity = JSON.parse(entityData);
        
        // 既に新スキーマかチェック
        if (entity.totalCount !== undefined) {
          console.log(`Counter ${id}: Already migrated`);
          continue;
        }
        
        // 旧スキーマから新スキーマに変換
        const migratedEntity = {
          id: entity.id,
          url: entity.url,
          created: entity.created,
          totalCount: entity.count || 0, // count -> totalCount
          lastVisit: entity.lastVisit
        };
        
        await redis.set(entityKey, JSON.stringify(migratedEntity));
        console.log(`Counter ${id}: Migrated (count: ${migratedEntity.totalCount})`);
        migratedServices++;
      }
    } catch (error) {
      console.error(`Counter ${id}: Error - ${error.message}`);
      errors++;
    }
  }
  
  // Ranking migration
  console.log('\n--- Migrating Rankings ---');
  for (const id of services.ranking) {
    try {
      const entityKey = `ranking:${id}`;
      const entityData = await redis.get(entityKey);
      
      if (entityData) {
        const entity = JSON.parse(entityData);
        
        // 既に新スキーマかチェック
        if (entity.settings !== undefined) {
          console.log(`Ranking ${id}: Already migrated`);
          continue;
        }
        
        // 旧スキーマから新スキーマに変換
        const migratedEntity = {
          id: entity.id,
          url: entity.url,
          created: entity.created,
          totalEntries: entity.totalEntries || 0,
          settings: {
            maxEntries: entity.maxEntries || 100
          },
          lastEntry: entity.lastEntry
        };
        
        await redis.set(entityKey, JSON.stringify(migratedEntity));
        console.log(`Ranking ${id}: Migrated (maxEntries: ${migratedEntity.settings.maxEntries})`);
        migratedServices++;
      }
    } catch (error) {
      console.error(`Ranking ${id}: Error - ${error.message}`);
      errors++;
    }
  }
  
  // BBS migration
  console.log('\n--- Migrating BBS ---');
  for (const id of services.bbs) {
    try {
      const entityKey = `bbs:${id}`;
      const entityData = await redis.get(entityKey);
      
      if (entityData) {
        const entity = JSON.parse(entityData);
        
        // 既に新スキーマかチェック
        if (entity.settings !== undefined) {
          console.log(`BBS ${id}: Already migrated`);
          continue;
        }
        
        // 旧スキーマから新スキーマに変換
        const migratedEntity = {
          id: entity.id,
          url: entity.url,
          created: entity.created,
          totalMessages: entity.totalMessages || 0,
          settings: {
            title: entity.title || 'BBS',
            maxMessages: entity.maxMessages || 1000,
            messagesPerPage: entity.messagesPerPage || 10,
            icons: entity.icons || [],
            selects: entity.selects || []
          },
          lastMessage: entity.lastMessage
        };
        
        await redis.set(entityKey, JSON.stringify(migratedEntity));
        console.log(`BBS ${id}: Migrated (title: "${migratedEntity.settings.title}", maxMessages: ${migratedEntity.settings.maxMessages})`);
        migratedServices++;
      }
    } catch (error) {
      console.error(`BBS ${id}: Error - ${error.message}`);
      errors++;
    }
  }
  
  console.log(`\n=== Migration Complete ===`);
  console.log(`Migrated services: ${migratedServices}`);
  console.log(`Errors: ${errors}`);
  
  await redis.disconnect();
}

// スクリプトとして実行された場合
if (require.main === module) {
  migrateLegacyServices().catch(console.error);
}

module.exports = { migrateLegacyServices };