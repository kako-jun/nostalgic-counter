/**
 * コンテンツフィルター設定
 * 不適切な投稿を検出するためのパターン定義
 */

/**
 * 禁止パターンの定義
 */
const BANNED_PATTERNS = [
  // 英語の不適切語（強い表現）
  /\b(fuck|fucking|shit|shitting|damn|damned|bitch|bastard|asshole|piss|pissed|cunt|whore|slut)\b/i,
  
  
  // 日本語の極度に攻撃的な表現のみ
  /\b(死ね|しね|殺す|ころす|消えろ|きえろ)\b/i,
  
  // 差別的表現（重度のもののみ）
  /\b(キチガイ|きちがい|気違い)\b/i,
  
  // 宣伝・スパム系（典型的な広告パターン）
  /\b(副業|稼げる|簡単に|儲かる|もうかる|今すぐ|クリック|登録|タダ)\b/i,
  /\b(出会い|であい|セックス|エッチ|アダルト|風俗|キャバクラ|ソープ)\b/i,
  /\b(サラ金|借金|ローン|融資|投資|ギャンブル|パチンコ|競馬)\b/i,
  
  // 中国語スパム（典型的なパターン）
  /[加微信|微信|QQ|代理|招商|赚钱|免费|优惠|折扣]/i,
  /[网址|链接|点击|注册|登录|下载]/i,
  
  // ネット特有の荒らし表現
  /\b(荒らし|あらし|煽り|あおり|炎上|えんじょう|バカッター|ざまあ|ざまぁ)\b/i,
  /\b(うぜー|きめー|だりー|むかつく|いらつく|ぶちぎれ)\b/i,
  
  // 暴力的表現（重度のもののみ）
  /\b(殺人|さつじん|テロ|爆弾|ばくだん)\b/i,
  
  // 薬物・違法行為
  /\b(麻薬|まやく|覚醒剤|かくせいざい|大麻|たいま|コカイン|ヘロイン)\b/i,
  /\b(万引き|まんびき|窃盗|せっとう|詐欺|さぎ|恐喝|きょうかつ)\b/i,
]

/**
 * コンテンツフィルタークラス
 */
export class ContentFilter {
  /**
   * テキストに不適切な内容が含まれているかチェック
   */
  static isProfane(text: string): boolean {
    return BANNED_PATTERNS.some(pattern => pattern.test(text))
  }
  
  /**
   * テキストをクリーンアップ（将来的な機能）
   */
  static clean(text: string): string {
    let cleaned = text
    BANNED_PATTERNS.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '***')
    })
    return cleaned
  }
}