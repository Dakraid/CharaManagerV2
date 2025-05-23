export interface Character {
    id: number;
    fileName: string;
    charName: string;
    uploadDate: string;
    etag: string;
    rating: number;
    tokensPermanent: number;
    tokensTotal: number;
}

export interface CharacterWithDef {
    id: number;
    fileName: string;
    charName: string;
    uploadDate: string;
    etag: string;
    rating: number;
    tokensPermanent: number;
    tokensTotal: number;
    definition: string;
}

export interface RemoteChar {
    fileName: string;
    lastModified: string;
    sourceUri: string;
    content: string;
}

export interface Rating {
    id: number;
    rating: number;
}

export interface RatingWithEval {
    id: number;
    rating: number;
    aiGrammarAndSpellingScore: number;
    aiGrammarAndSpellingReason: string;
    aiAppearanceScore: number;
    aiAppearanceReason: string;
    aiPersonalityScore: number;
    aiPersonalityReason: string;
    aiBackgroundScore: number;
    aiBackgroundReason: string;
    aiIntroductionScore: number;
    aiIntroductionReason: string;
    aiCreativeElementsScore: number;
    aiCreativeElementsReason: string;
    aiConsistencyScore: number;
    aiConsistencyReason: string;
    aiStructureScore: number;
    aiStructureReason: string;
}

export interface Definition {
    id: number;
    definition: string;
}

export interface DefinitionRow {
    id: number;
    definition: string;
    hash: string;
    embedding: number[] | undefined;
    tokensPermanent: number;
    tokensTotal: number;
}

export interface FileRow {
    file: string;
    fileName: string;
    uploadDate: string;
    hash: string;
    etag?: string;
    sourceUri?: string;
}

export interface FileUpload {
    name: string;
    content: string;
    size: string;
    type: string;
    lastModified: string;
    sourceUri?: string;
}

export interface LogEntry {
    id: number;
    level: string;
    timestamp: Date;
    message: string;
}

export interface Statistics {
    charCount: number;
    charTags: [string, number][];
    charAuthors: [string, number][];
    charDates: [string, number][];
    charTokens: [string, number][];
}

export interface StatisticsCache {
    highestId: number;
    statistics: Statistics;
}

export interface Relation {
    parentId: number;
    childId: number;
}

export interface User {
    id: number;
    username: string;
    password: string;
}
