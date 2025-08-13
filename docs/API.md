# Nostalgic API Reference

## Overview

Nostalgic is a comprehensive platform that recreates nostalgic web tools (Counter, Like, Ranking, BBS) from the 90s internet culture with modern technology. All services follow a unified action-based API pattern.

## API Architecture

All services use the same URL pattern with action parameters:

```
/api/{service}?action={action}&url={your-site}&token={your-token}&...params
```

## Services

### 📊 [Counter Service](services/counter.md)
Traditional visitor counter with multiple time periods and nostalgic display styles.

### 💖 [Like Service](services/like.md) 
Toggle-based like/unlike button with user state tracking.

### 🏆 [Ranking Service](services/ranking.md)
Score leaderboard system with automatic sorting and management features.

### 💬 [BBS Service](services/bbs.md)
Message board with customizable options and author-based editing.

## Common Concepts

### Authentication & Ownership
- **Owner Token**: 8-16 character secret for service management
- **Public ID**: Safe identifier for display/interaction (format: `domain-hash8`)
- **User Hash**: IP+UserAgent for duplicate prevention and authorship

### Security Features
- SHA256 hashed token storage
- 24-hour duplicate prevention
- Public ID system prevents unauthorized access
- Author verification for post editing/removal

### Service Lifecycle
1. **Create**: URL + token → returns public ID
2. **Use**: Public ID for display/interaction 
3. **Manage**: URL + token for owner operations

## Quick Start Examples

### Counter
```bash
# Create counter
curl "https://nostalgic.llll-ll.com/api/counter?action=create&url=https://yoursite.com&token=your-secret"

# Display counter
curl "https://nostalgic.llll-ll.com/api/counter?action=display&id=yoursite-a7b9c3d4&type=total&theme=classic"
```

### Like
```bash
# Create like button
curl "https://nostalgic.llll-ll.com/api/like?action=create&url=https://yoursite.com&token=your-secret"

# Toggle like
curl "https://nostalgic.llll-ll.com/api/like?action=toggle&url=https://yoursite.com&token=your-secret"
```

### Ranking
```bash
# Create ranking
curl "https://nostalgic.llll-ll.com/api/ranking?action=create&url=https://yoursite.com&token=your-secret&max=100"

# Submit score
curl "https://nostalgic.llll-ll.com/api/ranking?action=submit&url=https://yoursite.com&token=your-secret&name=Player1&score=1000"
```

### BBS
```bash
# Create BBS
curl "https://nostalgic.llll-ll.com/api/bbs?action=create&url=https://yoursite.com&token=your-secret&max=1000"

# Post message
curl "https://nostalgic.llll-ll.com/api/bbs?action=post&url=https://yoursite.com&token=your-secret&author=User&message=Hello!"
```

## Try the Demos

Visit our interactive demo pages to test all services:

- **[Counter Demo](https://nostalgic.llll-ll.com/counter)**
- **[Like Demo](https://nostalgic.llll-ll.com/like)**  
- **[Ranking Demo](https://nostalgic.llll-ll.com/ranking)**
- **[BBS Demo](https://nostalgic.llll-ll.com/bbs)**

## Deployment

### Hosted Service (Recommended)
Use `https://nostalgic.llll-ll.com` - no setup required!

### Self-Hosting
1. Fork this repository
2. Deploy to Vercel 
3. Add Redis URL environment variable
4. Update Web Component URLs to your domain

---

*For detailed API specifications of each service, see the individual service documentation in the `/docs/services/` directory.*