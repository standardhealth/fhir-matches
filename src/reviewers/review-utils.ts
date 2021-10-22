import { Review, ReviewResult } from '.';

export function organizeReviews(reviews: Review[]) {
  const result = {
    [ReviewResult.EQUIVALENT]: [] as Review[],
    [ReviewResult.SUBSET]: [] as Review[],
    [ReviewResult.SUPERSET]: [] as Review[],
    [ReviewResult.OVERLAPPING]: [] as Review[],
    [ReviewResult.DISJOINT]: [] as Review[],
    [ReviewResult.UNKNOWN]: [] as Review[]
  };
  reviews?.forEach(r => result[r.result].push(r));
  return result;
}
