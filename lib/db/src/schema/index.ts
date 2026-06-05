import {
  pgTable, serial, text, integer, numeric, timestamp, date, unique,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id:           serial("id").primaryKey(),
  username:     text("username").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt:    timestamp("created_at").defaultNow().notNull(),
});

export const userProfiles = pgTable("user_profiles", {
  id:               serial("id").primaryKey(),
  userId:           integer("user_id").references(() => users.id).notNull(),
  name:             text("name").default("").notNull(),
  age:              integer("age").default(25).notNull(),
  gender:           text("gender").default("male").notNull(),
  height:           numeric("height").default("170").notNull(),
  weight:           numeric("weight").default("70").notNull(),
  targetWeight:     numeric("target_weight").default("65").notNull(),
  activityLevel:    text("activity_level").default("Moderately Active").notNull(),
  goal:             text("goal").default("Weight Loss").notNull(),
  dailyCalorieGoal: integer("daily_calorie_goal").default(2000).notNull(),
  profilePhoto:     text("profile_photo").default("").notNull(),
  stepGoal:         integer("step_goal").default(10000).notNull(),
  theme:            text("theme").default("dark").notNull(),
  updatedAt:        timestamp("updated_at").defaultNow().notNull(),
});

export const foodLogs = pgTable("food_logs", {
  id:        serial("id").primaryKey(),
  userId:    integer("user_id").references(() => users.id).notNull(),
  date:      date("date").notNull(),
  name:      text("name").notNull(),
  calories:  integer("calories").default(0).notNull(),
  protein:   numeric("protein").default("0").notNull(),
  carbs:     numeric("carbs").default("0").notNull(),
  fat:       numeric("fat").default("0").notNull(),
  fiber:     numeric("fiber").default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workoutLogs = pgTable("workout_logs", {
  id:        serial("id").primaryKey(),
  userId:    integer("user_id").references(() => users.id).notNull(),
  date:      date("date").notNull(),
  exercise:  text("exercise").notNull(),
  sets:      integer("sets").default(1).notNull(),
  reps:      integer("reps").default(1).notNull(),
  weight:    numeric("weight").default("0").notNull(),
  unit:      text("unit").default("kg").notNull(),
  notes:     text("notes").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stepEntries = pgTable("step_entries", {
  id:     serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  date:   date("date").notNull(),
  steps:  integer("steps").default(0).notNull(),
}, (t) => [unique().on(t.userId, t.date)]);

export const measurements = pgTable("measurements", {
  id:          serial("id").primaryKey(),
  userId:      integer("user_id").references(() => users.id).notNull(),
  date:        date("date").notNull(),
  chest:       numeric("chest").default("0").notNull(),
  waist:       numeric("waist").default("0").notNull(),
  hips:        numeric("hips").default("0").notNull(),
  leftArm:     numeric("left_arm").default("0").notNull(),
  rightArm:    numeric("right_arm").default("0").notNull(),
  leftThigh:   numeric("left_thigh").default("0").notNull(),
  rightThigh:  numeric("right_thigh").default("0").notNull(),
  shoulders:   numeric("shoulders").default("0").notNull(),
  neck:        numeric("neck").default("0").notNull(),
  notes:       text("notes").default("").notNull(),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
});

export const dailyLogs = pgTable("daily_logs", {
  id:     serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  date:   date("date").notNull(),
  water:  numeric("water").default("0").notNull(),
  sleep:  numeric("sleep").default("0").notNull(),
}, (t) => [unique().on(t.userId, t.date)]);
