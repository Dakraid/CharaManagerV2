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
    Unlike = 'Unlike',
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
    [ComparisonOperator.Unlike]: '!~=',
    [ComparisonOperator.Cosine]: 'cos',
};

export type SearchFlagString = {
    query: string;
    option: ComparisonOperator.Equal | ComparisonOperator.NotEqual | ComparisonOperator.Like | ComparisonOperator.Unlike;
};

export type SearchFlagEmbedding = {
    query: string;
    threshold?: number;
    option: ComparisonOperator.Equal | ComparisonOperator.NotEqual | ComparisonOperator.Like | ComparisonOperator.Unlike | ComparisonOperator.Cosine;
};

export type SearchFlagNumber = {
    from: number;
    to?: number;
    option: Exclude<ComparisonOperator, ComparisonOperator.Like | ComparisonOperator.Unlike | ComparisonOperator.Cosine>;
};

export interface SearchFlags {
    id: SearchFlagNumber;
    name: SearchFlagString;
    desc: SearchFlagEmbedding;
    fileName: SearchFlagString;
    uploadDate: SearchFlagNumber;
}
