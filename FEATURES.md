# Bible Character Chat - Features Documentation

**Last Updated:** 2024-11-12
**Version:** 2.0.0
**Branch:** `claude/bible-character-chat-v2-011CV4oHiKupujfBXCjXW1tM`

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Completed Features](#completed-features)
3. [How to Use](#how-to-use)
4. [Security Features](#security-features)
5. [API Endpoints](#api-endpoints)
6. [Platform Support](#platform-support)
7. [Upcoming Features](#upcoming-features)
8. [Known Issues](#known-issues)

---

## 🌟 Overview

Bible Character Chat (BCC) is a world-class platform for engaging in Scripture-grounded conversations with biblical characters. Every interaction is backed by verse citations, educational context, and rigorous safety guardrails.

**Mission:** Provide an authentic, educational, and respectful way to explore Scripture through conversations with biblical personas.

---

## ✅ Completed Features

### 🏗️ Core Infrastructure

#### Monorepo Architecture
- **Turborepo** for optimized build orchestration
- **Workspace structure** for apps and shared packages
- **TypeScript** throughout for type safety
- **Shared configuration** (prettier, tsconfig, eslint)

#### Backend (bcc_server)
- **Fastify API Server** with TypeScript
  - High-performance Node.js framework
  - Async/await throughout
  - Plugin-based architecture

- **PostgreSQL Database** with pgvector
  - Comprehensive schema (15+ tables)
  - Foreign key relationships
  - Automatic timestamp triggers
  - Audit logging built-in
  - Vector similarity search ready

- **Redis Caching**
  - Session management
  - Rate limiting store
  - Challenge storage for WebAuthn

- **OpenAI Integration**
  - Streaming responses
  - GPT-4 Turbo support
  - Citation extraction
  - Policy enforcement

#### Frontend (bcc_web)
- **Next.js 15** with React 19
  - App Router
  - Server-side rendering
  - Streaming UI
  - Route handlers

- **Tailwind CSS** + **shadcn/ui**
  - Modern, accessible components
  - Dark mode ready
  - Responsive design system
  - Animation support

- **PWA Configuration**
  - Manifest file ready
  - Service worker support
  - Offline-first architecture (pending)

---

### 👥 Character System

#### Featured 10 Characters (Pre-seeded)

1. **Jesus of Nazareth**
   - Type: Divine
   - Alignment: Benevolent
   - Role: Messiah, Teacher, Healer, Savior
   - Books: All New Testament
   - Special: Central figure, highest influence score

2. **God**
   - Type: Divine
   - Alignment: Benevolent
   - Role: Creator, Father, Judge, Redeemer
   - Books: Entire Bible
   - Special: Speaks only through canonical quotations with citations

3. **Moses**
   - Type: Person
   - Alignment: Benevolent
   - Role: Prophet, Lawgiver, Liberator, Leader
   - Books: Exodus, Leviticus, Numbers, Deuteronomy
   - Era: c. 1400 BCE

4. **King David**
   - Type: Person
   - Alignment: Complex
   - Role: King, Warrior, Psalmist, Ancestor of Jesus
   - Books: Samuel, Kings, Chronicles, Psalms
   - Era: c. 1000 BCE
   - Special: Morally complex character

5. **Paul the Apostle**
   - Type: Person
   - Alignment: Benevolent
   - Role: Apostle, Missionary, Theologian, Writer
   - Books: Acts, Romans through Philemon
   - Era: 1st century CE

6. **Mary, Mother of Jesus**
   - Type: Person
   - Alignment: Benevolent
   - Role: Mother of Jesus, Virgin, Disciple
   - Books: Matthew, Luke, John, Acts
   - Era: 1st century CE

7. **Esther**
   - Type: Person
   - Alignment: Benevolent
   - Role: Queen, Deliverer, Intercessor
   - Books: Esther
   - Era: c. 5th century BCE

8. **Judas Iscariot** ⚠️
   - Type: Person
   - Alignment: Antagonist
   - Role: Apostle, Betrayer, Treasurer
   - Books: Matthew, Mark, Luke, John, Acts
   - Era: 1st century CE
   - Special: **Deception flags enabled**, educational warnings

9. **Satan** ⚠️
   - Type: Demon
   - Alignment: Antagonist
   - Role: Adversary, Tempter, Accuser, Deceiver
   - Books: Genesis, Job, Gospels, Revelation
   - Special: **Deception flags + counter-voice overlay enabled**
   - Controversy Level: 10/10

10. **Michael the Archangel**
    - Type: Angel
    - Alignment: Benevolent
    - Role: Archangel, Warrior, Protector, Prince
    - Books: Daniel, Jude, Revelation

#### Character Features

- **Policy-Based Behavior**
  - `can_say`: Books the character can reference
  - `must_cite`: Response types requiring citations
  - `cannot_say`: Prohibited content (prophecies, medical advice, etc.)
  - `style`: Tone, archaic level, clarity settings

- **Alignment System**
  - Benevolent: Helpful, pastoral characters
  - Complex: Morally nuanced figures
  - Antagonist: Deceptive or oppositional figures

- **Influence & Controversy Scores**
  - Influence: Based on biblical citations and impact
  - Controversy: Indicates moral complexity or doctrinal debates

---

### 💬 Chat System

#### Real-Time Conversations

- **Streaming Responses**
  - Server-Sent Events (SSE)
  - Token-by-token streaming
  - Low latency (<800ms first token target)

- **Citation System**
  - Automatic verse extraction: `[John 3:16]`
  - Clickable references
  - Inline highlighting
  - Sources drawer with full verse text

- **Thread Management**
  - Create conversations with any character
  - Star/favorite important threads
  - Archive old conversations
  - Optional transcript storage (privacy control)
  - Thread history with message counts

#### Safety Features

- **Deception Flags** (for antagonists)
  - Real-time detection of problematic statements
  - Visual warning badges
  - Educational context annotations

- **Educational Banners**
  - Warning for antagonistic characters
  - Explanation of deception risk
  - Context about biblical portrayal

- **Content Moderation**
  - Toxicity filtering
  - Hate speech detection
  - Inappropriate content warnings
  - Rephrase suggestions

---

### 🔍 Directory & Discovery

#### Character Directory

- **Search**
  - Fuzzy search by name
  - Description text search
  - Real-time filtering

- **Filters**
  - Type: Person, Divine, Angel, Demon, Group
  - Alignment: Benevolent, Complex, Antagonist
  - Testament: Old Testament, New Testament
  - Role: Prophet, Apostle, King, etc.
  - Book: Filter by biblical book
  - Era: Time period

- **Sorting Options**
  - Featured First (default)
  - Alphabetical (A-Z)
  - Influence Score
  - Controversy Level
  - Era (chronological)

- **Display**
  - Featured section at top
  - Grid/card layout
  - Character portraits (placeholder)
  - Role tags
  - Alignment indicators

---

### 🔐 Authentication & Security

#### Authentication Methods

1. **WebAuthn/Passkeys** (Production)
   - Biometric authentication
   - Platform authenticators
   - Resident keys support
   - Device type tracking

2. **Email/Password** (Fallback)
   - bcrypt hashing
   - Secure password requirements (pending)
   - Password reset flow (pending)

3. **Development Bypass** ⚠️
   - `AUTH_BYPASS_ENABLED=true` in .env
   - Password: "bypass"
   - Creates test users automatically
   - **Must be disabled in production**

#### Security Layers

- **Rate Limiting**
  - 100 requests per minute per IP (default)
  - Redis-backed
  - Configurable limits

- **CORS Protection**
  - Whitelisted origins
  - Credentials support
  - Preflight handling

- **Helmet Security Headers**
  - Content Security Policy (CSP)
  - XSS Protection
  - HSTS enforcement
  - Frame options

- **JWT Tokens**
  - Signed with secret key
  - 7-day expiration (configurable)
  - Secure cookie options

- **Audit Logging**
  - All user actions logged
  - IP address tracking
  - User agent capture
  - Entity-level tracking
  - GDPR/CCPA export ready

---

### 📊 Data Model

#### Core Tables

1. **users**
   - Authentication
   - Preferences (locale, plan, settings)
   - Favorites list
   - Timestamps

2. **characters**
   - Metadata (name, type, alignment)
   - Roles and books
   - Era and geography
   - Policy reference
   - Featured status

3. **policies**
   - Per-character behavior rules
   - Can/must/cannot say lists
   - Style configuration
   - Deception flag settings

4. **threads**
   - User ownership
   - Character associations
   - Title and status
   - Transcript storage preference

5. **messages**
   - Thread association
   - Role (user/character/system)
   - Text content
   - Citations array
   - Flags (deception risk, etc.)
   - Reactions

6. **sources**
   - Verse text
   - Translation (KJV, ASV, WEB, etc.)
   - Book/chapter/verse metadata
   - License information

7. **embeddings**
   - Vector storage (1536 dimensions)
   - Source references
   - HNSW index for fast search

8. **webauthn_credentials**
   - Passkey storage
   - Public key
   - Counter (replay protection)
   - Device metadata

9. **call_sessions**
   - Voice call tracking
   - Duration and quality metrics
   - Transcript references

10. **bookmarks**
    - User favorites
    - Message references
    - Personal notes

11. **reading_plans**
    - Structured study plans
    - Progress tracking
    - Customizable entries

12. **audit_logs**
    - Complete action history
    - User attribution
    - IP and user agent
    - Timestamp tracking

---

### 🎨 User Interface

#### Design System

- **Color Palette**
  - Primary: Blue (#2563eb)
  - Secondary: Slate gray
  - Destructive: Red (for warnings)
  - Muted: Light gray backgrounds
  - Accent: Blue highlights

- **Typography**
  - Font: Inter (web-optimized)
  - Responsive sizing
  - Accessible contrast ratios

- **Components (shadcn/ui)**
  - Button (5 variants, 4 sizes)
  - Card (with header, content, footer)
  - Input (with focus states)
  - Dialogs and modals (ready)
  - Dropdowns and select (ready)
  - Tabs and navigation (ready)
  - Toast notifications (ready)

#### Responsive Design

- **Breakpoints**
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px

- **Layout**
  - Fluid containers
  - Flexible grids
  - Touch-friendly targets (44px minimum)
  - Swipe gestures (pending)

---

### 📱 Platform Support

#### Web (Current)
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Android)
- ⚠️ Responsive design (basic implementation)

#### iOS (Pending)
- 📂 Folder created: `apps/bcc_ios/`
- ⏳ SwiftUI implementation pending
- ⏳ Native features pending

#### Android (Pending)
- 📂 Folder created: `apps/bcc_android/`
- ⏳ Kotlin/Compose implementation pending
- ⏳ Native features pending

---

## 🎯 How to Use

### Getting Started

1. **Visit the Home Page**
   - Navigate to http://localhost:3000
   - Browse featured characters
   - Learn about key features

2. **Explore the Directory**
   - Click "Browse Characters" or visit `/directory`
   - Use search to find specific characters
   - Apply filters (type, alignment, role)
   - Sort by various criteria

3. **Start a Conversation**
   - Click any character card
   - Automatic thread creation
   - Type your question in the input box
   - Press Enter or click Send

4. **Interact with Responses**
   - Watch streaming responses appear in real-time
   - Click `[verse references]` to view source text
   - Open Sources drawer for full citations
   - See deception warnings on antagonist responses

5. **Manage Conversations**
   - Star important threads
   - Archive old conversations
   - Delete unwanted threads
   - View conversation history

### Advanced Features

#### Working with Citations

```
User: "What did Jesus say about love?"
Jesus: "Love one another as I have loved you [John 13:34].
       Greater love has no one than this, that someone lay down
       his life for his friends [John 15:13]."
```

- Citations appear as `[Book Chapter:Verse]`
- Click to see full verse text
- Sources drawer shows all references
- Original translation preserved

#### Understanding Deception Flags

When chatting with **Satan** or **Judas**:

⚠️ **Educational Notice** banner appears
🚨 Deception risk badges on problematic statements
📚 Counter-voice overlay available (shows corrections)

Example:
```
Satan: "You won't die if you eat the fruit."
       [🚨 Deception Risk - Educational Context Available]
```

#### Character Policies

Each character follows strict policies:

- **Can Say**: Only references books they appear in
- **Must Cite**: Doctrine, history, ethics require verses
- **Cannot Say**: Personal prophecies, medical/legal advice, modern politics

---

## 🔒 Security Features

### Implemented

✅ **Authentication**
- WebAuthn/Passkeys (FIDO2 standard)
- Email/password with bcrypt
- JWT session tokens
- Development bypass mode

✅ **Rate Limiting**
- IP-based throttling
- Redis-backed counters
- Configurable limits
- Abuse prevention

✅ **Security Headers**
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- HSTS enforcement

✅ **CORS Protection**
- Whitelisted origins
- Credentials handling
- Preflight support

✅ **Audit Logging**
- Complete action history
- User attribution
- IP tracking
- GDPR export ready

### Pending Implementation

⏳ **Data Encryption**
- AES-256-GCM at rest
- Field-level encryption
- Key rotation
- Secure key storage (KMS/Vault)

⏳ **Input Validation**
- Zod schema validation
- SQL injection prevention
- XSS sanitization
- CSRF tokens

⏳ **Privacy Controls**
- Data export (GDPR)
- Right to deletion
- Consent management
- Cookie preferences

⏳ **PIN Protection**
- App-level PIN lock
- Biometric unlock
- Session timeout
- Auto-lock settings

⏳ **Secure Communication**
- TLS 1.3 enforcement
- Certificate pinning
- Perfect forward secrecy

---

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register              Register new user
POST   /api/auth/login                 Login with credentials
GET    /api/auth/me                    Get current user
POST   /api/auth/passkeys/register-options
POST   /api/auth/passkeys/register-verify
```

### Characters
```
GET    /api/characters                 List all characters (with filters)
GET    /api/characters/:id             Get single character
GET    /api/characters/featured/list   Get featured characters
```

### Threads
```
POST   /api/threads                    Create new thread
GET    /api/threads                    List user threads
GET    /api/threads/:id                Get thread with messages
PATCH  /api/threads/:id                Update thread (star, archive, title)
DELETE /api/threads/:id                Delete thread
```

### Chat
```
POST   /api/chat/ask                   Send message (SSE streaming)
POST   /api/chat/messages/:id/react    Add reaction to message
```

### Sources
```
GET    /api/sources?ref=John+3:16      Get verse by reference
POST   /api/sources/search             Semantic search (pending)
GET    /api/sources/cross-references   Get related verses
GET    /api/sources/translations       List available translations
```

### Calls (Voice)
```
POST   /api/calls/start                Start voice call
POST   /api/calls/stop                 End voice call
GET    /api/calls/history              Get call history
```

### Admin
```
POST   /api/admin/content/ingest       Bulk import verses/content
POST   /api/admin/policies/:characterId Update character policy
POST   /api/admin/redteam/run          Run security tests
GET    /api/admin/stats                System statistics
```

---

## 🌐 Platform Support

### Web Application

**Browsers:**
- ✅ Chrome 90+ (fully supported)
- ✅ Firefox 88+ (fully supported)
- ✅ Safari 14+ (fully supported)
- ✅ Edge 90+ (fully supported)

**Devices:**
- ✅ Desktop (1920×1080, 1440×900, etc.)
- ⚠️ Laptop (1366×768, needs optimization)
- ⚠️ Tablet (iPad, Android tablets, needs optimization)
- ⚠️ Mobile (iPhone, Android phones, needs optimization)

**Features:**
- ✅ PWA manifest
- ⏳ Service worker (offline support pending)
- ⏳ Install prompt
- ⏳ Push notifications

### iOS Application (Pending)

**Planned Features:**
- SwiftUI interface
- Native navigation
- Biometric authentication (Face ID, Touch ID)
- Share extensions
- Widgets
- Siri shortcuts
- iCloud sync
- Handoff support

**Target:**
- iOS 16+
- iPadOS 16+
- Mac Catalyst

### Android Application (Pending)

**Planned Features:**
- Jetpack Compose interface
- Material Design 3
- Biometric authentication
- Share intents
- Widgets
- Google Drive sync
- App shortcuts

**Target:**
- Android 11+ (API 30+)
- Tablet optimization

---

## 🚀 Upcoming Features

### Phase 1: Security Hardening (High Priority)

- [ ] Input validation with Zod schemas
- [ ] CSRF token implementation
- [ ] XSS sanitization (DOMPurify)
- [ ] SQL injection prevention (parameterized queries already in place)
- [ ] Rate limiting per user (not just IP)
- [ ] Session management improvements
- [ ] Secure password requirements (min 12 chars, complexity)
- [ ] Password reset flow
- [ ] Email verification
- [ ] Two-factor authentication (TOTP)
- [ ] PIN protection for app access
- [ ] Biometric unlock (web and mobile)
- [ ] Auto-lock after inactivity
- [ ] Encryption at rest implementation
- [ ] Encryption in transit (TLS 1.3)
- [ ] Security audit logging expansion
- [ ] Penetration testing
- [ ] OWASP Top 10 compliance check

### Phase 2: Premium Features (Monetization)

- [ ] Subscription tiers (Free, Premium, Pro)
- [ ] Payment integration (Stripe)
- [ ] Voice calls (WebRTC)
- [ ] Group panels (multi-character)
- [ ] Advanced study tools
- [ ] Reading plans with progress
- [ ] Verse bookmarking with notes
- [ ] Collections and tags
- [ ] Highlight verses
- [ ] Personal annotations
- [ ] Cross-references expansion
- [ ] Multiple translations (ESV, NIV, NASB - licensed)
- [ ] Commentary integration
- [ ] Historical context overlays
- [ ] Maps integration
- [ ] Timeline views
- [ ] Character relationship graphs
- [ ] Export conversations (PDF, Word)
- [ ] Verse cards creation
- [ ] Social sharing
- [ ] Offline mode (full PWA)

### Phase 3: Enhanced UX

- [ ] Dark mode (complete implementation)
- [ ] Theme customization
- [ ] Font size controls
- [ ] Dyslexia-friendly fonts
- [ ] High contrast mode
- [ ] Voice input
- [ ] Voice output (TTS)
- [ ] Keyboard shortcuts
- [ ] Accessibility improvements (WCAG 2.1 AAA)
- [ ] RTL language support
- [ ] Full internationalization (i18n)
- [ ] Localized content
- [ ] Onboarding tutorial
- [ ] Interactive help
- [ ] Tooltips and hints
- [ ] Undo/redo
- [ ] Search history
- [ ] Recent conversations
- [ ] Quick actions
- [ ] Gesture controls (mobile)

### Phase 4: Content Expansion

- [ ] Full Bible text ingestion (KJV, ASV, WEB)
- [ ] Licensed translations
- [ ] Public domain commentaries
- [ ] Cross-reference database
- [ ] Concordance integration
- [ ] Topical index
- [ ] Maps and atlases
- [ ] Timeline events
- [ ] Character profiles (all biblical figures)
- [ ] Relationship mapping
- [ ] Etymology and word studies
- [ ] Greek/Hebrew interlinear
- [ ] Manuscript comparisons
- [ ] Archaeological context
- [ ] Cultural background

### Phase 5: Mobile Apps

- [ ] iOS app (SwiftUI)
- [ ] Android app (Kotlin/Compose)
- [ ] App Store submission
- [ ] Google Play submission
- [ ] In-app purchases
- [ ] Push notifications
- [ ] Widgets
- [ ] Share extensions
- [ ] Cloud sync
- [ ] Offline database
- [ ] Background sync

### Phase 6: Analytics & Insights

- [ ] Reading statistics
- [ ] Conversation insights
- [ ] Popular verses
- [ ] Study streaks
- [ ] Achievement badges
- [ ] Progress tracking
- [ ] Personal milestones
- [ ] Usage reports
- [ ] Privacy-preserving analytics
- [ ] A/B testing framework

---

## 🐛 Known Issues

### Critical

None currently identified.

### High Priority

- [ ] Responsive design needs optimization for tablets and mobile
- [ ] Web app doesn't handle small screens well (<768px)
- [ ] Touch targets too small on mobile (<44px)
- [ ] Long character names overflow cards
- [ ] Sources drawer doesn't load actual verse content (placeholder)
- [ ] No loading states for API calls
- [ ] Error handling is minimal

### Medium Priority

- [ ] No pagination for character directory (loads all)
- [ ] Search is client-side only (should be server-side)
- [ ] No image optimization
- [ ] Character portraits are placeholders (emojis)
- [ ] No caching strategy for API responses
- [ ] Thread list doesn't show preview of last message
- [ ] No indication of unread messages
- [ ] Date formatting needs improvement
- [ ] No time zone handling

### Low Priority

- [ ] Missing loading skeletons
- [ ] No animation transitions
- [ ] Toast notifications not implemented
- [ ] No confirmation dialogs for destructive actions
- [ ] Missing keyboard navigation
- [ ] No focus management
- [ ] Missing ARIA labels
- [ ] Console warnings from React 19
- [ ] TypeScript strict mode warnings
- [ ] ESLint warnings need fixing

### Enhancement Requests

- [ ] Add character portraits (illustrations/artwork)
- [ ] Better mobile navigation (bottom bar)
- [ ] Swipe gestures for mobile
- [ ] Pull-to-refresh
- [ ] Infinite scroll for messages
- [ ] Message search within thread
- [ ] Export thread as PDF
- [ ] Print-friendly styles
- [ ] Keyboard shortcuts help dialog
- [ ] Better error messages
- [ ] Network offline detection
- [ ] Retry failed requests
- [ ] Optimistic UI updates

---

## 📊 Performance Targets

### Current Status

- ⚠️ First token: Not measured (target <800ms)
- ⚠️ Cold start: Not measured (target <1.8s)
- ⚠️ Search: Not measured (target <150ms P95)
- ⚠️ API response: Not measured (target <200ms P95)

### Goals

- First token (warm): <800ms
- First token (cold): <1.8s
- Voice roundtrip: <250ms
- Search: <150ms P95
- Page load: <2s
- Time to interactive: <3s
- Largest contentful paint: <2.5s
- Cumulative layout shift: <0.1
- First input delay: <100ms

---

## 📈 Metrics & Monitoring

### Implemented

- Basic console logging
- Database connection monitoring
- Redis connection monitoring

### Pending

- [ ] Sentry error tracking
- [ ] OpenTelemetry tracing
- [ ] Prometheus metrics
- [ ] Grafana dashboards
- [ ] Uptime monitoring
- [ ] Performance monitoring
- [ ] User analytics (privacy-preserving)
- [ ] Conversion tracking
- [ ] A/B test results

---

## 🔄 Deployment

### Development

```bash
npm run dev
# Web: http://localhost:3000
# API: http://localhost:3001
# Docs: http://localhost:3001/docs
```

### Production (Pending)

- [ ] Docker containerization
- [ ] Kubernetes manifests
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Automated testing in CI
- [ ] Database migrations in CI/CD
- [ ] Environment-specific configs
- [ ] Production secrets management
- [ ] CDN setup (Cloudflare)
- [ ] Load balancing
- [ ] Auto-scaling
- [ ] Blue-green deployment
- [ ] Rollback strategy
- [ ] Monitoring and alerting
- [ ] Backup and disaster recovery

---

## 📞 Support & Documentation

### User Documentation
- [ ] User guide
- [ ] FAQ
- [ ] Video tutorials
- [ ] Quick start guide
- [ ] Feature walkthrough

### Developer Documentation
- ✅ API documentation (Swagger)
- ✅ Setup guide (SETUP.md)
- ✅ Architecture overview (README.md)
- [ ] Contributing guide
- [ ] Code style guide
- [ ] Testing guide
- [ ] Deployment guide
- [ ] Troubleshooting guide

---

## 📝 Changelog

### Version 2.0.0 - 2024-11-12

**Added:**
- Complete monorepo structure with Turborepo
- Fastify API server with TypeScript
- PostgreSQL database with comprehensive schema
- Redis caching layer
- Character Policy DSL system
- Featured 10 characters with policies
- Next.js 15 web application
- Character directory with search/filters/sorting
- Real-time streaming chat interface
- Citation system with inline verse markers
- Sources drawer
- Deception flags for antagonist characters
- WebAuthn/passkey authentication
- Development bypass authentication
- Rate limiting
- Security headers (Helmet)
- CORS protection
- JWT authentication
- Audit logging system
- API documentation (Swagger/OpenAPI)
- Comprehensive setup guide
- This features documentation

**Changed:**
- N/A (initial release)

**Deprecated:**
- N/A

**Removed:**
- N/A

**Fixed:**
- N/A (initial release)

**Security:**
- Implemented basic security measures (see Security Features section)
- More hardening needed (see Upcoming Features)

---

## 🎓 Educational Purpose

**Important Notice:** Bible Character Chat is designed for educational and devotional purposes. It is not:

- A replacement for clergy or spiritual advisors
- A substitute for scholarly biblical study
- A source of personal prophecies or divine guidance
- Medical, legal, or financial advice
- An authoritative interpretation of Scripture

All responses are generated by AI and should be verified against Scripture and trusted theological resources.

---

## 📄 License & Attribution

**License:** Proprietary - All Rights Reserved

**Attributions:**
- Public domain Bible translations: KJV, ASV, WEB
- Open source libraries: See package.json files
- shadcn/ui components: MIT License
- Radix UI primitives: MIT License

---

**For questions, issues, or contributions, see the main README.md file.**
