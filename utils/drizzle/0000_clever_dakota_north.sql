-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations

CREATE TABLE IF NOT EXISTS "characters"
(
    "id"          serial PRIMARY KEY    NOT NULL,
    "file"        text                  NOT NULL,
    "source_uri"  text    DEFAULT 'NULL',
    "file_name"   text                  NOT NULL,
    "char_name"   text    DEFAULT 'NULL',
    "etag"        text    DEFAULT 'NULL',
    "upload_date" timestamp             NOT NULL,
    "hash"        text                  NOT NULL,
    "public"      boolean DEFAULT false NOT NULL,
    "owner_id"    integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "definition_history"
(
    "definition_id"   integer            NOT NULL,
    "prev_definition" text               NOT NULL,
    "changed_date"    timestamp          NOT NULL,
    "id"              serial PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ratings"
(
    "id"     integer PRIMARY KEY NOT NULL,
    "rating" integer DEFAULT 0   NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tags"
(
    "id"    serial PRIMARY KEY NOT NULL,
    "tag"   text               NOT NULL,
    "count" integer DEFAULT 0  NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "definitions"
(
    "id"               integer PRIMARY KEY NOT NULL,
    "definition"       text                NOT NULL,
    "hash"             text                NOT NULL,
    "embedding"        vector(768),
    "tokens_permanent" integer,
    "tokens_total"     integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"
(
    "id"       serial PRIMARY KEY NOT NULL,
    "username" text               NOT NULL,
    "password" text               NOT NULL,
    CONSTRAINT "users_username_unique" UNIQUE ("username")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "relations"
(
    "parent_id" integer NOT NULL,
    "child_id"  integer NOT NULL,
    CONSTRAINT "relations_parent_id_child_id_pk" PRIMARY KEY ("parent_id", "child_id")
);
--> statement-breakpoint
DO
$$
    BEGIN
        ALTER TABLE "characters"
            ADD CONSTRAINT "characters_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users" ("id") ON DELETE restrict ON UPDATE restrict;
    EXCEPTION
        WHEN duplicate_object THEN null;
    END
$$;
--> statement-breakpoint
DO
$$
    BEGIN
        ALTER TABLE "definition_history"
            ADD CONSTRAINT "definition_history_definition_id_definitions_id_fk" FOREIGN KEY ("definition_id") REFERENCES "public"."definitions" ("id") ON DELETE cascade ON UPDATE cascade;
    EXCEPTION
        WHEN duplicate_object THEN null;
    END
$$;
--> statement-breakpoint
DO
$$
    BEGIN
        ALTER TABLE "ratings"
            ADD CONSTRAINT "ratings_id_characters_id_fk" FOREIGN KEY ("id") REFERENCES "public"."characters" ("id") ON DELETE cascade ON UPDATE cascade;
    EXCEPTION
        WHEN duplicate_object THEN null;
    END
$$;
--> statement-breakpoint
DO
$$
    BEGIN
        ALTER TABLE "definitions"
            ADD CONSTRAINT "definitions_id_characters_id_fk" FOREIGN KEY ("id") REFERENCES "public"."characters" ("id") ON DELETE cascade ON UPDATE cascade;
    EXCEPTION
        WHEN duplicate_object THEN null;
    END
$$;
--> statement-breakpoint
DO
$$
    BEGIN
        ALTER TABLE "relations"
            ADD CONSTRAINT "relations_parent_id_characters_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."characters" ("id") ON DELETE cascade ON UPDATE cascade;
    EXCEPTION
        WHEN duplicate_object THEN null;
    END
$$;
--> statement-breakpoint
DO
$$
    BEGIN
        ALTER TABLE "relations"
            ADD CONSTRAINT "relations_child_id_characters_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."characters" ("id") ON DELETE cascade ON UPDATE cascade;
    EXCEPTION
        WHEN duplicate_object THEN null;
    END
$$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "id_idx" ON "characters" USING btree ("id" int4_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "embeddingIndex" ON "definitions" USING hnsw ("embedding" vector_cosine_ops);
--> statement-breakpoint
CREATE VIEW "public"."definition_tags" AS
(
SELECT id, array_agg(TRIM(BOTH '"'::text FROM tag)) AS tags
FROM (SELECT definitions.id, unnest(regexp_split_to_array("substring"(definitions.definition, '"tags":\[(.*?)\]'::text), ',\s*'::text)) AS tag
      FROM definitions
      WHERE definitions.definition ~~ '%"tags":%'::text) sub
GROUP BY id);
--> statement-breakpoint
CREATE VIEW "public"."tag_counts" AS
(
SELECT lower(unnest(tags)) AS tag, count(*) AS usage_count
FROM definition_tags
WHERE tags <> '{""}'::text[]
  AND tags IS NOT NULL
  AND array_length(tags, 1) > 0
GROUP BY (lower(unnest(tags)))
ORDER BY (count(*)) DESC);
