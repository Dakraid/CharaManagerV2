import {pgTable, uniqueIndex, foreignKey, serial, text, timestamp, boolean, integer, index, vector, unique, primaryKey, pgView, bigint} from "drizzle-orm/pg-core"
import {sql} from "drizzle-orm"


export const characters = pgTable("characters", {
    id: serial().primaryKey().notNull(),
    file: text().notNull(),
    sourceUri: text("source_uri").default('NULL'),
    fileName: text("file_name").notNull(),
    charName: text("char_name").default('NULL'),
    etag: text().default('NULL'),
    uploadDate: timestamp("upload_date", {mode: 'string'}).notNull(),
    hash: text().notNull(),
    public: boolean().default(false).notNull(),
    ownerId: integer("owner_id"),
}, (table) => {
    return {
        idIdx: uniqueIndex("id_idx").using("btree", table.id.asc().nullsLast().op("int4_ops")),
        charactersOwnerIdUsersIdFk: foreignKey({
            columns: [table.ownerId],
            foreignColumns: [users.id],
            name: "characters_owner_id_users_id_fk"
        }).onUpdate("restrict").onDelete("restrict"),
    }
});

export const definitionHistory = pgTable("definition_history", {
    definitionId: integer("definition_id").notNull(),
    prevDefinition: text("prev_definition").notNull(),
    changedDate: timestamp("changed_date", {mode: 'string'}).notNull(),
    id: serial().primaryKey().notNull(),
}, (table) => {
    return {
        definitionHistoryDefinitionIdDefinitionsIdFk: foreignKey({
            columns: [table.definitionId],
            foreignColumns: [definitions.id],
            name: "definition_history_definition_id_definitions_id_fk"
        }).onUpdate("cascade").onDelete("cascade"),
    }
});

export const ratings = pgTable("ratings", {
    id: integer().primaryKey().notNull(),
    rating: integer().default(0).notNull(),
}, (table) => {
    return {
        ratingsIdCharactersIdFk: foreignKey({
            columns: [table.id],
            foreignColumns: [characters.id],
            name: "ratings_id_characters_id_fk"
        }).onUpdate("cascade").onDelete("cascade"),
    }
});

export const tags = pgTable("tags", {
    id: serial().primaryKey().notNull(),
    tag: text().notNull(),
    count: integer().default(0).notNull(),
});

export const definitions = pgTable("definitions", {
    id: integer().primaryKey().notNull(),
    definition: text().notNull(),
    hash: text().notNull(),
    embedding: vector({dimensions: 768}),
    tokensPermanent: integer("tokens_permanent"),
    tokensTotal: integer("tokens_total"),
}, (table) => {
    return {
        embeddingIndex: index("embeddingIndex").using("hnsw", table.embedding.asc().nullsLast().op("vector_cosine_ops")),
        definitionsIdCharactersIdFk: foreignKey({
            columns: [table.id],
            foreignColumns: [characters.id],
            name: "definitions_id_characters_id_fk"
        }).onUpdate("cascade").onDelete("cascade"),
    }
});

export const users = pgTable("users", {
    id: serial().primaryKey().notNull(),
    username: text().notNull(),
    password: text().notNull(),
}, (table) => {
    return {
        usersUsernameUnique: unique("users_username_unique").on(table.username),
    }
});

export const relations = pgTable("relations", {
    parentId: integer("parent_id").notNull(),
    childId: integer("child_id").notNull(),
}, (table) => {
    return {
        relationsParentIdCharactersIdFk: foreignKey({
            columns: [table.parentId],
            foreignColumns: [characters.id],
            name: "relations_parent_id_characters_id_fk"
        }).onUpdate("cascade").onDelete("cascade"),
        relationsChildIdCharactersIdFk: foreignKey({
            columns: [table.childId],
            foreignColumns: [characters.id],
            name: "relations_child_id_characters_id_fk"
        }).onUpdate("cascade").onDelete("cascade"),
        relationsParentIdChildIdPk: primaryKey({columns: [table.parentId, table.childId], name: "relations_parent_id_child_id_pk"}),
    }
});
export const definitionTags = pgView("definition_tags", {
    id: integer(),
    tags: text(),
}).as(sql`SELECT id, array_agg(TRIM(BOTH '"'::text FROM tag)) AS tags FROM ( SELECT definitions.id, unnest(regexp_split_to_array("substring"(definitions.definition, '"tags":\[(.*?)\]'::text), ',\s*'::text)) AS tag FROM definitions WHERE definitions.definition ~~ '%"tags":%'::text) sub GROUP BY id`);

export const tagCounts = pgView("tag_counts", {
    tag: text(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    usageCount: bigint("usage_count", {mode: "number"}),
}).as(sql`SELECT lower(unnest(tags)) AS tag, count(*) AS usage_count FROM definition_tags WHERE tags <> '{""}'::text[] AND tags IS NOT NULL AND array_length(tags, 1) > 0 GROUP BY (lower(unnest(tags))) ORDER BY (count(*)) DESC`);
