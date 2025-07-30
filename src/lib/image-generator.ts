import { CounterType } from '@/types/counter'

export interface CounterImageOptions {
  value: number
  type: CounterType
  style?: 'classic' | 'modern' | 'retro'
  digits?: number
}

export function generateCounterSVG(options: CounterImageOptions): string {
  const { value, type, style = 'classic', digits = 6 } = options
  
  // 数値を指定桁数でゼロパディング
  const paddedValue = value.toString().padStart(digits, '0')
  
  // スタイル設定
  const styles = {
    classic: {
      backgroundColor: '#000000',
      textColor: '#00ff00',
      fontFamily: 'monospace',
      fontSize: '16',
      border: '#333333'
    },
    modern: {
      backgroundColor: '#1a1a1a',
      textColor: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14',
      border: '#666666'
    },
    retro: {
      backgroundColor: '#800080',
      textColor: '#ffff00',
      fontFamily: 'Courier New, Liberation Mono, DejaVu Sans Mono, monospace',
      fontSize: '18',
      border: '#ff00ff'
    }
  }
  
  const currentStyle = styles[style]
  const width = digits * 12 + 20
  const height = 30
  
  // 表示ラベル
  const labels = {
    total: '総計',
    today: '今日',
    yesterday: '昨日',
    week: '週間',
    month: '月間'
  }
  
  const label = labels[type]
  const labelWidth = label.length * 8 + 10
  const totalWidth = Math.max(width, labelWidth)
  
  return `
    <svg width="${totalWidth}" height="50" xmlns="http://www.w3.org/2000/svg">
      <!-- 背景 -->
      <rect width="${totalWidth}" height="50" fill="${currentStyle.backgroundColor}" stroke="${currentStyle.border}" stroke-width="1"/>
      
      <!-- ラベル -->
      <text x="${totalWidth / 2}" y="15" 
            fill="${currentStyle.textColor}" 
            font-family="${currentStyle.fontFamily}" 
            font-size="10" 
            text-anchor="middle">${label}</text>
      
      <!-- カウンター値 -->
      <text x="${totalWidth / 2}" y="32" 
            fill="${currentStyle.textColor}" 
            font-family="${currentStyle.fontFamily}" 
            font-size="${currentStyle.fontSize}" 
            text-anchor="middle" 
            font-weight="bold"
            dominant-baseline="middle">${paddedValue}</text>
    </svg>
  `.trim()
}

export function generateCounterWebP(options: CounterImageOptions): Buffer {
  // SVGからWebPへの変換（実際の実装では sharp などのライブラリを使用）
  // 簡易実装として、SVGをそのまま返す
  const svg = generateCounterSVG(options)
  return Buffer.from(svg, 'utf-8')
}