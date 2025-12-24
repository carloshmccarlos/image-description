# LexiLens Architecture

## Overview
LexiLens is a visual language learning application that uses AI to analyze images and generate vocabulary/descriptions in the user's target language.

## Tech Stack
- **Framework**: Next.js 16.1.0 (App Router)
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Storage**: Cloudflare R2 (S3-compatible)
- **Auth**: Clerk
- **AI**: SiliconFlow API (GLM-4.6V model)
- **Styling**: Tailwind CSS

## Database Schema

```sql
-- Users table (synced with Clerk)
CREATE TABLE users (
  id TEXT PRIMARY KEY,              -- Clerk user ID
  email TEXT,
  image_url TEXT,
  native_language TEXT DEFAULT 'zh',
  target_language TEXT DEFAULT 'en',
  difficulty TEXT DEFAULT 'Beginner',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Lessons table (analyzed images)
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) NOT NULL,
  image_url TEXT NOT NULL,
  description JSONB NOT NULL,       -- { target: string, native: string }
  vocabulary JSONB NOT NULL,        -- Array of { word, pronunciation, category, translation }
  difficulty TEXT DEFAULT 'Beginner',
  is_saved BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

## Key Architecture Decisions

### 1. API Route for Analysis (Prevents HTTP2 Errors)
The original implementation called `analyzeImage` server action directly from the results page. This caused `ERR_HTTP2_PROTOCOL_ERROR` on Vercel because:
- Server actions have response size limits
- Long-running AI calls can timeout during SSR
- Large base64 images in the response payload

**Solution**: Created `/api/analyze` route that:
- Handles AI analysis separately from page render
- Returns only the lesson ID (small payload)
- Client navigates to results page after completion

### 2. Client-Side Image Compression
Images are compressed to 500KB max before upload to:
- Reduce R2 storage costs
- Speed up AI analysis (smaller base64 payload)
- Improve upload times

### 3. Lesson Caching
Analysis results are cached in the database immediately:
- Prevents re-analysis on page refresh
- Allows viewing history of analyzed images
- Supports "save to history" feature

### 4. R2 Storage Strategy
- `temp/` - Newly uploaded images (auto-cleaned by cron)
- `saved/` - Images saved to user's history

## File Structure

```
├── actions/
│   ├── analyze.ts      # AI analysis logic
│   ├── save-lesson.ts  # Save/delete lessons
│   ├── upload.ts       # R2 upload operations
│   └── user.ts         # User preferences
├── app/
│   ├── api/
│   │   ├── analyze/    # Analysis API route
│   │   └── cron/       # Cleanup jobs
│   ├── analyze/        # Upload page
│   ├── history/        # Saved lessons
│   ├── onboarding/     # Language selection
│   └── results/        # Analysis results
├── components/
│   ├── ResultsView.tsx # Results display
│   └── UploadZone.tsx  # File upload UI
├── db/
│   ├── index.ts        # Drizzle client
│   └── schema.ts       # Database schema
└── lib/
    ├── i18n/           # Internationalization
    ├── image-utils.ts  # Client compression
    └── r2.ts           # R2 client config
```

## API Flow

```
1. User uploads image
   └─> Client compresses image (500KB max)
   └─> uploadToR2() stores in temp/
   
2. Client calls POST /api/analyze
   └─> Check for existing analysis (cache)
   └─> Fetch image, convert to base64
   └─> Call SiliconFlow AI
   └─> Store results in lessons table
   └─> Return lesson ID

3. Client navigates to /results?id={lessonId}
   └─> Server loads lesson from DB
   └─> Renders ResultsView component

4. User saves lesson (optional)
   └─> promoteImageToSaved() moves temp/ → saved/
   └─> Update lesson.isSaved = true
```

## Environment Variables

```env
# Database
DATABASE_URL=

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_DOMAIN=

# AI
SILICONFLOW_API_KEY=

# Cron
CRON_SECRET=
```

## Performance Optimizations

1. **Lazy OpenAI client initialization** - Avoids build-time errors
2. **30s timeout on image fetch** - Prevents hanging requests
3. **maxDuration: 60** on API route - Allows longer AI processing
4. **Client-side compression** - Reduces payload sizes
5. **Database caching** - Prevents duplicate AI calls
