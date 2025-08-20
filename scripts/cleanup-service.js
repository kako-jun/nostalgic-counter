#!/usr/bin/env node
/**
 * サービス完全削除スクリプト
 * URLマッピングとサービスデータを完全に削除
 * 
 * Usage:
 *   npm run cleanup:service {service} {id}
 *   
 * Examples:
 *   npm run cleanup:service counter nostalgic-a1b2c3d4
 *   npm run cleanup:service like example-12345678
 *   npm run cleanup:service ranking test-abcdef12
 *   npm run cleanup:service bbs demo-98765432
 */

const Redis = require('ioredis')
require('dotenv').config({ path: '.env.local' })

if (!process.env.REDIS_URL) {
  console.log('❌ REDIS_URL not set')
  console.log('Please create .env.local file with REDIS_URL')
  process.exit(1)
}

const redis = new Redis(process.env.REDIS_URL)

/**
 * カウンターサービスを完全削除
 */
async function deleteCounter(id) {
  let totalDeleted = 0
  
  console.log(`🗑️  Deleting Counter: ${id}`)
  
  // 1. メタデータから URL を取得
  const metadata = await redis.get(`counter:${id}`)
  if (metadata) {
    const data = JSON.parse(metadata)
    const url = data.url
    console.log(`  URL: ${url}`)
    
    // 2. URLマッピングを削除
    const encodedUrl = encodeURIComponent(`counter:${url}`)
    const mappingKey = `url:${encodedUrl}`
    const mappingDeleted = await redis.del(mappingKey)
    if (mappingDeleted > 0) {
      console.log(`  ✅ Deleted URL mapping: ${mappingKey}`)
      totalDeleted += mappingDeleted
    }
  }
  
  // 3. メタデータを削除
  const metadataDeleted = await redis.del(`counter:${id}`)
  if (metadataDeleted > 0) {
    console.log(`  ✅ Deleted metadata`)
    totalDeleted += metadataDeleted
  }
  
  // 4. 関連データを削除
  const patterns = [
    `counter:${id}:*`,      // total, daily:*, owner
    `visit:counter:${id}:*` // 訪問記録
  ]
  
  for (const pattern of patterns) {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      const deleted = await redis.del(...keys)
      console.log(`  ✅ Deleted ${deleted} keys matching: ${pattern}`)
      totalDeleted += deleted
    }
  }
  
  // 5. インデックスから削除
  const indexDeleted = await redis.zrem('counters:index', id)
  if (indexDeleted > 0) {
    console.log(`  ✅ Removed from index`)
    totalDeleted += indexDeleted
  }
  
  return totalDeleted
}

/**
 * いいねサービスを完全削除
 */
async function deleteLike(id) {
  let totalDeleted = 0
  
  console.log(`🗑️  Deleting Like: ${id}`)
  
  // 1. メタデータから URL を取得
  const metadata = await redis.get(`like:${id}`)
  if (metadata) {
    const data = JSON.parse(metadata)
    const url = data.url
    console.log(`  URL: ${url}`)
    
    // 2. URLマッピングを削除
    const encodedUrl = encodeURIComponent(`like:${url}`)
    const mappingKey = `url:${encodedUrl}`
    const mappingDeleted = await redis.del(mappingKey)
    if (mappingDeleted > 0) {
      console.log(`  ✅ Deleted URL mapping: ${mappingKey}`)
      totalDeleted += mappingDeleted
    }
  }
  
  // 3. メタデータを削除
  const metadataDeleted = await redis.del(`like:${id}`)
  if (metadataDeleted > 0) {
    console.log(`  ✅ Deleted metadata`)
    totalDeleted += metadataDeleted
  }
  
  // 4. 関連データを削除
  const directKeys = [
    `like:${id}:total`,
    `like:${id}:owner`
  ]
  
  for (const key of directKeys) {
    const deleted = await redis.del(key)
    if (deleted > 0) {
      console.log(`  ✅ Deleted: ${key}`)
      totalDeleted += deleted
    }
  }
  
  // ユーザー状態を削除
  const userKeys = await redis.keys(`like:${id}:users:*`)
  if (userKeys.length > 0) {
    const deleted = await redis.del(...userKeys)
    console.log(`  ✅ Deleted ${deleted} user state keys`)
    totalDeleted += deleted
  }
  
  // 5. インデックスから削除
  const indexDeleted = await redis.zrem('likes:index', id)
  if (indexDeleted > 0) {
    console.log(`  ✅ Removed from index`)
    totalDeleted += indexDeleted
  }
  
  return totalDeleted
}

/**
 * ランキングサービスを完全削除
 */
