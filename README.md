# Nostalgic

*[日本語版はこちら](README_ja.md)*

A comprehensive nostalgic web tools platform that brings back the 90s internet culture with modern technology. Four essential services that used to be on every personal homepage: Counter, Like, Ranking, and BBS.

## ✨ Services

### 📊 Counter Service
- Multiple time periods: Total, today, yesterday, weekly, monthly statistics
- 24-hour duplicate prevention per visitor
- 3 nostalgic display styles: Classic, Modern, Retro
- Web Components for easy embedding

### 💖 Like Service
- Toggle-based like/unlike functionality
- User state tracking (IP + UserAgent)
- Instant feedback with current state

### 🏆 Ranking Service  
- Score leaderboards with automatic sorting
- Score management (submit, update, remove)
- Configurable entry limits
- Real-time ranking updates

### 💬 BBS Service
- Message board with pagination
- Customizable dropdown selections
- Author-based message editing
- Icon selection for posts

## ✨ Common Features

- 🚫 **No registration required**: Just provide a URL and secret token
- 🔒 **Secure ownership**: SHA256 hashed tokens, public ID system
- 🌐 **Easy integration**: RESTful APIs with action parameters
- ⚡ **Fast & reliable**: Built on Next.js + Redis
- 🔗 **Pure GET APIs**: All operations via browser URL bar (1990s web culture revival)

## 🚀 Quick Start

### Counter Service

1. **Create your counter**:
```
https://nostalgic.llll-ll.com/api/counter?action=create&url=https://yoursite.com&token=your-secret-token
```

2. **Embed in your site**:
```html
<script src="https://nostalgic.llll-ll.com/components/counter.js"></script>
<nostalgic-counter id="yoursite-a7b9c3d4" type="total" theme="classic"></nostalgic-counter>
```

### Like Service

1. **Create like button**:
```
https://nostalgic.llll-ll.com/api/like?action=create&url=https://yoursite.com&token=your-secret-token
```

2. **Toggle like**:
```
https://nostalgic.llll-ll.com/api/like?action=toggle&url=https://yoursite.com&token=your-secret-token
```

### Ranking Service

1. **Create ranking**:
```
https://nostalgic.llll-ll.com/api/ranking?action=create&url=https://yoursite.com&token=your-secret-token&max=100
```

2. **Submit scores**:
```
https://nostalgic.llll-ll.com/api/ranking?action=submit&url=https://yoursite.com&token=your-secret-token&name=Player1&score=1000
```

### BBS Service

1. **Create BBS**:
```
https://nostalgic.llll-ll.com/api/bbs?action=create&url=https://yoursite.com&token=your-secret-token&max=1000
```

2. **Post messages** (pure GET, 1990s style):
```
https://nostalgic.llll-ll.com/api/bbs?action=post&url=https://yoursite.com&token=your-secret-token&author=User&message=Hello!
```

## 🎮 Try the Demos

Visit our interactive demo pages:

- **[Counter Demo](https://nostalgic.llll-ll.com/counter)** - Test counter creation and management
- **[Like Demo](https://nostalgic.llll-ll.com/like)** - Try the like/unlike functionality  
- **[Ranking Demo](https://nostalgic.llll-ll.com/ranking)** - Submit and manage scores
- **[BBS Demo](https://nostalgic.llll-ll.com/bbs)** - Post and edit messages

## 🔧 API Architecture

All services follow a unified action-based API pattern using **GET requests only**:

```
/api/{service}?action={action}&url={your-site}&token={your-token}&...params
```

### 🌐 Why GET-only? 1990s Web Culture Revival

Just like the original 1990s web tools, everything can be operated directly from the browser URL bar:

1. **Click-to-create**: Share a link and instantly create a counter
2. **URL-based operations**: All actions are simple GET links
3. **Nostalgic simplicity**: No complex forms or POST requests needed
4. **Easy sharing**: Every operation is a shareable URL
5. **BBS culture**: Even message posting uses GET parameters, just like the old days

### Available Actions by Service:

| Service | Actions | Description |
|---------|---------|-------------|
| **Counter** | `create`, `increment`, `display`, `set` | Traditional visitor counter |
| **Like** | `create`, `toggle`, `get` | Like/unlike button |
| **Ranking** | `create`, `submit`, `update`, `remove`, `clear`, `get` | Score leaderboard |
| **BBS** | `create`, `post`, `update`, `remove`, `clear`, `get` | Message board |

## 📖 Documentation

- **[API Reference](docs/API.md)** - Complete API documentation
- **[Live Demo](https://nostalgic.llll-ll.com)** - Try it on our nostalgic homepage

## 🛡️ Security & Privacy

### What data we collect and store:
- **Service URLs** (identifier only, not used for tracking)
- **Secret tokens** (hashed with SHA256)
- **User identification** (IP + UserAgent hash, for duplicate prevention and authorship)
- **Service data** (counts, likes, scores, messages - no personal data)

### What we DON'T collect:
- No cookies, no tracking pixels
- No personal information (name, email, etc.)
- No browsing history or referrer data
- IP addresses are hashed for privacy

### Security measures:
- Your secret tokens are hashed and stored securely
- Public IDs can only display/interact, not modify
- User identification via temporary IP+UserAgent hash
- Author verification for message editing/removal

## 📜 License

MIT License - feel free to use, modify, and distribute.

## 🌟 Contributing

Issues and pull requests are welcome! Let's bring back the nostalgic web together.

---

*Made with ❤️ for the nostalgic web*