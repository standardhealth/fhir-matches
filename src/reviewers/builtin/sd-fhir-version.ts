import { StructureDefinition } from 'fhir/r4';
import { Review, ReviewResult, StructureDefinitionReviewer } from '..';

const NAME = 'FHIR Version Reviewer';

export default {
  name: NAME,

  review(a: StructureDefinition, b: StructureDefinition): Review[] {
    const baseResult = {
      reviewer: NAME,
      a: { id: a.id },
      b: { id: b.id }
    };
    if (a.fhirVersion == null || b.fhirVersion == null) {
      const transgressors: string[] = [];
      if (a.fhirVersion == null) {
        transgressors.push('A');
      }
      if (b.fhirVersion == null) {
        transgressors.push('B');
      }
      return [
        {
          ...baseResult,
          result: ReviewResult.UNKNOWN,
          details: `${transgressors.join(' and ')} ${
            transgressors.length === 1 ? 'does' : 'do'
          } not declare a fhirVersion.`
        }
      ];
    }

    const [aPub, aMaj] = a.fhirVersion.split('.');
    const [bPub, bMaj] = b.fhirVersion.split('.');
    if (aPub !== bPub || aMaj !== bMaj) {
      return [
        {
          ...baseResult,
          result: ReviewResult.DISJOINT,
          details: `A and B do not have compatible FHIR versions (A: ${a.fhirVersion}, B: ${b.fhirVersion}).`
        }
      ];
    }

    return [
      {
        ...baseResult,
        result: ReviewResult.EQUIVALENT
      }
    ];
  }
} as StructureDefinitionReviewer;
