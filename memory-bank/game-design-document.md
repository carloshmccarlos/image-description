# Game Design Document: LexiLens - Visual English Learning

## 1. Project Overview
**LexiLens** is an interactive web application designed to help users learn new languages by describing images and photos. It leverages advanced Vision Language Models (VLM) to identify objects, provide vocabulary, and generate contextual descriptions tailored to the user's proficiency level and language preferences.

---

## 2. Core Vision
To make language learning intuitive and immersive by connecting words with visual context, allowing users to "see" and "save" their learning journey in their target language.

---

## 3. Core Mechanics & Gameplay Loop
1.  **Login & Onboarding**: User authenticates via Clerk and selects their **Mother Language** (e.g., Korean, Japanese, Chinese, English) and **Learning Language** (Target).
2.  **Upload/Capture**: User uploads an image to Cloudflare R2.
3.  **Analysis**: `zai-org/GLM-4.6V` (SiliconFlow) identifies objects and scenes.
4.  **Vocabulary Discovery**: Users see words in the **Learning Language** with translations in their **Mother Language**.
5.  **Description Reading**: AI generates a paragraph describing the image in the **Learning Language** based on the selected difficulty level.
6.  **Translation Toggle**: Optional full-text translation of the description into the **Mother Language** for side-by-side learning.
7.  **Save Result**: Users can choose to save the analyzed image, vocabulary list, and translations to their profile (Neon DB).

---

## 4. Difficulty Levels
*   **Beginner (A1-A2)**: Focus on basic nouns and simple "Subject-Verb-Object" sentences in the target language.
*   **Intermediate (B1-B2)**: Includes adjectives, prepositions, and compound sentences. Focuses on storytelling.
*   **Advanced (C1-C2)**: Uses advanced vocabulary, idioms, nuances, and complex sentence structures.

---

## 5. Key Features
*   **User Profiles & Preferences**: Store "Mother Language" and "Learning Language" settings. Persistent learning history via Clerk & Neon.
*   **AI Visual Description**: Powered by `zai-org/GLM-4.6V` for high-accuracy image understanding in multiple languages.
*   **Vocabulary List**: A generated list of key words found in the picture with translations in the user's native language.
*   **Dynamic Localization**: The UI and translations adapt to the user's Mother Language.
*   **History Gallery**: A collection of previously saved learning sessions.

---

## 6. User Interface (Aesthetics)
*   **Theme**: Modern, clean, and "Glassmorphic" design.
*   **Colors**: Primary: Electric Indigo; Secondary: Mint Green; Accents: Soft Ember.
*   **Learning Dashboard**: A gallery of saved images, progress stats, and an "Analyze New Image" entry point.
*   **Interactive Image View**: Results displayed with toggleable translation layers (Learning vs. Native Language).

---

## 7. Technical Stack
*   **Authentication**: Clerk.
*   **Frontend**: Next.js (React), Tailwind CSS, Framer Motion.
*   **Backend**: Next.js API Routes / Server Actions.
*   **AI Model**: `zai-org/GLM-4.6V` via SiliconFlow API.
*   **Database**: Neon (Postgres).
*   **Storage**: Cloudflare R2 (for user-uploaded images).
*   **ORM**: Drizzle.

---


