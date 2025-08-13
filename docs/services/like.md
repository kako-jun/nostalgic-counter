# Like Service API

## Overview

Toggle-based like/unlike button service with user state tracking. Users can like/unlike with instant feedback.

## Actions

### create
Create a new like button or get existing button ID.

```
GET /api/like?action=create&url={URL}&token={TOKEN}
```

**Parameters:**
- `url` (required): Target URL for like button
- `token` (required): Owner token (8-16 characters)

**Response:**
```json
{
  "id": "yoursite-a7b9c3d4",
  "url": "https://yoursite.com",
  "total": 0,
  "userLiked": false,
  "message": "Like button created successfully"
}
```

### toggle
Toggle like/unlike state for current user.

```
GET /api/like?action=toggle&url={URL}&token={TOKEN}
```

**Parameters:**
- `url` (required): Target URL
- `token` (required): Owner token

**Response:**
```json
{
  "url": "https://yoursite.com",
  "total": 1,
  "userLiked": true,
  "action": "liked"
}
```

### get
Get current like data (public access).

```
GET /api/like?action=get&id={ID}
```

**Parameters:**
- `id` (required): Public like button ID

**Response:**
```json
{
  "url": "https://yoursite.com",
  "total": 5,
  "userLiked": false
}
```

## Web Component Integration

```html
<script src="https://nostalgic.llll-ll.com/components/like.js"></script>
<nostalgic-like id="yoursite-a7b9c3d4"></nostalgic-like>
```

**Attributes:**
- `id`: Like button public ID

## Usage Examples

### Basic Like Button Setup
```javascript
// 1. Create like button
const response = await fetch('/api/like?action=create&url=https://myblog.com&token=my-secret')
const data = await response.json()
console.log('Like Button ID:', data.id)

// 2. Embed in HTML
document.body.innerHTML += `
  <script src="/components/like.js"></script>
  <nostalgic-like id="${data.id}"></nostalgic-like>
`
```

### Manual Like Control
```javascript
// Toggle like manually
const response = await fetch('/api/like?action=toggle&url=https://myblog.com&token=my-secret')
const data = await response.json()
console.log('User liked:', data.userLiked, 'Total:', data.total)

// Get current state
const current = await fetch('/api/like?action=get&id=myblog-a7b9c3d4')
const state = await current.json()
console.log('Current likes:', state.total)
```

## Features

- **Toggle Functionality**: Users can like and unlike
- **User State Tracking**: Remembers if current user has liked
- **Duplicate Prevention**: Based on IP+UserAgent hash
- **Instant Feedback**: Immediate response with new state
- **Public Access**: Anyone can view like count with public ID

## Security Notes

- User identification via IP+UserAgent hash
- No persistent user tracking or cookies
- Owner token required for like button creation
- Public ID safe for embedding (view-only access)