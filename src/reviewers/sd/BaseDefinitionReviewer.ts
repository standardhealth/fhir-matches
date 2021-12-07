import { SDReviewer } from './SDReviewer';
import { StructureDefinition } from 'fhir/r4';
import { Review, ReviewResult } from '../Review';

export class BaseDefinitionReviewer implements SDReviewer {
  readonly name = 'Base Definition Reviewer';
  review(a: StructureDefinition, b: StructureDefinition): Review {
    const review = new Review(this.name, a.id, b.id);
    if (a.type !== b.type) {
      return review
        .withResult(ReviewResult.DISJOINT)
        .withMessage(`A and B do not have the same types (A: ${a.type}, B: ${b.type}).`);
    }

    return review.withResult(ReviewResult.EQUIVALENT);
  }
}
