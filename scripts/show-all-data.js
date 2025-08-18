const Redis = require('ioredis');
require('dotenv').config({ path: '.env.local' });

async function showAllData() {
  if (!process.env.REDIS_URL) {
    console.log('REDIS_URL not set');
    console.log('Please create .env.local file with REDIS_URL');
    return;
  }
  
  const redis = new Redis(process.env.REDIS_URL);
  
  console.log('=== Nostalgic Services - All Data ===\n');
  
  // すべてのキーを取得
  const keys = await redis.keys('*');
  
  // キーをサービス別に分類
  const counters = new Map(); // カウンターID -> データ
  const likes = new Map();    // いいねID -> データ
  const rankings = new Map(); // ランキングID -> データ
  const bbses = new Map();    // BBSID -> データ
  const urls = new Map();     // URL -> ID (各サービス)
  const visits = [];          // 訪問記録
  const dailyData = new Map(); // ID -> 日付 -> カウント
  
  // 各キーのデータを取得
  for (const key of keys) {
    const ttl = await redis.ttl(key);
    
    if (key.startsWith('counter:')) {
      const parts = key.split(':');
      const id = parts[1];
      
      if (key.includes(':total')) {
        if (!counters.has(id)) counters.set(id, { total: 0, dailyData: new Map() });
        counters.get(id).total = parseInt(await redis.get(key) || 0);
      } else if (key.includes(':daily:')) {
        const date = parts[3];
        if (!counters.has(id)) counters.set(id, { total: 0, dailyData: new Map() });
        counters.get(id).dailyData.set(date, parseInt(await redis.get(key)));
      } else if (!key.includes(':owner') && !key.includes(':lastVisit')) {
        if (!counters.has(id)) {
          counters.set(id, { metadata: null, total: 0, dailyData: new Map() });
        }
        counters.get(id).metadata = JSON.parse(await redis.get(key));
      }
    } else if (key.startsWith('like:')) {
      const parts = key.split(':');
      const id = parts[1];
      
      if (key.includes(':total')) {
        if (!likes.has(id)) likes.set(id, { total: 0 });
        likes.get(id).total = parseInt(await redis.get(key) || 0);
      } else if (!key.includes(':owner') && !key.includes(':users')) {
        if (!likes.has(id)) likes.set(id, { metadata: null, total: 0 });
        likes.get(id).metadata = JSON.parse(await redis.get(key));
      }
    } else if (key.startsWith('ranking:')) {
      const parts = key.split(':');
      const id = parts[1];
      
      if (key.includes(':scores')) {
        if (!rankings.has(id)) rankings.set(id, { entries: 0 });
        rankings.get(id).entries = await redis.zcard(key);
      } else if (!key.includes(':owner') && !key.includes(':meta')) {
        if (!rankings.has(id)) rankings.set(id, { metadata: null, entries: 0 });
        rankings.get(id).metadata = JSON.parse(await redis.get(key));
      }
    } else if (key.startsWith('bbs:')) {
      const parts = key.split(':');
      const id = parts[1];
      
      if (key.includes(':messages')) {
        if (!bbses.has(id)) bbses.set(id, { messages: 0 });
        bbses.get(id).messages = await redis.llen(key);
      } else if (!key.includes(':owner')) {
        if (!bbses.has(id)) bbses.set(id, { metadata: null, messages: 0 });
        bbses.get(id).metadata = JSON.parse(await redis.get(key));
      }
    } else if (key.startsWith('url:')) {
      const url = decodeURIComponent(key.substring(4));
      urls.set(url, await redis.get(key));
    } else if (key.startsWith('visit:') || key.startsWith('like:') && key.includes(':users:')) {
      visits.push({
        key: key,
        ttl: ttl > 0 ? `${Math.floor(ttl/3600)}h ${Math.floor((ttl%3600)/60)}m` : 'No TTL'
      });
    }
  }
  
  // 1. カウンターテーブル
  console.log('📊 COUNTERS');
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
  
  // 2. いいねテーブル
  console.log('💖 LIKES');
  console.log('═'.repeat(100));
  console.log('| ID                  | URL                                    | Total | Created            |');
  console.log('|' + '-'.repeat(21) + '|' + '-'.repeat(40) + '|' + '-'.repeat(7) + '|' + '-'.repeat(20) + '|');
  
  for (const [id, data] of likes) {
    if (data.metadata) {
      const url = data.metadata.url.substring(0, 38);
      const created = new Date(data.metadata.created).toISOString().substring(0, 19);
      console.log(`| ${id.padEnd(19)} | ${url.padEnd(38)} | ${String(data.total).padStart(5)} | ${created} |`);
    }
  }
  console.log('═'.repeat(100));
  console.log(`Total likes: ${likes.size}\n`);
  
  // 3. ランキングテーブル
  console.log('🏆 RANKINGS');
  console.log('═'.repeat(100));
  console.log('| ID                  | URL                                    | Entries | Created          |');
  console.log('|' + '-'.repeat(21) + '|' + '-'.repeat(40) + '|' + '-'.repeat(9) + '|' + '-'.repeat(18) + '|');
  
  for (const [id, data] of rankings) {
    if (data.metadata) {
      const url = data.metadata.url.substring(0, 38);
      const created = new Date(data.metadata.created).toISOString().substring(0, 19);
      console.log(`| ${id.padEnd(19)} | ${url.padEnd(38)} | ${String(data.entries).padStart(7)} | ${created} |`);
    }
  }
  console.log('═'.repeat(100));
  console.log(`Total rankings: ${rankings.size}\n`);
  
  // 4. BBSテーブル
  console.log('💬 BBS');
  console.log('═'.repeat(100));
  console.log('| ID                  | URL                                    | Messages | Created         |');
  console.log('|' + '-'.repeat(21) + '|' + '-'.repeat(40) + '|' + '-'.repeat(10) + '|' + '-'.repeat(17) + '|');
  
  for (const [id, data] of bbses) {
    if (data.metadata) {
      const url = data.metadata.url.substring(0, 38);
      const created = new Date(data.metadata.created).toISOString().substring(0, 19);
      console.log(`| ${id.padEnd(19)} | ${url.padEnd(38)} | ${String(data.messages).padStart(8)} | ${created} |`);
    }
  }
  console.log('═'.repeat(100));
  console.log(`Total BBS: ${bbses.size}\n`);
  
  // 5. 日別データテーブル（カウンターのみ）
  if (counters.size > 0) {
    console.log('📅 DAILY DATA (COUNTERS)');
    console.log('═'.repeat(80));
    console.log('| Counter ID          | Date       | Count |');
    console.log('|' + '-'.repeat(21) + '|' + '-'.repeat(12) + '|' + '-'.repeat(7) + '|');
    
    // 全ての日別データを収集して日付順にソート
    const allDailyData = [];
    for (const [id, data] of counters) {
      for (const [date, count] of data.dailyData) {
        allDailyData.push({ id, date, count });
      }
    }
    
    // 日付でソート（降順 - 新しい日付から）
    allDailyData.sort((a, b) => b.date.localeCompare(a.date));
    
    // ソートされたデータを表示
    for (const { id, date, count } of allDailyData) {
      console.log(`| ${id.padEnd(19)} | ${date} | ${String(count).padStart(5)} |`);
    }
    console.log('═'.repeat(80));
    console.log();
  }
  
  // 6. URLマッピングテーブル
  console.log('🔗 URL MAPPINGS');
  console.log('═'.repeat(80));
  console.log('| URL                                              | Service ID          |');
  console.log('|' + '-'.repeat(50) + '|' + '-'.repeat(21) + '|');
  
  for (const [url, id] of urls) {
    const shortUrl = url.length > 48 ? url.substring(0, 45) + '...' : url;
    console.log(`| ${shortUrl.padEnd(48)} | ${id.padEnd(19)} |`);
  }
  console.log('═'.repeat(80));
  console.log();
  
  // 7. アクティブな訪問記録
  console.log(`👥 ACTIVE SESSIONS (${visits.length} records with TTL)`);
  if (visits.length > 0) {
    console.log('═'.repeat(60));
    console.log('| Session Key                              | TTL         |');
    console.log('|' + '-'.repeat(42) + '|' + '-'.repeat(13) + '|');
    
    visits.slice(0, 10).forEach(visit => {
      const shortKey = visit.key.length > 40 ? visit.key.substring(0, 37) + '...' : visit.key;
      console.log(`| ${shortKey.padEnd(40)} | ${visit.ttl.padEnd(11)} |`);
    });
    
    if (visits.length > 10) {
      console.log(`| ... and ${visits.length - 10} more records                    |             |`);
    }
    console.log('═'.repeat(60));
    console.log();
  }
  
  // 8. サービス統計
  console.log('📈 SERVICE STATISTICS');
  console.log('═'.repeat(50));
  console.log(`| Service     | Count | Active      |`);
  console.log(`|${'-'.repeat(13)}|${'-'.repeat(7)}|${'-'.repeat(13)}|`);
  console.log(`| Counters    | ${String(counters.size).padStart(5)} | ${String(counters.size).padStart(11)} |`);
  console.log(`| Likes       | ${String(likes.size).padStart(5)} | ${String(likes.size).padStart(11)} |`);
  console.log(`| Rankings    | ${String(rankings.size).padStart(5)} | ${String(rankings.size).padStart(11)} |`);
  console.log(`| BBS         | ${String(bbses.size).padStart(5)} | ${String(bbses.size).padStart(11)} |`);
  console.log(`|${'-'.repeat(13)}|${'-'.repeat(7)}|${'-'.repeat(13)}|`);
  console.log(`| TOTAL       | ${String(counters.size + likes.size + rankings.size + bbses.size).padStart(5)} | ${String(counters.size + likes.size + rankings.size + bbses.size).padStart(11)} |`);
  console.log('═'.repeat(50));
  
  // 9. メモリ使用量の概算
  console.log('\n💾 MEMORY USAGE ESTIMATE');
  console.log('═'.repeat(50));
  const counterMetadata = counters.size * 300;
  const likeMetadata = likes.size * 200;
  const rankingMetadata = rankings.size * 250;
  const bbsMetadata = bbses.size * 200;
  const urlSize = urls.size * 100;
  const sessionSize = visits.length * 96;
  let dailySize = 0;
  for (const [, data] of counters) {
    dailySize += data.dailyData.size * 80;
  }
  
  const totalSize = counterMetadata + likeMetadata + rankingMetadata + bbsMetadata + urlSize + sessionSize + dailySize;
  
  console.log(`| Type        | Count | Size (estimate)     |`);
  console.log(`|${'-'.repeat(13)}|${'-'.repeat(7)}|${'-'.repeat(21)}|`);
  console.log(`| Counters    | ${String(counters.size).padStart(5)} | ${(counterMetadata/1024).toFixed(2).padStart(10)} KB |`);
  console.log(`| Likes       | ${String(likes.size).padStart(5)} | ${(likeMetadata/1024).toFixed(2).padStart(10)} KB |`);
  console.log(`| Rankings    | ${String(rankings.size).padStart(5)} | ${(rankingMetadata/1024).toFixed(2).padStart(10)} KB |`);
  console.log(`| BBS         | ${String(bbses.size).padStart(5)} | ${(bbsMetadata/1024).toFixed(2).padStart(10)} KB |`);
  console.log(`| URLs        | ${String(urls.size).padStart(5)} | ${(urlSize/1024).toFixed(2).padStart(10)} KB |`);
  console.log(`| Daily Data  | ${String(dailySize/80).padStart(5)} | ${(dailySize/1024).toFixed(2).padStart(10)} KB |`);
  console.log(`| Sessions    | ${String(visits.length).padStart(5)} | ${(sessionSize/1024).toFixed(2).padStart(10)} KB |`);
  console.log(`|${'-'.repeat(13)}|${'-'.repeat(7)}|${'-'.repeat(21)}|`);
  console.log(`| TOTAL       |       | ${(totalSize/1024).toFixed(2).padStart(10)} KB |`);
  console.log(`|             |       | ${(totalSize/1024/1024).toFixed(2).padStart(10)} MB |`);
  console.log('═'.repeat(50));
  console.log(`\nFree tier limit: 30 MB`);
  console.log(`Usage: ${((totalSize/1024/1024/30)*100).toFixed(1)}%`);
  
  redis.disconnect();
}

showAllData().catch(console.error);