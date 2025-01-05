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
