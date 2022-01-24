import { SDReviewer } from './SDReviewer';
import { getAggregateResult, Review, ReviewResult } from '..';
import { ElementDefinition, StructureDefinition } from 'fhir/r4';

const NAME = 'Cardinality Reviewer';

export class CardinalityReviewer implements SDReviewer {
  readonly name = NAME;
  review(a: StructureDefinition, b: StructureDefinition): Review {
    const reviews: Review[] = [];
    // For now, we only care about elements they BOTH have, so iterating on A's
    // elements should be sufficient. In the future, however, we need to account
    // for profiled sub-elements and consider if we want/need to treat extensions
    // and slices differently,
    //
    // TODO: Support profiled subelements once we have a way to look up and
    //       unfold definitions.
    // TODO: Consider special logic for extensions and slices.
    a.snapshot?.element?.forEach(aED => {
      const bED = b.snapshot?.element?.find(e => e.id === aED.id);
      if (bED == null) {
        return;
      }
      reviews.push(reviewElement(a, aED, b, bED));
    });
    const overallResult = getAggregateResult(reviews);
    return new Review(NAME, a.id, b.id, overallResult).withChildReviews(...reviews);
  }
}

function reviewElement(
  aSD: StructureDefinition,
  aED: ElementDefinition,
  bSD: StructureDefinition,
  bED: ElementDefinition
) {
  const review = new Review(NAME, { id: aSD.id, path: aED.id }, { id: bSD.id, path: bED.id });
  const [aMin, aMax, bMin, bMax] = [
    aED.min,
    convertMaxToNumber(aED.max),
    bED.min,
    convertMaxToNumber(bED.max)
  ];
  if ([aMin, aMax, bMin, bMax].some(x => x == null || Number.isNaN(x))) {
    review.result = ReviewResult.UNKNOWN;
    review.withMessage(
      'Cannot determine cardinality compatibility because at least one cardinality value is missing or invalid ' +
        `(A: ${aED.min}..${aED.max}, B: ${bED.min}..${bED.max}).`
    );
  } else if (aMin === bMin && aMax === bMax) {
    review.result = ReviewResult.EQUIVALENT;
  } else if (aMin >= bMin && aMax <= bMax) {
    review.result = ReviewResult.SUBSET;
  } else if (aMin <= bMin && aMax >= bMax) {
    review.result = ReviewResult.SUPERSET;
  } else if ((bMin <= aMin && aMin <= bMax) || (bMin <= aMax && aMax <= bMax)) {
    review.result = ReviewResult.OVERLAPPING;
  } else {
    review.result = ReviewResult.DISJOINT;
    review.withMessage(
      `Cardinalities are not compatible (A: ${aED.min}..${aED.max}, B: ${bED.min}..${bED.max}).`
    );
  }
  return review;
}

function convertMaxToNumber(max: string) {
  if (max === '*') {
    return Number.MAX_SAFE_INTEGER;
  }
  return parseInt(max);
}
