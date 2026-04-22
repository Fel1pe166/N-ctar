import {
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const adEventsTable = pgTable("ad_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  adId: uuid("ad_id").notNull(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(), // "view" | "click"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
