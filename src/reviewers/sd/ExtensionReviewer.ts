import { SDReviewer } from './SDReviewer';
import { StructureDefinition, ElementDefinition } from 'fhir/r4';
import { Review, ReviewResult } from '../Review';
import { getAggregateResult } from '../review-utils';

const NAME = 'Extension Reviewer';

export class ExtensionReviewer implements SDReviewer {
  readonly name = NAME;
  review(a: StructureDefinition, b: StructureDefinition): Review {
    const reviews: Review[] = [];
    // keep track of what profiles have already been checked at a given path
    const reviewedProfiles: Map<string, string[]> = new Map();
    // check extension elements on A that may also exist on B
    a.snapshot?.element
      ?.filter(ed => {
        // we are ignoring complex extensions, so "extension" or "modifierExtension" should appear
        // only at the end of the path.
        // for this reviewer, there must be a profile on the extension element's type.
        return (
          (ed.path.endsWith('.extension') || ed.path.endsWith('.modifierExtension')) &&
          !/modifierExtension\.|extension\./.test(ed.path) &&
          ed.type?.[0].profile?.length > 0
        );
      })
      .forEach(aED => {
        // see if there is a matching path in B
        const bElements = b.snapshot?.element?.filter(ed => ed.path === aED.path);
        if (bElements.length === 0) {
          // if there are no extensions at this path on B, this element represents a SUBSET
          reviews.push(
            new Review(NAME, { id: a.id, path: aED.id }, { id: b.id }, ReviewResult.SUBSET)
          );
        } else {
          // check for the presence of each of the profiles on A's extension element.
          aED.type[0].profile.forEach(aProfile => {
            // if we've already checked this profile at this path, we don't need to check it again
            // this can happen if multiple slices of the same element allow the same profile.
            if (!reviewedProfiles.get(aED.path)?.includes(aProfile)) {
              const bSameProfile = bElements.filter(bED =>
                bED.type?.[0].profile?.includes(aProfile)
              );
              if (bSameProfile.length > 0) {
                // to get the aggregate cardinality, find all elements at this path on A that have this profile.
                const aSameProfile = a.snapshot.element.filter(
                  anotherA =>
                    anotherA.path === aED.path && anotherA.type?.[0].profile?.includes(aProfile)
                );
                const aMin = calculateAggregateMin(aSameProfile);
                const aMax = calculateAggregateMax(aSameProfile);
                const bMin = calculateAggregateMin(bSameProfile);
                const bMax = calculateAggregateMax(bSameProfile);
                // hello cardinality reviewer, how are you doing
                let aggregateResult: ReviewResult;
                let aggregateMessage: string;
                if ([aMin, aMax, bMin, bMax].some(x => x == null || Number.isNaN(x))) {
                  aggregateResult = ReviewResult.UNKNOWN;
                  aggregateMessage =
                    "Cannot determine extension compatibility because at least one extension element of this element's type has missing or invalid cardinality.";
                } else if (aMin === bMin && aMax === bMax) {
                  aggregateResult = ReviewResult.EQUIVALENT;
                } else if (aMin >= bMin && aMax <= bMax) {
                  aggregateResult = ReviewResult.SUBSET;
                } else if (aMin <= bMin && aMax >= bMax) {
                  aggregateResult = ReviewResult.SUPERSET;
                } else if ((bMin <= aMin && aMin <= bMax) || (bMin <= aMax && aMax <= bMax)) {
                  aggregateResult = ReviewResult.OVERLAPPING;
                } else {
                  aggregateResult = ReviewResult.DISJOINT;
                }
                const pathTypeReviews: Review[] = [];
                aSameProfile.forEach(anotherA => {
                  bSameProfile.forEach(anotherB => {
                    pathTypeReviews.push(
                      new Review(
                        NAME,
                        { id: a.id, path: anotherA.id },
                        { id: b.id, path: anotherB.id },
                        aggregateResult,
                        aggregateMessage
                      )
                    );
                  });
                });
                const mainReview = new Review(
                  NAME,
                  { id: a.id, path: aED.id },
                  { id: b.id, path: aED.path },
                  aggregateResult
                )
                  .withChildReviews(...pathTypeReviews)
                  .withMessage(`Extension profile: ${aProfile}`);
                reviews.push(mainReview);
              } else {
                // no extensions on B have the same profile, so this element represents a SUBSET
                reviews.push(
                  new Review(
                    NAME,
                    { id: a.id, path: aED.id },
                    { id: b.id },
                    ReviewResult.SUBSET
                  ).withMessage(`Extension profile: ${aProfile}`)
                );
              }
              // update the map of which profiles have been checked
              if (!reviewedProfiles.has(aED.path)) {
                reviewedProfiles.set(aED.path, []);
              }
              reviewedProfiles.get(aED.path).push(aProfile);
            }
          });
        }
      });
    // check B for extension elements that do not exist on A
    b.snapshot?.element
      ?.filter(ed => {
        // we are ignoring complex extensions, so "extension" or "modifierExtension" should appear
        // only at the end of the path.
        // for this reviewer, there must be a profile on the extension element's type.
        return (
          (ed.path.endsWith('.extension') || ed.path.endsWith('.modifierExtension')) &&
          !/modifierExtension\.|extension\./.test(ed.path) &&
          ed.type?.[0].profile?.length > 0
        );
      })
      .forEach(bED => {
        // the only case we are checking here is the SUPERSET case, where there is no corresponding element on A with a matching profile
        const aElements = a.snapshot?.element?.filter(ed => ed.path === bED.path);
        if (aElements.length === 0) {
          reviews.push(
            new Review(NAME, { id: a.id }, { id: b.id, path: bED.id }, ReviewResult.SUPERSET)
          );
        } else {
          // check each of B's profiles
          bED.type[0].profile.forEach(bProfile => {
            // the only case we need to check here is when there are none, so a some() operation is fine
            const aSameProfileExists = aElements.some(aED =>
              aED.type?.[0].profile?.includes(bProfile)
            );
            if (!aSameProfileExists) {
              reviews.push(
                new Review(
                  NAME,
                  { id: a.id },
                  { id: b.id, path: bED.id },
                  ReviewResult.SUPERSET
                ).withMessage(`Extension profile: ${bProfile}`)
              );
            }
          });
        }
      });
    const overallResult = getAggregateResult(reviews);
    return new Review(NAME, a.id, b.id, overallResult).withChildReviews(...reviews);
  }
}

function calculateAggregateMin(elements: ElementDefinition[]): number {
  return elements
    .map(ed => ed.min)
    .reduce((sum, current) => {
      if (sum == null || current == null) {
        return null;
      } else {
        return sum + current;
      }
    }, 0);
}

function calculateAggregateMax(elements: ElementDefinition[]): number {
  return elements
    .map(ed => ed.max)
    .reduce((sum, current) => {
      if (sum == null || current == null) {
        return null;
      } else if (sum === Number.MAX_SAFE_INTEGER || current === '*') {
        return Number.MAX_SAFE_INTEGER;
      } else {
        return sum + parseInt(current);
      }
    }, 0);
}
