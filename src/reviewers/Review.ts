export type Item = {
  id: string;
  path?: string;
};

export enum ReviewResult {
  EQUIVALENT = 'equivalent',
  SUBSET = 'subset',
  SUPERSET = 'superset',
  OVERLAPPING = 'overlapping',
  DISJOINT = 'disjoint',
  UNKNOWN = 'unknown'
}

export interface Review {
  reviewer: string;
  a: Item;
  b: Item;
  result: ReviewResult;
  details?: string;
}
