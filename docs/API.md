# Nostalgic Counter API Reference

## Overview

Nostalgic Counter is a service that recreates the access counters used on old internet sites with modern technology.
It can be installed on any website to record and display visitor counts.

## Important Notes

### About URL Parameters
The `url` parameter is used only as a **counter identifier** and is not used to track other people's websites. A separate counter is created for each URL+token combination, and can only be managed with your secret token. If you want separate counters for different pages, use different URLs (e.g., `https://yoursite.com/blog`, `https://yoursite.com/about`).

### Service Usage
- **Hosted Service**: Use `https://nostalgic-counter.llll-ll.com` (no setup required)
- **Self-hosting**: You can also deploy to Vercel yourself

### Practice Mode
Let's create a counter and see how it works! Follow these steps to try it out:

#### 1. Create a Counter
First, create a counter and get the public ID. Enter this directly in your browser's address bar:
```
https://nostalgic-counter.llll-ll.com/api/count?url=https://demo.example.com&token=demo-secret-123
```
→ The browser will display JSON with a public ID like `"id": "demo-562a8fd7"`

#### 2. Verify Count-up
Use the public ID to increment the counter:
```
https://nostalgic-counter.llll-ll.com/api/count?id=demo-562a8fd7
```
→ The `"total"` value increases with each access (with 24-hour duplicate prevention)

#### 3. Display as Image
View the counter as an image:
```
https://nostalgic-counter.llll-ll.com/api/display?id=demo-562a8fd7&type=total&style=classic
```
→ Shows a nostalgic counter image with green text on black background

#### 4. Display as Text
Get just the number:
```
https://nostalgic-counter.llll-ll.com/api/display?id=demo-562a8fd7&type=total&format=text
```
→ Shows the current count as plain text

#### 5. Management Operation (Set Value)
Finally, change the value with admin privileges:
```
https://nostalgic-counter.llll-ll.com/api/owner?action=set&url=https://demo.example.com&token=demo-secret-123&total=12345
```
→ Sets the counter value to 12345

All these URLs can be accessed directly in your browser, so feel free to try them out!

## Parameter List

### Counter Types (type)
- `total` - Total visitors (default)
- `today` - Today's visitors
- `yesterday` - Yesterday's visitors
- `week` - Last 7 days
- `month` - Last 30 days

### Styles (style)
- `classic` - Green text on black background (90s terminal style)
- `modern` - White text on gray background (2000s clean style)
- `retro` - Yellow text on purple background (80s neon style)

### Other Parameters
- `digits` - Display digits (default: 6)
- `format` - Response format (`text` or `image`, default: `image`)

## Basic Design

### Data Model

Each counter consists of the following elements:
- **URL**: Target URL for counting
- **Public ID**: Identifier for display/counting (e.g., `blog-a7b9c3d4`)
- **Owner Token**: Secret token for management operations

### Counter Identification Methods

1. **Creation/Management**: URL + Owner Token
2. **Display/Counting**: Public ID

This allows:
- Owner tokens don't need to be embedded in HTML
- Public IDs can be checked anytime
- Cannot interfere with other people's counters

## API Specifications

### 1. Counter Creation/ID Confirmation

```
GET /api/count?url={URL}&token={TOKEN}
```

#### Operation
- If counter doesn't exist: Create new
- If counter already exists: Count up
- **Returns public ID** (only when token is provided)

#### Parameters
- `url` (required): Target URL for counting
- `token` (required): Counter owner token

#### Response
```json
{
  "id": "blog-a7b9c3d4",
  "url": "https://example.com",
  "total": 1,
  "today": 1,
  "yesterday": 0,
  "week": 1,
  "month": 1,
  "lastVisit": "2025-07-30T12:00:00Z",
  "firstVisit": "2025-07-30T12:00:00Z"
}
```

### 1-2. Regular Count Up

```
GET /api/count?id={ID}
```

#### Parameters
- `id` (required): Counter's public ID

#### Response
```json
{
  "url": "https://example.com",
  "total": 2,
  "today": 2,
  "yesterday": 0,
  "week": 2,
  "month": 2,
  "lastVisit": "2025-07-30T12:05:00Z",
  "firstVisit": "2025-07-30T12:00:00Z"
}
```

### 2. Counter Image/Data Retrieval

```
GET /api/display?id={ID}&type={TYPE}&style={STYLE}&digits={DIGITS}&format={FORMAT}
```

#### Parameters
- `id` (required): Counter's public ID
- `type` (optional): Type of value to display
  - `total` (default): Total count
  - `today`: Today
  - `yesterday`: Yesterday
  - `week`: Last 7 days
  - `month`: Last 30 days
- `style` (optional): Display style (only effective when format=image)
  - `classic` (default): Black background, green text, monospace (90s style)
  - `modern`: Dark gray background, white text, Arial (modern style)
  - `retro`: Purple background, yellow text, monospace (80s style)
