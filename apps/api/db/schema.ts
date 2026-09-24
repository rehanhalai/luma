import { integer, text } from 'drizzle-orm/pg-core/columns';
import { pgTable } from 'drizzle-orm/pg-core/table';

export const player = pgTable('player', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text('name').notNull(),
});

export type Player = typeof player.$inferSelect;
export type NewPlayer = typeof player.$inferInsert;
