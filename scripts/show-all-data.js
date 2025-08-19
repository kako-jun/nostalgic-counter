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
  console.log('📊 Counters');
  console.log('═'.repeat(160));
  console.log('| ID                  | URL                                                      | Total | Last Access | Days Idle | Days to Del | Created            |');
  console.log('|' + '-'.repeat(21) + '|' + '-'.repeat(60) + '|' + '-'.repeat(7) + '|' + '-'.repeat(13) + '|' + '-'.repeat(11) + '|' + '-'.repeat(13) + '|' + '-'.repeat(20) + '|');
  
  // URL順にソート（浅い階層を上に、深い階層を下に）
  const sortedCounters = Array.from(counters.entries())
    .filter(([id, data]) => data.metadata)
    .sort(([idA, dataA], [idB, dataB]) => {
      const urlA = dataA.metadata.url;
      const urlB = dataB.metadata.url;
      
      // パス深度で比較（浅い順）
      const pathA = new URL(urlA).pathname;
      const pathB = new URL(urlB).pathname;
      const depthA = pathA.split('/').length;
      const depthB = pathB.split('/').length;
      
      if (depthA !== depthB) return depthA - depthB;
      
      return urlA.localeCompare(urlB);
    });
  
  let totalCounterHits = 0;
  for (const [id, data] of sortedCounters) {
    const url = data.metadata.url.length > 58 ? data.metadata.url.substring(0, 55) + '...' : data.metadata.url;
    const created = new Date(data.metadata.created).toISOString().substring(0, 19);
    
    // 最終アクセス日の計算（最新の日別データから）
    let lastAccess = 'Never';
    let daysIdle = '-';
    let daysToDel = '-';
    
    if (data.dailyData.size > 0) {
      const dates = Array.from(data.dailyData.keys()).sort();
      const lastDate = dates[dates.length - 1];
      lastAccess = lastDate;
      
      const today = new Date().toISOString().substring(0, 10);
      const lastAccessDate = new Date(lastDate);
      const todayDate = new Date(today);
      const diffTime = todayDate.getTime() - lastAccessDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      daysIdle = String(diffDays);
      daysToDel = String(Math.max(0, 365 - diffDays));
    }
    
    totalCounterHits += data.total;
    console.log(`| ${id.padEnd(19)} | ${url.padEnd(58)} | ${String(data.total).padStart(5)} | ${lastAccess.padEnd(11)} | ${String(daysIdle).padStart(9)} | ${String(daysToDel).padStart(11)} | ${created} |`);
  }
  console.log('═'.repeat(160));
  console.log(`Total counters: ${counters.size}, Total hits: ${totalCounterHits}\n`);
  console.log(`Total counters: ${counters.size}\n`);
  
  // 2. いいねテーブル
  console.log('💖 Likes');
  console.log('═'.repeat(160));
  console.log('| ID                  | URL                                                      | Total | Last Access | Days Idle | Days to Del | Created            |');
  console.log('|' + '-'.repeat(21) + '|' + '-'.repeat(60) + '|' + '-'.repeat(7) + '|' + '-'.repeat(13) + '|' + '-'.repeat(11) + '|' + '-'.repeat(13) + '|' + '-'.repeat(20) + '|');
  
  // URL順にソート（浅い階層を上に、深い階層を下に）
  const sortedLikes = Array.from(likes.entries())
    .filter(([id, data]) => data.metadata)
    .sort(([idA, dataA], [idB, dataB]) => {
      const urlA = dataA.metadata.url;
      const urlB = dataB.metadata.url;
      
      // パス深度で比較（浅い順）
      const pathA = new URL(urlA).pathname;
      const pathB = new URL(urlB).pathname;
      const depthA = pathA.split('/').length;
      const depthB = pathB.split('/').length;
      
      if (depthA !== depthB) return depthA - depthB;
      
      return urlA.localeCompare(urlB);
    });
    
  let totalLikes = 0;
  for (const [id, data] of sortedLikes) {
    const url = data.metadata.url.length > 58 ? data.metadata.url.substring(0, 55) + '...' : data.metadata.url;
    const created = new Date(data.metadata.created).toISOString().substring(0, 19);
    
    // いいねサービスは日別データがないので、作成日からの計算
    const createdDate = new Date(data.metadata.created);
    const today = new Date();
    const diffTime = today.getTime() - createdDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const lastAccess = data.total > 0 ? 'Unknown' : 'Never';
    const daysIdle = String(diffDays);
    const daysToDel = String(Math.max(0, 365 - diffDays));
    
    totalLikes += data.total;
    console.log(`| ${id.padEnd(19)} | ${url.padEnd(58)} | ${String(data.total).padStart(5)} | ${lastAccess.padEnd(11)} | ${String(daysIdle).padStart(9)} | ${String(daysToDel).padStart(11)} | ${created} |`);
  }
  console.log('═'.repeat(160));
  console.log(`Total likes: ${likes.size}, Total hearts: ${totalLikes}\n`);
  
  // 3. ランキングテーブル
  console.log('🏆 Rankings');
  console.log('═'.repeat(160));
  console.log('| ID                  | URL                                                      | Entries | Last Access | Days Idle | Days to Del | Created            |');
  console.log('|' + '-'.repeat(21) + '|' + '-'.repeat(60) + '|' + '-'.repeat(9) + '|' + '-'.repeat(13) + '|' + '-'.repeat(11) + '|' + '-'.repeat(13) + '|' + '-'.repeat(20) + '|');
  
  // URL順にソート（浅い階層を上に、深い階層を下に）
  const sortedRankings = Array.from(rankings.entries())
    .filter(([id, data]) => data.metadata)
    .sort(([idA, dataA], [idB, dataB]) => {
      const urlA = dataA.metadata.url;
      const urlB = dataB.metadata.url;
      
      // パス深度で比較（浅い順）
      const pathA = new URL(urlA).pathname;
      const pathB = new URL(urlB).pathname;
      const depthA = pathA.split('/').length;
      const depthB = pathB.split('/').length;
      
      if (depthA !== depthB) return depthA - depthB;
      
      return urlA.localeCompare(urlB);
    });
    
  let totalRankingEntries = 0;
  for (const [id, data] of sortedRankings) {
    const url = data.metadata.url.length > 58 ? data.metadata.url.substring(0, 55) + '...' : data.metadata.url;
    const created = new Date(data.metadata.created).toISOString().substring(0, 19);
    
    // ランキングサービスも日別データがないので、作成日からの計算
    const createdDate = new Date(data.metadata.created);
    const today = new Date();
    const diffTime = today.getTime() - createdDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const lastAccess = data.entries > 0 ? 'Unknown' : 'Never';
    const daysIdle = String(diffDays);
    const daysToDel = String(Math.max(0, 365 - diffDays));
    
    totalRankingEntries += data.entries;
    console.log(`| ${id.padEnd(19)} | ${url.padEnd(58)} | ${String(data.entries).padStart(7)} | ${lastAccess.padEnd(11)} | ${String(daysIdle).padStart(9)} | ${String(daysToDel).padStart(11)} | ${created} |`);
  }
  console.log('═'.repeat(160));
  console.log(`Total rankings: ${rankings.size}, Total entries: ${totalRankingEntries}\n`);
  
  // 4. BBSテーブル
  console.log('💬 BBS');
  console.log('═'.repeat(160));
  console.log('| ID                  | URL                                                      | Messages | Last Access | Days Idle | Days to Del | Created            |');
  console.log('|' + '-'.repeat(21) + '|' + '-'.repeat(60) + '|' + '-'.repeat(10) + '|' + '-'.repeat(13) + '|' + '-'.repeat(11) + '|' + '-'.repeat(13) + '|' + '-'.repeat(20) + '|');
  
  // URL順にソート（浅い階層を上に、深い階層を下に）
  const sortedBbses = Array.from(bbses.entries())
    .filter(([id, data]) => data.metadata)
    .sort(([idA, dataA], [idB, dataB]) => {
      const urlA = dataA.metadata.url;
      const urlB = dataB.metadata.url;
      
      // パス深度で比較（浅い順）
      const pathA = new URL(urlA).pathname;
      const pathB = new URL(urlB).pathname;
      const depthA = pathA.split('/').length;
      const depthB = pathB.split('/').length;
      
      if (depthA !== depthB) return depthA - depthB;
      
      return urlA.localeCompare(urlB);
    });
    
  let totalBbsMessages = 0;
  for (const [id, data] of sortedBbses) {
    const url = data.metadata.url.length > 58 ? data.metadata.url.substring(0, 55) + '...' : data.metadata.url;
    const created = new Date(data.metadata.created).toISOString().substring(0, 19);
    
    // BBSも日別データがないので、作成日からの計算
    const createdDate = new Date(data.metadata.created);
    const today = new Date();
    const diffTime = today.getTime() - createdDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const lastAccess = data.messages > 0 ? 'Unknown' : 'Never';
    const daysIdle = String(diffDays);
    const daysToDel = String(Math.max(0, 365 - diffDays));
    
    totalBbsMessages += data.messages;
    console.log(`| ${id.padEnd(19)} | ${url.padEnd(58)} | ${String(data.messages).padStart(8)} | ${lastAccess.padEnd(11)} | ${String(daysIdle).padStart(9)} | ${String(daysToDel).padStart(11)} | ${created} |`);
  }
  console.log('═'.repeat(160));
  console.log(`Total BBS: ${bbses.size}, Total messages: ${totalBbsMessages}\n`);
  
  // 5. 日別データテーブル（カウンターのみ）
  if (counters.size > 0) {
    console.log('📅 Daily Data (Counters)');
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
  console.log('🔗 URL Mappings');
  console.log('═'.repeat(100));
  console.log('| URL                                                            | Service ID          |');
  console.log('|' + '-'.repeat(64) + '|' + '-'.repeat(21) + '|');
  
  // サービス種別順（counter, like, ranking, bbs）、次にURL順でソート
  const sortedUrls = Array.from(urls.entries()).sort(([urlA, idA], [urlB, idB]) => {
    // URLからサービス種別を抽出
    const serviceA = urlA.split(':')[0];
    const serviceB = urlB.split(':')[0];
    
    // サービス種別の優先順位を定義
    const serviceOrder = { 'counter': 1, 'like': 2, 'ranking': 3, 'bbs': 4 };
    const orderA = serviceOrder[serviceA] || 5;
    const orderB = serviceOrder[serviceB] || 5;
    
    // サービス種別で比較
    if (orderA !== orderB) return orderA - orderB;
    
    // 同じサービス種別の場合は、実際のURL部分でソート（パス深度順）
    const actualUrlA = urlA.substring(urlA.indexOf(':') + 1);
    const actualUrlB = urlB.substring(urlB.indexOf(':') + 1);
    
    try {
      const pathA = new URL(actualUrlA).pathname;
      const pathB = new URL(actualUrlB).pathname;
      const depthA = pathA.split('/').length;
      const depthB = pathB.split('/').length;
      
      if (depthA !== depthB) return depthA - depthB;
    } catch (e) {
      // URL解析失敗時は文字列比較にフォールバック
    }
    
    return actualUrlA.localeCompare(actualUrlB);
  });
  
  for (const [url, id] of sortedUrls) {
    const shortUrl = url.length > 62 ? url.substring(0, 59) + '...' : url;
    console.log(`| ${shortUrl.padEnd(62)} | ${id.padEnd(19)} |`);
  }
  console.log('═'.repeat(100));
  console.log();
  
  // 7. アクティブな訪問記録
  console.log(`👥 Active Sessions (${visits.length} records with TTL)`);
  if (visits.length > 0) {
    console.log('═'.repeat(60));
    console.log('| Session Key                              | TTL         |');
    console.log('|' + '-'.repeat(42) + '|' + '-'.repeat(13) + '|');
    
    // TTL降順でソート（長い時間残っているものから表示）
    const sortedVisits = visits.sort((a, b) => {
      // TTL文字列から秒数に変換して比較
      const getTtlSeconds = (ttl) => {
        if (ttl === 'No TTL') return -1;
        const match = ttl.match(/(\d+)h (\d+)m/);
        if (match) {
          return parseInt(match[1]) * 3600 + parseInt(match[2]) * 60;
        }
        return 0;
      };
      return getTtlSeconds(b.ttl) - getTtlSeconds(a.ttl);
    });
    
    sortedVisits.slice(0, 10).forEach(visit => {
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
  console.log('📈 Service Statistics');
  console.log('═'.repeat(35));
  console.log(`| Service     | Count |`);
  console.log(`|${'-'.repeat(13)}|${'-'.repeat(7)}|`);
  console.log(`| Counters    | ${String(counters.size).padStart(5)} |`);
  console.log(`| Likes       | ${String(likes.size).padStart(5)} |`);
  console.log(`| Rankings    | ${String(rankings.size).padStart(5)} |`);
  console.log(`| BBS         | ${String(bbses.size).padStart(5)} |`);
  console.log(`|${'-'.repeat(13)}|${'-'.repeat(7)}|`);
  console.log(`| TOTAL       | ${String(counters.size + likes.size + rankings.size + bbses.size).padStart(5)} |`);
  console.log('═'.repeat(35));
  
  // 9. メモリ使用量の概算
  console.log('\n💾 Memory Usage Estimate');
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
  console.log(`\nAuto-deletion: Services with 365+ days of inactivity are automatically deleted`);
  
  redis.disconnect();
}

showAllData().catch(console.error);