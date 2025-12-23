# Implementation Plan: LexiLens - Visual English Learning

This plan outlines the step-by-step development process for the base functionality of LexiLens.

---

---

## Phase 1: Foundation & Infrastructure

### 1.1 Project Initialization
- Initialize a Next.js 14+ project using `pnpm` with the App Router, TypeScript, and Tailwind CSS.
- Install core dependencies: `drizzle-orm`, `@neondatabase/serverless`, `@clerk/nextjs`, `lucide-react`, `framer-motion`, and `clsx`.
- Set up a basic directory structure following the `AGENTS.md` guidelines (components, hooks, lib, server actions).
- **Test**: Run `pnpm dev` and verify the Next.js welcome page is visible at `localhost:3000`.

### 1.2 Database & ORM Setup
- Configure Drizzle ORM to connect to a Neon PostgreSQL instance.
- Define initial schema in `src/db/schema.ts`:
    - `users` table: Add `native_language` and `target_language` columns.
    - `lessons` table (storing R2 image URLs, descriptions, and JSON vocabulary lists).
- Create a migration script and run it.
- **Test**: Verify that the `users` table has the new language columns using Drizzle Studio.

### 1.3 Authentication & Onboarding
- Integrate `@clerk/nextjs` for user authentication.
- Create an Onboarding flow (`/onboarding`) that triggers after registration:
    - Form to select **Mother Language** (Native) and **Language to Learn** (Target).
    - Save these preferences to the `users` table in Neon.
- Update `middleware.ts` to redirect users without headers/metadata to onboarding.
- **Test**: Sign up a new user and verify they are redirected to the language selection screen.

---

## Phase 2: Storage & AI Integration

### 2.1 Cloudflare R2 Storage Setup
- Configure an S3-compatible client (AWS SDK v3) for Cloudflare R2.
- Implement a server action to generate a pre-signed URL for client-side uploads.
- **Test**: Manually trigger a test upload from a temporary script.

### 2.2 SiliconFlow AI (GLM-4.6V) Integration
- Set up an API client for SiliconFlow.
- Update `analyzeImage` server action to accept `targetLanguage` and `nativeLanguage` parameters.
- **Prompt Engineering**:
    - Instruct AI to generate the description in `targetLanguage`.
    - Instruct AI to provide vocabulary translations in `nativeLanguage`.
- **Test**: Call the action asking for a Japanese description with English translations (or vice versa) and verify the output.

---

## Phase 3: Core UI Development

### 3.1 Global Styles & Localization
- Configure `tailwind.config.js`.
- Implement a basic localization helper (or use a library like `next-intl` if scope permits, otherwise simple mapping) to translate UI labels into the user's `nativeLanguage`.
- **Test**: Verify that UI headers match the selected Mother Language (e.g., if Mother Lan is Korean, "Upload" -> "업로드").

### 3.2 Landing Page & Upload Component
- Build the landing page (`/`).
- Create an interactive "Upload Zone" component.
- **Test**: Drag and drop a dummy file.

### 3.3 Analysis Results View
- Create a `/results` page to display:
    - The uploaded image.
    - Description in **Target Language**.
    - Vocabulary with **Native Language** translations.
- Implement translation toggle to show the `description` translated into **Native Language**.
- **Test**: Verify the correct languages are displayed based on user profile.

---

## Phase 4: Functional Wiring

### 4.1 The Analysis Loop
- Connect Upload Zone to R2.
- Fetch user preferences from DB before calling AI analysis.
- Pass correct languages to `analyzeImage`.
- **Test**: Upload an image as a user learning Chinese (Native: English) and verify the results are in Chinese with English help.

### 4.2 Translation Logic
- Update the AI prompt to ensure the JSON payload includes the Native Language translation for the main description.
- Wire the UI toggle to switch between Target and Native language for the description.

### 4.3 Data Persistence (Save Result)
- Implement a "Save Result" button.
- Store the lesson, capturing the specific languages used at that time.
- **Test**: Save and check DB.

---

## Phase 5: Polish

### 5.1 History Gallery (Base version)
- Create a `/history` page that fetches and displays a list of the user's saved lessons from the database.
- Each item should show a thumbnail of the image and the date.
- **Test**: Save three different images, visit `/history`, and verify all three appear correctly.
