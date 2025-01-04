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

export enum ComparisonOperator {
    Equal = 'Equal',
    NotEqual = 'Not Equal',
    Greater = 'Greater',
    Less = 'Less',
    GreaterOrEqual = 'Greater or Equal',
    LessOrEqual = 'Less or Equal',
    Between = 'Between',
    Outside = 'Outside',
    Like = 'Like',
    Cosine = 'Cosine',
}

export type ComparisonOperatorSymbol = {
    [key in ComparisonOperator]: string;
};

export const comparisonOperatorSymbols: ComparisonOperatorSymbol = {
    [ComparisonOperator.Equal]: '=',
    [ComparisonOperator.NotEqual]: '!=',
    [ComparisonOperator.Greater]: '>',
    [ComparisonOperator.Less]: '<',
    [ComparisonOperator.GreaterOrEqual]: '>=',
    [ComparisonOperator.LessOrEqual]: '<=',
    [ComparisonOperator.Between]: '><',
    [ComparisonOperator.Outside]: '<>',
    [ComparisonOperator.Like]: '~=',
    [ComparisonOperator.Cosine]: 'cos',
};

export type SearchFlagString = {
    query: string;
    option: ComparisonOperator.Equal | ComparisonOperator.NotEqual | ComparisonOperator.Like;
};

export type SearchFlagEmbedding = {
    query: string;
    threshold: number;
    option: ComparisonOperator.Cosine;
};

export type SearchFlagNumber = {
    query: number;
    option: Exclude<ComparisonOperator, ComparisonOperator.Between | ComparisonOperator.Outside | ComparisonOperator.Like | ComparisonOperator.Cosine>;
};

export type SearchFlagNumberRange = {
    from: number;
    to: number;
    option: ComparisonOperator.Between | ComparisonOperator.Outside;
};

export type SearchFlagNumberOrRange = SearchFlagNumber | SearchFlagNumberRange;
export type SearchFlagStringOrEmbedding = SearchFlagString | SearchFlagEmbedding;

export interface SearchFlags {
    id: SearchFlagNumberOrRange;
    name: SearchFlagString;
    desc: SearchFlagStringOrEmbedding;
    fileName: SearchFlagString;
    uploadDate: SearchFlagNumberOrRange;
}
