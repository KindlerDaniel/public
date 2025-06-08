-- 01_create_schema_and_seed.sql

-- 1) Tabelle „Users“
CREATE TABLE IF NOT EXISTS "Users" (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  "passwordHash" TEXT        NOT NULL,
  "isBlocked"   BOOLEAN      DEFAULT FALSE,
  "createdAt"   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 2) Tabelle „Roles“
CREATE TABLE IF NOT EXISTS "Roles" (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(255) UNIQUE NOT NULL,
  "createdAt"   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 3) Junction-Table für Many-to-Many
CREATE TABLE IF NOT EXISTS "UserRoles" (
  "UserId"      INTEGER NOT NULL
    REFERENCES "Users"(id)   ON DELETE CASCADE,
  "RoleId"      INTEGER NOT NULL
    REFERENCES "Roles"(id)   ON DELETE CASCADE,
  PRIMARY KEY ("UserId", "RoleId")
);

-- 4) Standard-Rolle „user“ anlegen (idempotent)
INSERT INTO "Roles"(name)
VALUES ('user')
ON CONFLICT (name) DO NOTHING;