- `digits` (optional): Display digits (default: 6, only effective when format=image)
- `format` (optional): Response format
  - `text`: Plain text (numbers only)
  - `image` (default): SVG image

#### Response
- `format=text`: Numbers only (plain text)
- `format=image`: SVG format image

### 3. Counter Management

```
GET /api/owner?action={ACTION}&url={URL}&token={TOKEN}&...
```

#### Actions

##### Value Setting
```
GET /api/owner?action=set&url={URL}&token={TOKEN}&total={TOTAL}
```
- `url` (required): Counter URL
- `token` (required): Counter owner token
- `total`: Set total value (optional, default is no change)
- Today/yesterday/weekly/monthly values are automatically calculated from daily data and cannot be set

## Usage Examples

### 1. Counter Installation Steps

#### Step 1: Create counter and get ID
```javascript
// Execute in browser console or separately
fetch('/api/count?url=https://myblog.com&token=my-secret-token')
  .then(r => r.json())
  .then(data => console.log('Public ID:', data.id));
// Result: Public ID: blog-a7b9c3d4
```

#### Step 2: Embed in HTML

**Web Component (Simple)**
```html
<script src="https://nostalgic-counter.llll-ll.com/components/display.js"></script>
<nostalgic-counter 
  id="blog-a7b9c3d4"
  type="total"
  theme="classic">
</nostalgic-counter>
```

**Manual Control (Custom)**
```html
<!-- Display counter as image only (no automatic counting) -->
<img src="https://nostalgic-counter.llll-ll.com/api/display?id=blog-a7b9c3d4&type=total&style=classic" alt="Counter" />

<!-- Or count manually with JavaScript -->
<script>
  // Count and display current value
  fetch('https://nostalgic-counter.llll-ll.com/api/count?id=blog-a7b9c3d4')
    .then(response => response.json())
    .then(data => console.log('Current count:', data.total));
</script>
```

When using Web Components:
- Counter display
- Visit counting
- 24-hour duplicate prevention

Everything is processed automatically.

#### Additional Setup for TypeScript Projects

If you're using TypeScript, you need to add type definitions for custom elements.

**For Next.js 15 + React 19** (recommended):
```typescript
// Create types.d.ts in project root
import 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'nostalgic-counter': {
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

**For traditional React projects**:
```typescript
// Add to globals.d.ts or appropriate type definition file
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'nostalgic-counter': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        id?: string;
        type?: string;
        theme?: string;
        digits?: string;
        scale?: string;
      }, HTMLElement>;
    }
  }
}
```

After creating the type definition file, add it to `include` in `tsconfig.json`:
```json
{
  "include": [
    "next-env.d.ts",
    "types.d.ts",
    "**/*.ts",
    "**/*.tsx"
  ]
}
```

This setup resolves TypeScript type checking errors. Not required for regular JavaScript/HTML projects.

### 2. Multiple Counter Installation

```html
<!-- Total visits -->
<nostalgic-counter id="blog-a7b9c3d4" type="total" theme="classic"></nostalgic-counter>

<!-- Today's visits (same ID so no count up occurs) -->
<nostalgic-counter id="blog-a7b9c3d4" type="today" theme="modern"></nostalgic-counter>

<!-- This week's visits (same ID so no count up occurs) -->
<nostalgic-counter id="blog-a7b9c3d4" type="week" theme="retro"></nostalgic-counter>
```

Note: The same ID combination on the same page will only count up once on the first occurrence.

### 3. Changing Counter Values

```javascript
// Reset counter to 0
fetch('/api/owner?action=set&url=https://myblog.com&token=my-secret-token&total=0')
  .then(response => response.json())
  .then(data => console.log('Reset complete:', data));

// Set total to 10000
fetch('/api/owner?action=set&url=https://myblog.com&token=my-secret-token&total=10000')
  .then(response => response.json())
  .then(data => console.log('Setting complete:', data));
```

#### Recommendations for Total Reset
When resetting the total value, it is **recommended to set it to a value equal to or greater than the monthly count**. This is because weekly and monthly counts are calculated from past daily data, so resetting the total to 0 or a small value can create a visual contradiction where "total < monthly".

Example: If the monthly count is 100, setting the total to 100 or higher will result in a natural display.

## Security

### Token Management
- Owner tokens are secret information known only to the creator
- Used only for management operations, not embedded in HTML
- Public IDs are safe to be known (only allow display/counting)
- HTTPS usage recommended

### Duplicate Count Prevention
- Duplicate access from the same IP/UserAgent within 24 hours is ignored
- This prevents fraudulent count ups from reloading

## Limitations

### Implementation Environment
- **Hosting**: Vercel (Next.js)
- **Database**: Redis Cloud
- **Benefits**: Fast Key-Value operations, atomic count ups

### Future Extension Plans
- Rate limiting implementation
- CORS configuration additions
- Statistics feature enhancement
- Management interface addition