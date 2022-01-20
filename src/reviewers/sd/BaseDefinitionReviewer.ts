import { SDReviewer } from './SDReviewer';
import { StructureDefinition } from 'fhir/r4';
import { Review, ReviewResult } from '../Review';

export class BaseDefinitionReviewer implements SDReviewer {
  readonly name = 'Base Definition Reviewer';
  review(a: StructureDefinition, b: StructureDefinition): Review {
    const review = new Review(this.name, a.id, b.id);
    if (a.type == null || b.type == null) {
      const transgressors: string[] = [];
      if (a.type == null) {
        transgressors.push('A');
      }
      if (b.type == null) {
        transgressors.push('B');
      }
      return review
        .withResult(ReviewResult.UNKNOWN)
        .withMessage(
          `${transgressors.join(' and ')} ${
            transgressors.length === 1 ? 'does' : 'do'
          } not declare a type. Type is a required element of StructureDefinition.`
        );
    }

    if (a.type !== b.type) {
      return review
        .withResult(ReviewResult.DISJOINT)
        .withMessage(`A and B do not have the same types (A: ${a.type}, B: ${b.type}).`);
    }

    return review.withResult(ReviewResult.EQUIVALENT);
  }
}