async function deleteRanking(id) {
  let totalDeleted = 0
  
  console.log(`🗑️  Deleting Ranking: ${id}`)
  
  // 1. メタデータから URL を取得
  const metadata = await redis.get(`ranking:${id}`)
  if (metadata) {
    const data = JSON.parse(metadata)
    const url = data.url
    console.log(`  URL: ${url}`)
    
    // 2. URLマッピングを削除
    const encodedUrl = encodeURIComponent(`ranking:${url}`)
    const mappingKey = `url:${encodedUrl}`
    const mappingDeleted = await redis.del(mappingKey)
    if (mappingDeleted > 0) {
      console.log(`  ✅ Deleted URL mapping: ${mappingKey}`)
      totalDeleted += mappingDeleted
    }
  }
  
  // 3. メタデータを削除
  const metadataDeleted = await redis.del(`ranking:${id}`)
  if (metadataDeleted > 0) {
    console.log(`  ✅ Deleted metadata`)
    totalDeleted += metadataDeleted
  }
  
  // 4. 関連データを削除
  const directKeys = [
    `ranking:${id}:scores`,
    `ranking:${id}:owner`,
    `ranking:${id}:meta`
  ]
  
  for (const key of directKeys) {
    const deleted = await redis.del(key)
    if (deleted > 0) {
      console.log(`  ✅ Deleted: ${key}`)
      totalDeleted += deleted
    }
  }
  
  // 5. インデックスから削除
  const indexDeleted = await redis.zrem('rankings:index', id)
  if (indexDeleted > 0) {
    console.log(`  ✅ Removed from index`)
    totalDeleted += indexDeleted
  }
  
  return totalDeleted
}

/**
 * BBSサービスを完全削除
 */
async function deleteBBS(id) {
  let totalDeleted = 0
  
  console.log(`🗑️  Deleting BBS: ${id}`)
  
  // 1. メタデータから URL を取得
  const metadata = await redis.get(`bbs:${id}`)
  if (metadata) {
    const data = JSON.parse(metadata)
    const url = data.url
    console.log(`  URL: ${url}`)
    
    // 2. URLマッピングを削除
    const encodedUrl = encodeURIComponent(`bbs:${url}`)
    const mappingKey = `url:${encodedUrl}`
    const mappingDeleted = await redis.del(mappingKey)
    if (mappingDeleted > 0) {
      console.log(`  ✅ Deleted URL mapping: ${mappingKey}`)
      totalDeleted += mappingDeleted
    }
  }
  
  // 3. メタデータを削除
  const metadataDeleted = await redis.del(`bbs:${id}`)
  if (metadataDeleted > 0) {
    console.log(`  ✅ Deleted metadata`)
    totalDeleted += metadataDeleted
  }
  
  // 4. 関連データを削除
  const directKeys = [
    `bbs:${id}:messages`,
    `bbs:${id}:owner`
  ]
  
  for (const key of directKeys) {
    const deleted = await redis.del(key)
    if (deleted > 0) {
      console.log(`  ✅ Deleted: ${key}`)
      totalDeleted += deleted
    }
  }
  
  // 5. インデックスから削除
  const indexDeleted = await redis.zrem('bbses:index', id)
  if (indexDeleted > 0) {
    console.log(`  ✅ Removed from index`)
    totalDeleted += indexDeleted
  }
  
  return totalDeleted
}

/**
 * メイン処理
 */
async function main() {
  const service = process.argv[2]
  const id = process.argv[3]
  
  if (!service || !id) {
    console.log('Usage: npm run cleanup:service {service} {id}')
    console.log('Services: counter, like, ranking, bbs')
    console.log('Example: npm run cleanup:service counter nostalgic-a1b2c3d4')
    await redis.quit()
    process.exit(1)
  }
  
  const validServices = ['counter', 'like', 'ranking', 'bbs']
  if (!validServices.includes(service)) {
    console.log(`❌ Invalid service: ${service}`)
    console.log(`Valid services: ${validServices.join(', ')}`)
    await redis.quit()
    process.exit(1)
  }
  
  console.log(`\n🧹 Starting complete deletion of ${service}: ${id}\n`)
  
  let totalDeleted = 0
  
  try {
    switch (service) {
      case 'counter':
        totalDeleted = await deleteCounter(id)
        break
      case 'like':
        totalDeleted = await deleteLike(id)
        break
      case 'ranking':
        totalDeleted = await deleteRanking(id)
        break
      case 'bbs':
        totalDeleted = await deleteBBS(id)
        break
    }
    
    if (totalDeleted > 0) {
      console.log(`\n✅ Successfully deleted ${totalDeleted} keys`)
    } else {
      console.log(`\n⚠️  No data found for ${service}: ${id}`)
    }
    
  } catch (error) {
    console.error(`\n❌ Error:`, error.message)
    process.exit(1)
  }
  
  await redis.quit()
}

main().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})