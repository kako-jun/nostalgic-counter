# Counter Service API

## Overview

Traditional visitor counter that tracks visits across multiple time periods with nostalgic display styles.

## Actions

### create
Create a new counter or get existing counter ID.

```
GET /api/visit?action=create&url={URL}&token={TOKEN}
```

**Parameters:**
- `url` (required): Target URL for counting
- `token` (required): Owner token (8-16 characters)

**Response:**
```json
{
  "id": "yoursite-a7b9c3d4",
  "url": "https://yoursite.com"
}
```

### increment
Count up the counter (automatic duplicate prevention).

```
GET /api/visit?action=increment&id={ID}
```

**Parameters:**
- `id` (required): Public counter ID

**Response:**
```json
{
  "id": "yoursite-a7b9c3d4",
  "url": "https://yoursite.com",
  "total": 2,
  "today": 2,
  "yesterday": 0,
  "week": 2,
  "month": 2,
  "lastVisit": "2025-07-30T12:05:00Z"
}
```

### display
Get counter data or image.

```
GET /api/visit?action=display&id={ID}&type={TYPE}&theme={THEME}&format={FORMAT}
```

**Parameters:**
- `id` (required): Public counter ID
- `type` (optional): Display type
  - `total` (default): Total count
  - `today`: Today's count
  - `yesterday`: Yesterday's count
  - `week`: Last 7 days
  - `month`: Last 30 days
- `theme` (optional): Visual style (for image format)
  - `classic` (default): Green on black (90s terminal style)
  - `modern`: White on gray (2000s clean style)
  - `retro`: Yellow on purple (80s neon style)
- `format` (optional): Response format
  - `image` (default): SVG image
  - `text`: Plain text number (no styling)
- `digits` (optional): Zero-padding digits (only when specified, for both image and text formats)

**Response:**
- `format=image`: SVG image
- `format=text`: Plain text number

### set
Set counter value (owner only).

```
GET /api/visit?action=set&url={URL}&token={TOKEN}&total={VALUE}
```

**Parameters:**
- `url` (required): Target URL
- `token` (required): Owner token
- `total` (required): New total value

**Response:**
```json
{
  "id": "yoursite-a7b9c3d4",
  "url": "https://yoursite.com",
  "total": 12345,
  "today": 0,
  "yesterday": 0,
  "week": 0,
  "month": 0
}
```

## Web Component Integration

```html
<script src="https://nostalgic.llll-ll.com/components/visit.js"></script>

<!-- Image format (default) -->
<nostalgic-counter 
  id="yoursite-a7b9c3d4" 
  type="total" 
  theme="classic"
  digits="6">
</nostalgic-counter>

<!-- Text format -->
<nostalgic-counter 
  id="yoursite-a7b9c3d4" 
  type="total" 
  format="text">
</nostalgic-counter>

<!-- Text format with zero-padding -->
<nostalgic-counter 
  id="yoursite-a7b9c3d4" 
  type="total" 
  format="text"
  digits="6">
</nostalgic-counter>
```

**Attributes:**
- `id`: Counter public ID
- `type`: Display type (total, today, yesterday, week, month)
- `theme`: Visual style (classic, modern, retro) - only for image format
- `format`: Output format (image, text) - default: image
- `digits`: Zero-padding digits (only when specified)
- `api-base`: Custom API base URL (optional)

## TypeScript Support

For TypeScript projects using Web Components, create a `types.d.ts` file in your project root:

```typescript
// types.d.ts
import 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'nostalgic-counter': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        id?: string;
        type?: 'total' | 'today' | 'yesterday' | 'week' | 'month';
        theme?: 'classic' | 'modern' | 'retro';
        digits?: string;
        scale?: string;
      };
    }
  }
}
```

This prevents TypeScript build errors when using Web Components in React/Next.js projects.

## Usage Examples

### Basic Counter Setup
```javascript
// 1. Create counter
const response = await fetch('/api/visit?action=create&url=https://myblog.com&token=my-secret')
const data = await response.json()
console.log('Counter ID:', data.id)

// 2. Embed in HTML
document.body.innerHTML += `
  <script src="/components/display.js"></script>
  <nostalgic-counter id="${data.id}" type="total" theme="classic"></nostalgic-counter>
`
```

### Multiple Period Display
```html
<!-- Different time periods, same counter -->
<nostalgic-counter id="blog-a7b9c3d4" type="total" theme="classic"></nostalgic-counter>
<nostalgic-counter id="blog-a7b9c3d4" type="today" theme="modern"></nostalgic-counter>
<nostalgic-counter id="blog-a7b9c3d4" type="week" theme="retro"></nostalgic-counter>
```

### Text Format Integration
```html
<!-- Inline text counters for modern layouts -->
<div class="stats">
  <span>Total visitors: <nostalgic-counter id="blog-a7b9c3d4" type="total" format="text"></nostalgic-counter></span>
  <span>Today: <nostalgic-counter id="blog-a7b9c3d4" type="today" format="text"></nostalgic-counter></span>
</div>

<!-- Zero-padded display -->
<div class="retro-style">
  Visitor Count: <nostalgic-counter id="blog-a7b9c3d4" type="total" format="text" digits="8"></nostalgic-counter>
</div>
```

### Manual Count Control
```javascript
// Count manually (no automatic counting)
const count = await fetch('/api/visit?action=increment&id=blog-a7b9c3d4')
const data = await count.json()

// Display as image
document.querySelector('#counter').src = 
  `/api/visit?action=display&id=blog-a7b9c3d4&type=total&theme=classic`
```

## Security Notes

- Owner tokens are stored as SHA256 hashes
- Public IDs are safe to expose (display/count only)
- 24-hour duplicate prevention per IP+UserAgent
- Tokens should not be reused across sites