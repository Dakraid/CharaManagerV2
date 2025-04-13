CREATE TABLE "lorebooks" (
	"id" integer PRIMARY KEY NOT NULL,
	"lorebook" text NOT NULL,
	"hash" text NOT NULL,
	"embedding" vector(768)
);
--> statement-breakpoint
DROP VIEW "public"."tag_counts";--> statement-breakpoint
DROP VIEW "public"."definition_tags";--> statement-breakpoint
ALTER TABLE "ratings" ADD COLUMN "aiGrammarAndSpellingScore" integer;--> statement-breakpoint
ALTER TABLE "ratings" ADD COLUMN "aiGrammarAndSpellingReason" text;--> statement-breakpoint
ALTER TABLE "ratings" ADD COLUMN "aiAppearanceScore" integer;--> statement-breakpoint
ALTER TABLE "ratings" ADD COLUMN "aiAppearanceReason" text;--> statement-breakpoint
ALTER TABLE "ratings" ADD COLUMN "aiPersonalityScore" integer;--> statement-breakpoint
ALTER TABLE "ratings" ADD COLUMN "aiPersonalityReason" text;--> statement-breakpoint
ALTER TABLE "ratings" ADD COLUMN "aiBackgroundScore" integer;--> statement-breakpoint
ALTER TABLE "ratings" ADD COLUMN "aiBackgroundReason" text;--> statement-breakpoint
ALTER TABLE "ratings" ADD COLUMN "aiCreativeElementsScore" integer;--> statement-breakpoint
ALTER TABLE "ratings" ADD COLUMN "aiCreativeElementsReason" text;--> statement-breakpoint
ALTER TABLE "ratings" ADD COLUMN "aiConsistencyScore" integer;--> statement-breakpoint
ALTER TABLE "ratings" ADD COLUMN "aiConsistencyReason" text;--> statement-breakpoint
ALTER TABLE "ratings" ADD COLUMN "aiStructureScore" integer;--> statement-breakpoint
ALTER TABLE "ratings" ADD COLUMN "aiStructureReason" text;--> statement-breakpoint
ALTER TABLE "lorebooks" ADD CONSTRAINT "lorebooks_id_characters_id_fk" FOREIGN KEY ("id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "lorebookEmbeddingIndex" ON "lorebooks" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE VIEW "public"."definition_tags" AS (SELECT id, array_agg(TRIM(BOTH '"'::text FROM tag)) AS tags
    FROM (SELECT definitions.id, unnest(regexp_split_to_array("substring"(definitions.definition, '"tags":[(.*?)]'::text), ',s*'::text)) AS tag
    FROM definitions
    WHERE definitions.definition ~~ '%"tags":%'::text) sub
    GROUP BY id);--> statement-breakpoint
CREATE VIEW "public"."tag_counts" AS (SELECT lower(unnest(tags)) AS tag, count(*) AS usage_count
    FROM definition_tags
    WHERE tags <> '{""}'::text[] AND tags IS NOT NULL AND array_length(tags, 1) > 0
    GROUP BY (lower(unnest(tags)))
    ORDER BY (count(*)) DESC);
