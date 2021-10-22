import { StructureDefinition } from 'fhir/r4';
import { Review, ReviewResult } from '..';
import { SDReviewer } from './SDReviewer';

export class FHIRVersionReviewer implements SDReviewer {
  readonly name = 'FHIR Version Reviewer';

  review(a: StructureDefinition, b: StructureDefinition): Review {
    const review = new Review(this.name, a.id, b.id);
    if (a.fhirVersion == null || b.fhirVersion == null) {
      const transgressors: string[] = [];
      if (a.fhirVersion == null) {
        transgressors.push('A');
      }
      if (b.fhirVersion == null) {
        transgressors.push('B');
      }
      return review
        .withResult(ReviewResult.UNKNOWN)
        .withMessage(
          `${transgressors.join(' and ')} ${
            transgressors.length === 1 ? 'does' : 'do'
          } not declare a fhirVersion.`
        );
    }

    const [aPub, aMaj] = a.fhirVersion.split('.');
    const [bPub, bMaj] = b.fhirVersion.split('.');
    if (aPub !== bPub || aMaj !== bMaj) {
      return review
        .withResult(ReviewResult.DISJOINT)
        .withMessage(
          `A and B do not have compatible FHIR versions (A: ${a.fhirVersion}, B: ${b.fhirVersion}).`
        );
    }

    return review.withResult(ReviewResult.EQUIVALENT);
  }
}
