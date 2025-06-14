-- 01_create_schema_and_seed.sql

-- 1) Tabelle „Users"
CREATE TABLE IF NOT EXISTS "Users" (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(255) UNIQUE NOT NULL,
  "passwordHash" TEXT        NOT NULL,
  "isBlocked"   BOOLEAN      DEFAULT FALSE,
  "failedLoginAttempts" INTEGER DEFAULT 0,
  "loginBlockedUntil" TIMESTAMPTZ,
  "createdAt"   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 2) Tabelle „Roles"
CREATE TABLE IF NOT EXISTS "Roles" (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(255) UNIQUE NOT NULL,
  "createdAt"   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 3) Junction-Table für Many-to-Many (KORRIGIERT: createdAt/updatedAt hinzugefügt)
CREATE TABLE IF NOT EXISTS "UserRoles" (
  "UserId"      INTEGER NOT NULL
    REFERENCES "Users"(id)   ON DELETE CASCADE,
  "RoleId"      INTEGER NOT NULL
    REFERENCES "Roles"(id)   ON DELETE CASCADE,
  "createdAt"   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  PRIMARY KEY ("UserId", "RoleId")
);

-- 4) Standard-Rolle „user" anlegen (idempotent)
INSERT INTO "Roles"(name)
VALUES ('user')
ON CONFLICT (name) DO NOTHING;

-- 5) Tabelle "ContentItems"
CREATE TABLE IF NOT EXISTS "ContentItems" (
  id            SERIAL PRIMARY KEY,
  type          VARCHAR(50)   NOT NULL,
  title         VARCHAR(255)  NOT NULL,
  content       TEXT          NOT NULL,
  "authorId"    INTEGER       NOT NULL
    REFERENCES "Users"(id)   ON DELETE CASCADE,
  date          TIMESTAMPTZ   NOT NULL DEFAULT now(),
  "thumbnailUrl" TEXT,
  "mediaUrl"    TEXT,
  "audioUrl"    TEXT,
  duration      VARCHAR(10),
  ratings       JSONB         DEFAULT '{"beauty": 0, "wisdom": 0, "humor": 0}'::jsonb,
  tags          TEXT[],
  question      TEXT,
  discussion    JSONB,
  "aspectRatio" VARCHAR(20),
  dimensions    JSONB,
  "createdAt"   TIMESTAMPTZ   NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- 6) Tabelle für Benutzer-Bewertungen
CREATE TABLE IF NOT EXISTS "ContentRatings" (
  id            SERIAL PRIMARY KEY,
  "contentId"   INTEGER       NOT NULL
    REFERENCES "ContentItems"(id)   ON DELETE CASCADE,
  "userId"      INTEGER       NOT NULL
    REFERENCES "Users"(id)   ON DELETE CASCADE,
  beauty        BOOLEAN,
  wisdom        BOOLEAN,
  humor         BOOLEAN,
  "createdAt"   TIMESTAMPTZ   NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMPTZ   NOT NULL DEFAULT now(),
  UNIQUE("contentId", "userId")
);