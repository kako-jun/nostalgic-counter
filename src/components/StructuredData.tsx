/**
 * 構造化データ（JSON-LD）コンポーネント
 */

export interface StructuredDataProps {
  data: Record<string, any>
}

export default function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

/**
 * Website構造化データ
 */
export function WebsiteStructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Nostalgic",
    "alternateName": "懐かしいWebツール集",
    "url": "https://nostalgic.llll-ll.com",
    "description": "昔懐かしいWebツール（カウンター・いいね・ランキング・BBS）を最新技術で復活。完全無料で利用でき、レトロな見た目を忠実に再現。",
    "inLanguage": "ja",
    "author": {
      "@type": "Person",
      "name": "kako-jun",
      "url": "https://github.com/kako-jun"
    },
    "publisher": {
      "@type": "Person",
      "name": "kako-jun"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://nostalgic.llll-ll.com/?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  }

  return <StructuredData data={data} />
}

/**
 * Organization構造化データ
 */
export function OrganizationStructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Nostalgic",
    "url": "https://nostalgic.llll-ll.com",
    "logo": "https://nostalgic.llll-ll.com/nostalgic-banner.svg",
    "description": "昔懐かしいWebツールを最新技術で復活させたオープンソースプロジェクト",
    "foundingDate": "2025",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "technical support",
      "url": "https://github.com/kako-jun/nostalgic-counter/issues"
    },
    "sameAs": [
      "https://github.com/kako-jun/nostalgic-counter"
    ]
  }

  return <StructuredData data={data} />
}

/**
 * SoftwareApplication構造化データ
 */
export function SoftwareApplicationStructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Nostalgic Web Tools",
    "applicationCategory": "WebApplication",
    "description": "懐かしのWebツール集：アクセスカウンター、いいねボタン、ランキング、BBS掲示板を無料で提供",
    "url": "https://nostalgic.llll-ll.com",
    "author": {
      "@type": "Person",
      "name": "kako-jun"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "JPY",
      "availability": "https://schema.org/InStock"
    },
    "operatingSystem": "Any",
    "softwareVersion": "1.0.0",
    "datePublished": "2025-01-01",
    "screenshot": "https://nostalgic.llll-ll.com/footer.webp",
    "featureList": [
      "アクセスカウンター",
      "いいねボタン",
      "ランキングシステム", 
      "BBS掲示板",
      "Web Components埋め込み",
      "SVG画像生成",
      "レトロデザイン"
    ],
    "isAccessibleForFree": true
  }

  return <StructuredData data={data} />
}

/**
 * BreadcrumbList構造化データ
 */
export function BreadcrumbStructuredData({ items }: { items: Array<{ name: string; url: string }> }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }

  return <StructuredData data={data} />
}

/**
 * Service構造化データ
 */
export function ServiceStructuredData({ 
  name, 
  description, 
  url, 
  serviceType 
}: { 
  name: string
  description: string 
  url: string
  serviceType: string 
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": name,
    "description": description,
    "url": url,
    "serviceType": serviceType,
    "provider": {
      "@type": "Organization",
      "name": "Nostalgic",
      "url": "https://nostalgic.llll-ll.com"
    },
    "areaServed": "JP",
    "availableLanguage": "ja",
    "isAccessibleForFree": true,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "JPY"
    }
  }

  return <StructuredData data={data} />
}