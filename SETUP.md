# Setup Guide for Bible Character Chat

This guide will help you set up the Bible Character Chat application locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20+ and npm 10+
- **PostgreSQL** 16+ with pgvector extension
- **Redis** 6+
- **OpenAI API Key** (for LLM integration)

## Step-by-Step Setup

### 1. Install PostgreSQL with pgvector

#### On macOS (using Homebrew):

```bash
brew install postgresql@16
brew services start postgresql@16

# Install pgvector
cd /tmp
git clone https://github.com/pgvector/pgvector.git
cd pgvector
make
make install  # May require sudo
```

#### On Ubuntu/Debian:

```bash
sudo apt-get install postgresql-16 postgresql-contrib-16
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Install pgvector
sudo apt-get install postgresql-16-pgvector
```

### 2. Install Redis

#### On macOS:

```bash
brew install redis
brew services start redis
```

#### On Ubuntu/Debian:

```bash
sudo apt-get install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

### 3. Create Database

```bash
# Create database
createdb bcc_dev

# Or using psql
psql postgres
CREATE DATABASE bcc_dev;
\q
```

### 4. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd bible_character_chat_plan

# Install dependencies
npm install
```

### 5. Configure Environment Variables

#### Server Configuration

```bash
cd apps/bcc_server
cp .env.example .env
```

Edit `apps/bcc_server/.env`:

```env
# Server
NODE_ENV=development
PORT=3001
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://YOUR_USERNAME@localhost:5432/bcc_dev
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview

# WebAuthn (for production)
RP_NAME=Bible Character Chat
RP_ID=localhost
RP_ORIGIN=http://localhost:3000

# Auth - SET TO true FOR DEVELOPMENT
AUTH_BYPASS_ENABLED=true

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000

# Logging
LOG_LEVEL=info

# CORS
CORS_ORIGIN=http://localhost:3000

# Encryption
ENCRYPTION_KEY=your-32-byte-encryption-key-change-this-to-32-chars
```

#### Web Configuration

```bash
cd ../bcc_web
cp .env.example .env.local
```

Edit `apps/bcc_web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_APP_NAME=Bible Character Chat
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Run Database Migrations

```bash
# From root directory
npm run db:migrate
```

This will:
- Create all necessary tables
- Set up pgvector extension
- Create indexes
- Set up triggers

### 7. Seed Database

```bash
npm run db:seed
```

This will populate the database with the Featured 10 characters:
1. Jesus of Nazareth
2. God
3. Moses
4. King David
5. Paul the Apostle
6. Mary (Mother of Jesus)
7. Esther
8. Judas Iscariot
9. Satan
10. Michael the Archangel

### 8. Start Development Servers

#### Option A: Start All Services

```bash
npm run dev
```

This will start:
- API server on http://localhost:3001
- Web app on http://localhost:3000

#### Option B: Start Individually

```bash
# Terminal 1 - API Server
cd apps/bcc_server
npm run dev

# Terminal 2 - Web App
cd apps/bcc_web
npm run dev
```

### 9. Verify Setup

1. **Check API Health**:
   ```bash
   curl http://localhost:3001/health
   ```

   Should return:
   ```json
   {
     "status": "ok",
     "database": "connected",
     "redis": "connected"
   }
   ```

2. **Check API Documentation**:
   Open http://localhost:3001/docs in your browser

3. **Check Web App**:
   Open http://localhost:3000 in your browser

4. **Test Authentication** (with bypass enabled):
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"bypass"}'
   ```

### 10. Optional: Add Bible Text Content

To add Bible verses for the retrieval system:

```bash
# Create a JSON file with verses
cat > bible_verses.json << 'EOF'
[
  {
    "type": "verse",
    "ref": "John 3:16",
    "text": "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
    "translation": "KJV",
    "book": "John",
    "chapter": 3,
    "verseStart": 16,
    "verseEnd": 16,
    "license": "Public Domain"
  }
]
EOF

# TODO: Create admin ingestion script or use API
```

## Development Workflow

### Running Tests

```bash
# All tests
npm test

# Server tests only
cd apps/bcc_server && npm test

# Web tests only
cd apps/bcc_web && npm test
```

### Linting

```bash
npm run lint
```

### Building

```bash
# Build all
npm run build

# Build server
cd apps/bcc_server && npm run build

# Build web
cd apps/bcc_web && npm run build
```

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
pg_isready

# Check connection
psql -d bcc_dev -c "SELECT 1;"
```

### Redis Connection Issues

```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG
```

### Port Already in Use

```bash
# Check what's using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>
```

### pgvector Extension Not Found

```sql
-- Connect to database
psql bcc_dev

-- Check if extension exists
\dx

-- Install extension
CREATE EXTENSION IF NOT EXISTS vector;
```

## Next Steps

1. Explore the character directory at http://localhost:3000/directory
2. Start a conversation with a character
3. Review API documentation at http://localhost:3001/docs
4. Check the implementation plan in `bible_character_chat_plan_v2.txt`

## Production Deployment

For production deployment, see the main README.md file for detailed instructions.

## Support

If you encounter issues:
1. Check the logs in `apps/bcc_server/`
2. Verify all environment variables are set correctly
3. Ensure all services (PostgreSQL, Redis) are running
4. Review the troubleshooting section above
