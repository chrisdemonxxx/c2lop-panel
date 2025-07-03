-- Migration for loginEvent table
CREATE TABLE IF NOT EXISTS "loginEvent" (
  "id" SERIAL PRIMARY KEY,
  "email" VARCHAR(255) NOT NULL,
  "status" VARCHAR(16) NOT NULL,
  "ip" VARCHAR(45),
  "timestamp" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
