import { StructureDefinition } from 'fhir/r4';
import { organizeReviews, Review, ReviewResult, StructureDefinitionReviewer } from '..';
import SDFHIRVersionReviewer from './sd-fhir-version';

const NAME = 'Aggregate StructureDefinition Reviewer';

export default {
  name: NAME,

  review(a: StructureDefinition, b: StructureDefinition): Review[] {
    const reviews = [...SDFHIRVersionReviewer.review(a, b)];
    const organized = organizeReviews(reviews);
    let overallResult: ReviewResult;
    if (organized[ReviewResult.EQUIVALENT].length === reviews.length) {
      // If every result is equivalent then the overall result is equivalent
      overallResult = ReviewResult.EQUIVALENT;
    } else if (organized[ReviewResult.DISJOINT].length > 0) {
      // Else if at least one result is disjoint then the overall result is disjoint
      overallResult = ReviewResult.DISJOINT;
    } else if (organized[ReviewResult.UNKNOWN].length > 0) {
      // Else if at least one result is unknown then the overall result is unknown
      overallResult = ReviewResult.UNKNOWN;
    } else if (
      organized[ReviewResult.OVERLAPPING].length > 0 ||
      (organized[ReviewResult.SUBSET].length > 0 && organized[ReviewResult.SUPERSET].length > 0)
    ) {
      // Else if at least one result is overlapping, or there are both subset and superset results,
      // then the overall result is overlapping
      overallResult = ReviewResult.OVERLAPPING;
    } else if (organized[ReviewResult.SUBSET].length > 0) {
      // Else if at least one result is subset, the overall result is subset
      overallResult = ReviewResult.SUBSET;
    } else if (organized[ReviewResult.SUPERSET].length > 0) {
      // Else if at least one result is superset, the overall result is superset
      overallResult = ReviewResult.SUPERSET;
    } else {
      // Else I guess we don't know.  In theory we should never get here.
      overallResult = ReviewResult.UNKNOWN;
    }

    return [
      {
        reviewer: NAME,
        a: {
          id: a.id
        },
        b: {
          id: b.id
        },
        result: overallResult
      },
      ...reviews
    ];
  }
} as StructureDefinitionReviewer;
