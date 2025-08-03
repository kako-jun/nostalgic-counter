const Redis = require('ioredis');
require('dotenv').config({ path: '.env.local' });

async function showRedisInfo() {
  if (!process.env.REDIS_URL) {
    console.log('REDIS_URL not set');
    console.log('Please create .env.local file with REDIS_URL');
    return;
  }
  
  const redis = new Redis(process.env.REDIS_URL);
  
  try {
    // Redis情報を取得
    const info = await redis.info();
    
    console.log('=== Redis Server Information ===\n');
    
    // 重要な情報を抽出
    const lines = info.split('\r\n');
    const sections = {};
    let currentSection = '';
    
    for (const line of lines) {
      if (line.startsWith('#')) {
        currentSection = line.substring(2);
        sections[currentSection] = {};
      } else if (line.includes(':')) {
        const [key, value] = line.split(':');
        if (currentSection) {
          sections[currentSection][key] = value;
        }
      }
    }
    
    // サーバー情報
    if (sections.Server) {
      console.log('📡 SERVER');
      console.log(`  Version: ${sections.Server.redis_version || 'N/A'}`);
      console.log(`  Mode: ${sections.Server.redis_mode || 'N/A'}`);
      console.log(`  Uptime: ${sections.Server.uptime_in_days || '0'} days\n`);
    }
    
    // メモリ情報
    if (sections.Memory) {
      console.log('💾 MEMORY');
      console.log(`  Used: ${sections.Memory.used_memory_human || 'N/A'}`);
      console.log(`  Peak: ${sections.Memory.used_memory_peak_human || 'N/A'}`);
      console.log(`  RSS: ${sections.Memory.used_memory_rss_human || 'N/A'}\n`);
    }
    
    // クライアント情報
    if (sections.Clients) {
      console.log('👥 CLIENTS');
      console.log(`  Connected: ${sections.Clients.connected_clients || '0'}`);
      console.log(`  Blocked: ${sections.Clients.blocked_clients || '0'}\n`);
    }
    
    // 統計情報
    if (sections.Stats) {
      console.log('📊 STATS');
      console.log(`  Total connections: ${sections.Stats.total_connections_received || '0'}`);
      console.log(`  Total commands: ${sections.Stats.total_commands_processed || '0'}`);
      console.log(`  Keys hit: ${sections.Stats.keyspace_hits || '0'}`);
      console.log(`  Keys miss: ${sections.Stats.keyspace_misses || '0'}\n`);
    }
    
    // キースペース情報
    console.log('🗄️  KEYSPACE');
    const dbKeys = await redis.dbsize();
    console.log(`  Total keys: ${dbKeys}`);
    
  } catch (error) {
    console.error('Error fetching Redis info:', error.message);
  }
  
  redis.disconnect();
}

showRedisInfo().catch(console.error);