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

export function getAggregateResult(reviews: Review[]) {
  const organized = organizeReviews(reviews);
  if (organized[ReviewResult.EQUIVALENT].length === reviews.length) {
    // If every result is equivalent then the overall result is equivalent
    return ReviewResult.EQUIVALENT;
  } else if (organized[ReviewResult.DISJOINT].length > 0) {
    // Else if at least one result is disjoint then the overall result is disjoint
    return ReviewResult.DISJOINT;
  } else if (organized[ReviewResult.UNKNOWN].length > 0) {
    // Else if at least one result is unknown then the overall result is unknown
    return ReviewResult.UNKNOWN;
  } else if (
    organized[ReviewResult.OVERLAPPING].length > 0 ||
    (organized[ReviewResult.SUBSET].length > 0 && organized[ReviewResult.SUPERSET].length > 0)
  ) {
    // Else if at least one result is overlapping, or there are both subset and superset results,
    // then the overall result is overlapping
    return ReviewResult.OVERLAPPING;
  } else if (organized[ReviewResult.SUBSET].length > 0) {
    // Else if at least one result is subset, the overall result is subset
    return ReviewResult.SUBSET;
  } else if (organized[ReviewResult.SUPERSET].length > 0) {
    // Else if at least one result is superset, the overall result is superset
    return ReviewResult.SUPERSET;
  } else {
    // Else I guess we don't know.  In theory we should never get here.
    return ReviewResult.UNKNOWN;
  }
}

export function compareNumericRanges(
  aMin: number,
  aMax: number,
  bMin: number,
  bMax: number
): ReviewResult {
  if ([aMin, aMax, bMin, bMax].some(x => x == null || Number.isNaN(x))) {
    return ReviewResult.UNKNOWN;
  } else if (aMin === bMin && aMax === bMax) {
    return ReviewResult.EQUIVALENT;
  } else if (aMin >= bMin && aMax <= bMax) {
    return ReviewResult.SUBSET;
  } else if (aMin <= bMin && aMax >= bMax) {
    return ReviewResult.SUPERSET;
  } else if ((bMin <= aMin && aMin <= bMax) || (bMin <= aMax && aMax <= bMax)) {
    return ReviewResult.OVERLAPPING;
  } else {
    return ReviewResult.DISJOINT;
  }
}
