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
      fontFamily: 'Courier New, Consolas, Monaco, Liberation Mono, DejaVu Sans Mono, monospace',
      fontSize: '16',
      border: '#333333'
    },
    modern: {
      backgroundColor: '#1a1a1a',
      textColor: '#ffffff',
      fontFamily: 'Arial, Helvetica, Helvetica Neue, Roboto, Segoe UI, sans-serif',
      fontSize: '14',
      border: '#666666'
    },
    retro: {
      backgroundColor: '#800080',
      textColor: '#ffff00',
      fontFamily: 'Courier New, Consolas, Monaco, Liberation Mono, DejaVu Sans Mono, monospace',
      fontSize: '18',
      border: '#ff00ff'
    }
  }
  
  const currentStyle = styles[style]
  const width = digits * 12 + 20
  const height = 30
  
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- 背景 -->
      <rect width="${width}" height="${height}" fill="${currentStyle.backgroundColor}" stroke="${currentStyle.border}" stroke-width="1"/>
      
      <!-- カウンター値 -->
      <text x="${width / 2}" y="${style === 'classic' ? (height / 2) + 1 : (height / 2)}" 
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