import {
  pgTable,
  text,
  timestamp,
  integer,
  uuid,
} from "drizzle-orm/pg-core";

export const paymentsTable = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  userEmail: text("user_email"),
  userName: text("user_name"),
  plan: text("plan").notNull(),
  amountCents: integer("amount_cents").notNull(),
  pixKey: text("pix_key").notNull(),
  proofUrl: text("proof_url").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
});

export type Payment = typeof paymentsTable.$inferSelect;
