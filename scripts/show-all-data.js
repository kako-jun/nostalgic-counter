const Redis = require('ioredis');
require('dotenv').config({ path: '.env.local' });

async function showAllData() {
  if (!process.env.REDIS_URL) {
    console.log('REDIS_URL not set');
    console.log('Please create .env.local file with REDIS_URL');
    return;
  }
  
  const redis = new Redis(process.env.REDIS_URL);
  
  console.log('=== Redis All Data (Table Format) ===\n');
  
  // すべてのキーを取得
  const keys = await redis.keys('*');
  
  // キーをタイプ別に分類
  const counters = new Map(); // カウンターID -> データ
  const urls = new Map();     // URL -> ID
  const visits = [];          // 訪問記録
  const dailyData = new Map(); // ID -> 日付 -> カウント
  
  // 各キーのデータを取得
  for (const key of keys) {
    const value = await redis.get(key);
    const ttl = await redis.ttl(key);
    
    if (key.startsWith('counter:') && !key.includes(':total') && !key.includes(':daily:')) {
      // メタデータ
      const id = key.split(':')[1];
      if (!counters.has(id)) {
        counters.set(id, {
          metadata: null,
          total: 0,
          dailyData: new Map()
        });
      }
      counters.get(id).metadata = JSON.parse(value);
    } else if (key.includes(':total')) {
      // 累計値
      const id = key.split(':')[1];
      if (!counters.has(id)) {
        counters.set(id, { total: 0, dailyData: new Map() });
      }
      const counter = counters.get(id);
      counter.total = parseInt(value || 0);
    } else if (key.includes(':daily:')) {
      // 日別データ
      const parts = key.split(':');
      const id = parts[1];
      const date = parts[3];
      if (!counters.has(id)) counters.set(id, { total: 0, dailyData: new Map() });
      counters.get(id).dailyData.set(date, parseInt(value));
    } else if (key.startsWith('url:')) {
      // URLマッピング
      const url = decodeURIComponent(key.substring(4));
      urls.set(url, value);
    } else if (key.startsWith('visit:')) {
      // 訪問記録
      visits.push({
        key: key,
        ttl: ttl > 0 ? `${Math.floor(ttl/3600)}h ${Math.floor((ttl%3600)/60)}m` : 'No TTL'
      });
    }
  }
  
  // 1. カウンターテーブル
  console.log('📊 COUNTERS TABLE');
  console.log('═'.repeat(100));
  console.log('| ID                  | URL                                    | Total | Created            |');
  console.log('|' + '-'.repeat(21) + '|' + '-'.repeat(40) + '|' + '-'.repeat(7) + '|' + '-'.repeat(20) + '|');
  
  for (const [id, data] of counters) {
    if (data.metadata) {
      const url = data.metadata.url.substring(0, 38);
      const created = new Date(data.metadata.created).toISOString().substring(0, 19);
      console.log(`| ${id.padEnd(19)} | ${url.padEnd(38)} | ${String(data.total).padStart(5)} | ${created} |`);
    }
  }
  console.log('═'.repeat(100));
  console.log(`Total counters: ${counters.size}\n`);
  
  // 2. 日別データテーブル
  console.log('📅 DAILY DATA TABLE');
  console.log('═'.repeat(80));
  console.log('| Counter ID          | Date       | Count |');
  console.log('|' + '-'.repeat(21) + '|' + '-'.repeat(12) + '|' + '-'.repeat(7) + '|');
  
  for (const [id, data] of counters) {
    for (const [date, count] of data.dailyData) {
      console.log(`| ${id.padEnd(19)} | ${date} | ${String(count).padStart(5)} |`);
    }
  }
  console.log('═'.repeat(80));
  
  // 3. URLマッピングテーブル
  console.log('\n🔗 URL MAPPINGS TABLE');
  console.log('═'.repeat(80));
  console.log('| URL                                              | Counter ID          |');
  console.log('|' + '-'.repeat(50) + '|' + '-'.repeat(21) + '|');
  
  for (const [url, id] of urls) {
    const shortUrl = url.length > 48 ? url.substring(0, 45) + '...' : url;
    console.log(`| ${shortUrl.padEnd(48)} | ${id.padEnd(19)} |`);
  }
  console.log('═'.repeat(80));
  
  // 4. アクティブな訪問記録
  console.log(`\n👥 ACTIVE VISITS (${visits.length} records with TTL)`);
  if (visits.length > 0) {
    console.log('═'.repeat(60));
    console.log('| Visit Key                                | TTL         |');
    console.log('|' + '-'.repeat(42) + '|' + '-'.repeat(13) + '|');
    
    visits.slice(0, 10).forEach(visit => {
      const shortKey = visit.key.length > 40 ? visit.key.substring(0, 37) + '...' : visit.key;
      console.log(`| ${shortKey.padEnd(40)} | ${visit.ttl.padEnd(11)} |`);
    });
    
    if (visits.length > 10) {
      console.log(`| ... and ${visits.length - 10} more records                    |             |`);
    }
    console.log('═'.repeat(60));
  }
  
  // 5. メモリ使用量の概算
  console.log('\n💾 MEMORY USAGE ESTIMATE');
  console.log('═'.repeat(50));
  const metadataSize = counters.size * 300; // バイト
  const counterSize = counters.size * 80;
  const urlSize = urls.size * 100;
  const visitSize = visits.length * 96;
  let dailySize = 0;
  for (const [, data] of counters) {
    dailySize += data.dailyData.size * 80;
  }
  
  const totalSize = metadataSize + counterSize + urlSize + visitSize + dailySize;
  
  console.log(`| Type        | Count | Size (estimate)     |`);
  console.log(`|${'-'.repeat(13)}|${'-'.repeat(7)}|${'-'.repeat(21)}|`);
  console.log(`| Metadata    | ${String(counters.size).padStart(5)} | ${(metadataSize/1024).toFixed(2).padStart(10)} KB |`);
  console.log(`| Counters    | ${String(counters.size).padStart(5)} | ${(counterSize/1024).toFixed(2).padStart(10)} KB |`);
  console.log(`| URLs        | ${String(urls.size).padStart(5)} | ${(urlSize/1024).toFixed(2).padStart(10)} KB |`);
  console.log(`| Daily Data  | ${String(dailySize/80).padStart(5)} | ${(dailySize/1024).toFixed(2).padStart(10)} KB |`);
  console.log(`| Visits      | ${String(visits.length).padStart(5)} | ${(visitSize/1024).toFixed(2).padStart(10)} KB |`);
  console.log(`|${'-'.repeat(13)}|${'-'.repeat(7)}|${'-'.repeat(21)}|`);
  console.log(`| TOTAL       |       | ${(totalSize/1024).toFixed(2).padStart(10)} KB |`);
  console.log(`|             |       | ${(totalSize/1024/1024).toFixed(2).padStart(10)} MB |`);
  console.log('═'.repeat(50));
  console.log(`\nFree tier limit: 30 MB`);
  console.log(`Usage: ${((totalSize/1024/1024/30)*100).toFixed(1)}%`);
  
  redis.disconnect();
}

showAllData().catch(console.error);