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

export enum StringSearch {
    Strict = 'strict',
    Includes = 'includes',
}

export enum StringSearchExtended {
    Strict = 'strict',
    Includes = 'includes',
    Like = 'like',
}

export enum ComparisonOperator {
    Equal = 'equal',
    NotEqual = 'notEqual',
    Greater = 'greater',
    Less = 'less',
    GreaterOrEqual = 'greaterOrEqual',
    LessOrEqual = 'lessOrEqual',
    Between = 'between',
    Outside = 'outside',
    Before = 'before',
    After = 'after',
}

export type SearchFlagString = {
    query: string;
    option: StringSearch;
};

export type SearchFlagStringExtend = {
    query: string;
    option: StringSearchExtended;
};

export type SearchFlagNumber = {
    query: number;
    option: Exclude<ComparisonOperator, ComparisonOperator.Between | ComparisonOperator.Outside | ComparisonOperator.Before | ComparisonOperator.After>;
};

export type SearchFlagNumberRange = {
    from: number;
    to: number;
    option: ComparisonOperator.Between | ComparisonOperator.Outside;
};

export type SearchFlagDate = {
    query: Date;
    option: ComparisonOperator.Equal | ComparisonOperator.Before | ComparisonOperator.After;
};

export type SearchFlagDateRange = {
    from: Date;
    to: Date;
    option: ComparisonOperator.Between;
};

export type SearchFlagEmbedding = {
    query: string;
    threshold: number;
};

export type SearchFlags = {
    id?: SearchFlagNumber | SearchFlagNumberRange;
    name?: SearchFlagString;
    desc?: SearchFlagStringExtend | SearchFlagEmbedding;
    fileName?: SearchFlagString;
    uploadDate?: SearchFlagDate | SearchFlagDateRange;
};
