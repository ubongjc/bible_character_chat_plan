# Bible Character Chat (BCC)

**Converse with Scripture-Grounded Personas**

A comprehensive platform for engaging in authentic conversations with biblical characters, backed by Scripture citations and educational context.

## 🌟 Key Features

- **📚 Scripture-Grounded**: Every response includes verse citations and is faithful to canonical texts
- **🎭 Authentic Personas**: Characters speak with their biblical voice, including complex and antagonistic figures
- **🔍 Educational Context**: Deception flags, counter-voice overlays, and scholarly annotations
- **🎙️ Voice Calls**: Real-time voice conversations with characters, complete with transcripts
- **👥 Group Panels**: Experience conversations between multiple biblical figures simultaneously
- **🌍 Multilingual**: Converse in your language while preserving original Scripture quotations

## 📖 Featured Characters

The platform includes 10 featured characters by default:

1. **Jesus of Nazareth** - Central figure of Christianity
2. **God** - The supreme being (speaks only through canonical quotations)
3. **Moses** - Prophet and lawgiver
4. **King David** - Second king of Israel
5. **Paul the Apostle** - Early Christian missionary and theologian
6. **Mary** (Mother of Jesus) - Model of faith and obedience
7. **Esther** - Jewish queen who saved her people
8. **Judas Iscariot** - Betrayer (with deception flags)
9. **Satan** - The adversary (with deception flags and counter-voice)
10. **Michael the Archangel** - Chief archangel and warrior

## 🏗️ Architecture

### Monorepo Structure

```
bible_character_chat_plan/
├── apps/
│   ├── bcc_server/          # Fastify API server
│   ├── bcc_web/             # Next.js 15 web app
│   ├── bcc_ios/             # iOS/iPadOS app (SwiftUI)
│   └── bcc_android/         # Android app (Kotlin/Compose)
├── packages/
│   ├── ui/                  # Shared design system
│   ├── content/             # Bible texts & ETL
│   └── guards/              # Policy DSL & guardrails
└── infra/                   # Infrastructure as Code
```

### Tech Stack

**Backend:**
- Fastify (Node.js API server)
- PostgreSQL + pgvector (vector similarity search)
- Redis (caching & sessions)
- OpenAI API (LLM integration)
- WebAuthn (passkeys authentication)

**Frontend:**
- Next.js 15 (React 19)
- TypeScript
- Tailwind CSS + shadcn/ui
- Zustand (state management)

**Mobile:**
- iOS: SwiftUI
- Android: Kotlin + Jetpack Compose

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+ (with pgvector extension)
- Redis
- OpenAI API key

### Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp apps/bcc_server/.env.example apps/bcc_server/.env
cp apps/bcc_web/.env.example apps/bcc_web/.env.local
# Edit .env files with your configuration

# 3. Set up database
npm run db:migrate
npm run db:seed

# 4. Start development
npm run dev
```

Visit:
- Web App: http://localhost:3000
- API Docs: http://localhost:3001/docs

## 📋 Implementation Status

### ✅ Completed

- [x] Monorepo structure with Turbo
- [x] Server with Fastify + TypeScript
- [x] Database schema with PostgreSQL + pgvector
- [x] Character Policy DSL system
- [x] Featured 10 characters with policies
- [x] Next.js web app with Tailwind + shadcn/ui
- [x] Character directory with filters/sorting
- [x] Chat interface with streaming
- [x] Citation system with inline verse markers
- [x] Sources drawer
- [x] Deception flags for antagonists
- [x] Authentication (with bypass for development)

### 🚧 To Be Implemented

- [ ] Voice call functionality (WebRTC)
- [ ] Group panel conversations
- [ ] Full retrieval system with embeddings
- [ ] Bible text ETL and ingestion
- [ ] Counter-voice overlay UI
- [ ] Reading plans and bookmarks
- [ ] Full i18n system
- [ ] Mobile apps (iOS/Android)
- [ ] Comprehensive test suite

## 🔒 Security & Privacy

- **Authentication**: Passkeys (WebAuthn) for production, bypass mode for testing
- **Encryption**: AES-256-GCM at rest
- **Privacy Controls**: Per-thread transcript storage options
- **Rate Limiting**: Configured to prevent abuse
- **Audit Logs**: All actions tracked for compliance

## 📝 API Documentation

API documentation is available at http://localhost:3001/docs

### Key Endpoints

```
Authentication:
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

Characters:
GET    /api/characters
GET    /api/characters/:id
GET    /api/characters/featured/list

Threads:
POST   /api/threads
GET    /api/threads
GET    /api/threads/:id
PATCH  /api/threads/:id

Chat:
POST   /api/chat/ask          # Streaming SSE endpoint

Sources:
GET    /api/sources
POST   /api/sources/search

Calls:
POST   /api/calls/start
POST   /api/calls/stop
GET    /api/calls/history
```

## 🎨 Character Policy DSL

Each character has a policy that defines their behavior:

```typescript
{
  can_say: ['Genesis', 'Exodus', ...],      // Books they can reference
  must_cite: ['doctrine', 'history'],       // Response types requiring citations
  cannot_say: ['personal_prophecy', ...],   // Disallowed content
  style: {
    tone: 'pastoral' | 'confrontational',
    archaic_level: 'low' | 'medium' | 'high',
    clarity: 'high'
  },
  enable_deception_flags: boolean,          // For antagonists
  enable_counter_voice: boolean             // Show counter-annotations
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run server tests
cd apps/bcc_server && npm test

# Run web tests
cd apps/bcc_web && npm test
```

## 📦 Building for Production

```bash
# Build all apps
npm run build

# Build and start individually
cd apps/bcc_server && npm run build && npm start
cd apps/bcc_web && npm run build && npm start
```

## 📄 License

This project is proprietary. All rights reserved.

## 🙏 Acknowledgments

- Public domain Bible translations (KJV, ASV, WEB)
- Open source libraries and frameworks
- Biblical scholarship and commentaries

---

**Educational Purpose**: This application is for educational and devotional purposes. It is not a replacement for clergy, scholarship, or personal Bible study.