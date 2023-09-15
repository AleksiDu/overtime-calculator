import { InferModel } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const overtimes = sqliteTable("overtimes", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  rate: integer("rate").notNull(),
  hour: integer("hour").notNull(),
  overtimePay: integer("overtimePay").notNull(),
  date: text("date").notNull(),
});

export type Overtime = InferModel<typeof overtimes>;
