# Ranking Service API

## Overview

Score leaderboard system with automatic sorting, score management, and configurable entry limits.

## Actions

### create
Create a new ranking leaderboard.

```
GET /api/ranking?action=create&url={URL}&token={TOKEN}&max={MAX_ENTRIES}
```

**Parameters:**
- `url` (required): Target URL for ranking
- `token` (required): Owner token (8-16 characters)
- `max` (optional): Maximum entries (1-1000, default: 100)

**Response:**
```json
{
  "id": "yoursite-a7b9c3d4",
  "url": "https://yoursite.com",
  "entries": [],
  "totalEntries": 0,
  "message": "Ranking created successfully"
}
```

### submit
Submit a new score to the ranking.

```
GET /api/ranking?action=submit&url={URL}&token={TOKEN}&name={PLAYER_NAME}&score={SCORE}
```

**Parameters:**
- `url` (required): Target URL
- `token` (required): Owner token
- `name` (required): Player name (max 20 characters)
- `score` (required): Score value (integer)

**Response:**
```json
{
  "id": "yoursite-a7b9c3d4",
  "url": "https://yoursite.com",
  "entries": [
    {
      "name": "Player1",
      "score": 1000,
      "rank": 1,
      "timestamp": "2025-08-13T10:00:00Z"
    }
  ],
  "totalEntries": 1,
  "message": "Score submitted successfully"
}
```

### update
Update an existing player's score.

```
GET /api/ranking?action=update&url={URL}&token={TOKEN}&name={PLAYER_NAME}&score={NEW_SCORE}
```

**Parameters:**
- `url` (required): Target URL
- `token` (required): Owner token
- `name` (required): Player name to update
- `score` (required): New score value

**Response:**
```json
{
  "success": true,
  "message": "Score for Player1 has been updated to 1500"
}
```

### remove
Remove a specific player's score.

```
GET /api/ranking?action=remove&url={URL}&token={TOKEN}&name={PLAYER_NAME}
```

**Parameters:**
- `url` (required): Target URL
- `token` (required): Owner token
- `name` (required): Player name to remove

**Response:**
```json
{
  "success": true,
  "message": "Score for Player1 has been removed"
}
```

### clear
Clear all scores from the ranking.

```
GET /api/ranking?action=clear&url={URL}&token={TOKEN}
```

**Parameters:**
- `url` (required): Target URL
- `token` (required): Owner token

**Response:**
```json
{
  "success": true,
  "message": "Ranking for https://yoursite.com has been cleared"
}
```

### get
Get ranking data (public access).

```
GET /api/ranking?action=get&id={ID}&limit={LIMIT}
```

**Parameters:**
- `id` (required): Public ranking ID
- `limit` (optional): Number of entries to return (1-100, default: 10)

**Response:**
```json
{
  "id": "yoursite-a7b9c3d4",
  "url": "https://yoursite.com",
  "entries": [
    {
      "name": "Player1",
      "score": 1500,
      "rank": 1,
      "timestamp": "2025-08-13T10:00:00Z"
    },
    {
      "name": "Player2", 
      "score": 1200,
      "rank": 2,
      "timestamp": "2025-08-13T09:30:00Z"
    }
  ],
  "totalEntries": 2
}
```

## Usage Examples

### Basic Ranking Setup
```javascript
// 1. Create ranking
const response = await fetch('/api/ranking?action=create&url=https://mygame.com&token=game-secret&max=50')
const data = await response.json()
console.log('Ranking ID:', data.id)

// 2. Submit scores
await fetch('/api/ranking?action=submit&url=https://mygame.com&token=game-secret&name=Alice&score=1000')
await fetch('/api/ranking?action=submit&url=https://mygame.com&token=game-secret&name=Bob&score=1200')

// 3. Get leaderboard
const ranking = await fetch('/api/ranking?action=get&id=mygame-a7b9c3d4&limit=10')
const leaderboard = await ranking.json()
console.log('Top players:', leaderboard.entries)
```

### Score Management
```javascript
// Update player score
await fetch('/api/ranking?action=update&url=https://mygame.com&token=game-secret&name=Alice&score=1500')

// Remove cheating player
await fetch('/api/ranking?action=remove&url=https://mygame.com&token=game-secret&name=Cheater')

// Clear all scores (reset season)
await fetch('/api/ranking?action=clear&url=https://mygame.com&token=game-secret')
```

## Features

- **Automatic Sorting**: Scores sorted in descending order
- **Entry Limits**: Configurable maximum number of entries
- **Score Management**: Submit, update, remove individual scores
- **Bulk Operations**: Clear all scores at once
- **Real-time Updates**: Instant leaderboard updates
- **Public Access**: View rankings with public ID

## Data Structure

Rankings use Redis Sorted Sets for efficient sorting:
- Scores are automatically sorted in descending order
- When max entries exceeded, lowest scores are removed
- O(log N) performance for score operations

## Security Notes

- Only ranking owners can submit/modify scores
- Public ID allows read-only access to leaderboard
- Player names limited to 20 characters
- Score values are integers only