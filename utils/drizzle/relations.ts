import {relations as drizzleRelations} from "drizzle-orm/relations";
import {users, characters, definitions, definitionHistory, ratings, relations} from "./schema";

export const charactersRelations = drizzleRelations(characters, ({one, many}) => ({
    user: one(users, {
        fields: [characters.ownerId],
        references: [users.id]
    }),
    ratings: many(ratings),
    definitions: many(definitions),
    relations_parentId: many(relations, {
        relationName: "relations_parentId_characters_id"
    }),
    relations_childId: many(relations, {
        relationName: "relations_childId_characters_id"
    }),
}));

export const usersRelations = drizzleRelations(users, ({many}) => ({
    characters: many(characters),
}));

export const definitionHistoryRelations = drizzleRelations(definitionHistory, ({one}) => ({
    definition: one(definitions, {
        fields: [definitionHistory.definitionId],
        references: [definitions.id]
    }),
}));

export const definitionsRelations = drizzleRelations(definitions, ({one, many}) => ({
    definitionHistories: many(definitionHistory),
    character: one(characters, {
        fields: [definitions.id],
        references: [characters.id]
    }),
}));

export const ratingsRelations = drizzleRelations(ratings, ({one}) => ({
    character: one(characters, {
        fields: [ratings.id],
        references: [characters.id]
    }),
}));

export const relationsRelations = drizzleRelations(relations, ({one}) => ({
    character_parentId: one(characters, {
        fields: [relations.parentId],
        references: [characters.id],
        relationName: "relations_parentId_characters_id"
    }),
    character_childId: one(characters, {
        fields: [relations.childId],
        references: [characters.id],
        relationName: "relations_childId_characters_id"
    }),
}));
