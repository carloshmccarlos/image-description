import { pgTable, text, timestamp, jsonb, uuid, boolean } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  email: text('email'),
  imageUrl: text('image_url'),
  nativeLanguage: text('native_language').default('zh'),
  targetLanguage: text('target_language').default('en'),
  difficulty: text('difficulty').default('Beginner'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

export const lessons = pgTable('lessons', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  imageUrl: text('image_url').notNull(),
  description: jsonb('description').notNull(), // { target, native } or { _pending: true } or { _error: string }
  vocabulary: jsonb('vocabulary').notNull(), // Array of { word, pronunciation, category, translation }
  difficulty: text('difficulty').default('Beginner'),
  isSaved: boolean('is_saved').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
