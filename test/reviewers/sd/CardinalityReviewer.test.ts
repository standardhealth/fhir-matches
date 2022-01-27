import path from 'path';
import fs from 'fs-extra';
import { StructureDefinition } from 'fhir/r4';
import { CardinalityReviewer } from '../../../src/reviewers/sd';
import { organizeReviews, ReviewResult } from '../../../src/reviewers';
import { getElement, getReview } from '../../testhelpers';

describe('CardinalityReviewer', () => {
  let reviewer: CardinalityReviewer;
  let a: StructureDefinition;
  let b: StructureDefinition;
  beforeEach(() => {
    reviewer = new CardinalityReviewer();
    a = fs.readJSONSync(
      path.join(__dirname, 'fixtures', 'StructureDefinition-simple-patient-a.json')
    );
    b = fs.readJSONSync(
      path.join(__dirname, 'fixtures', 'StructureDefinition-simple-patient-b.json')
    );
  });

  const expectResult = (
    aMin: number,
    aMax: string,
    bMin: number,
    bMax: string,
    result: ReviewResult
  ) => {
    const aED = getElement(a, 'identifier');
    aED.min = aMin;
    aED.max = aMax;
    const bED = getElement(b, 'identifier');
    bED.min = bMin;
    bED.max = bMax;
    const review = reviewer.review(a, b);
    expect(review.result).toBe(result);
    const child = getReview(review.details.childReviews, a.id, 'Patient.identifier');
    expect(child.result).toBe(result);
    if (child.result === ReviewResult.DISJOINT) {
      expect(child.details.message).toEqual(
        `Cardinalities are not compatible (A: ${aMin}..${aMax}, B: ${bMin}..${bMax}).`
      );
    } else if (child.result === ReviewResult.UNKNOWN) {
      expect(child.details.message).toEqual(
        'Cannot determine cardinality compatibility because at least one cardinality value is missing or invalid ' +
          `(A: ${aMin}..${aMax}, B: ${bMin}..${bMax}).`
      );
    } else {
      expect(child.details).toBeUndefined();
    }
  };

  it('should have the correct name', () => {
    expect(reviewer.name).toBe('Cardinality Reviewer');
  });

  it('should populate the result with the correct reviewer and ids', () => {
    const review = reviewer.review(a, b);
    expect(review.reviewer).toBe('Cardinality Reviewer');
    expect(review.a).toEqual({ id: 'simple-patient-a' });
    expect(review.b).toEqual({ id: 'simple-patient-b' });
  });

  it('should populate the result with child reviews for each element', () => {
    const review = reviewer.review(a, b);
    expect(review.details.childReviews).toHaveLength(45);
    review.details.childReviews.forEach(child => {
      expect(child.reviewer).toEqual('Cardinality Reviewer');
      expect(child.a.id).toEqual('simple-patient-a');
      expect(child.a.path).toBeDefined();
      expect(child.b.id).toEqual('simple-patient-b');
      expect(child.b.path).toBeDefined();
      expect(child.result).toBeDefined();
      expect(child.details).toBeUndefined();
    });
  });

  it('should assess two profiles w/ the same elements and cardinalities as equivalent', () => {
    const review = reviewer.review(a, b);
    expect(review.result).toBe(ReviewResult.EQUIVALENT);
    expect(review.details.message).toBeUndefined();
    const organized = organizeReviews(review.details.childReviews);
    expect(organized.EQUIVALENT).toHaveLength(45);
    expect(organized.SUBSET).toHaveLength(0);
    expect(organized.SUPERSET).toHaveLength(0);
    expect(organized.OVERLAPPING).toHaveLength(0);
    expect(organized.DISJOINT).toHaveLength(0);
    expect(organized.UNKNOWN).toHaveLength(0);
  });

  it('should assess elements with missing cardinality as unknown', () => {
    expectResult(null, '*', 0, '*', ReviewResult.UNKNOWN);
    expectResult(0, null, 0, '*', ReviewResult.UNKNOWN);
    expectResult(0, '*', null, '*', ReviewResult.UNKNOWN);
    expectResult(0, '*', 0, null, ReviewResult.UNKNOWN);
    expectResult(null, null, null, null, ReviewResult.UNKNOWN);
    expectResult(undefined, '*', 0, '*', ReviewResult.UNKNOWN);
    expectResult(0, undefined, 0, '*', ReviewResult.UNKNOWN);
    expectResult(0, '*', undefined, '*', ReviewResult.UNKNOWN);
    expectResult(0, '*', 0, undefined, ReviewResult.UNKNOWN);
    expectResult(undefined, undefined, undefined, undefined, ReviewResult.UNKNOWN);
  });

  describe('when A cardinality is 0..*', () => {
    it('should assess as equivalent to B cardinality 0..*', () => {
      expectResult(0, '*', 0, '*', ReviewResult.EQUIVALENT);
    });

    it('should assess as superset of B cardinality 0..1', () => {
      expectResult(0, '*', 0, '1', ReviewResult.SUPERSET);
    });

    it('should assess as superset of B cardinality 0..0', () => {
      expectResult(0, '*', 0, '0', ReviewResult.SUPERSET);
    });

    it('should assess as superset of B cardinality 1..*', () => {
      expectResult(0, '*', 1, '*', ReviewResult.SUPERSET);
    });

    it('should assess as superset of B cardinality 1..1', () => {
      expectResult(0, '*', 1, '1', ReviewResult.SUPERSET);
    });

    it('should assess as superset of B cardinality 1..1', () => {
      expectResult(0, '*', 2, '3', ReviewResult.SUPERSET);
    });
  });

  describe('when A cardinality is 0..1', () => {
    it('should assess as equivalent to B cardinality 0..*', () => {
      expectResult(0, '1', 0, '*', ReviewResult.SUBSET);
    });

    it('should assess as superset of B cardinality 0..1', () => {
      expectResult(0, '1', 0, '1', ReviewResult.EQUIVALENT);
    });

    it('should assess as superset of B cardinality 0..0', () => {
      expectResult(0, '1', 0, '0', ReviewResult.SUPERSET);
    });

    it('should assess as superset of B cardinality 1..*', () => {
      expectResult(0, '1', 1, '*', ReviewResult.OVERLAPPING);
    });

    it('should assess as superset of B cardinality 1..1', () => {
      expectResult(0, '1', 1, '1', ReviewResult.SUPERSET);
    });

    it('should assess as superset of B cardinality 1..1', () => {
      expectResult(0, '1', 2, '3', ReviewResult.DISJOINT);
    });
  });

  describe('when A cardinality is 0..0', () => {
    it('should assess as equivalent to B cardinality 0..*', () => {
      expectResult(0, '0', 0, '*', ReviewResult.SUBSET);
    });

    it('should assess as superset of B cardinality 0..1', () => {
      expectResult(0, '0', 0, '1', ReviewResult.SUBSET);
    });

    it('should assess as superset of B cardinality 0..0', () => {
      expectResult(0, '0', 0, '0', ReviewResult.EQUIVALENT);
    });

    it('should assess as superset of B cardinality 1..*', () => {
      expectResult(0, '0', 1, '*', ReviewResult.DISJOINT);
    });

    it('should assess as superset of B cardinality 1..1', () => {
      expectResult(0, '0', 1, '1', ReviewResult.DISJOINT);
    });

    it('should assess as superset of B cardinality 1..1', () => {
      expectResult(0, '0', 2, '3', ReviewResult.DISJOINT);
    });
  });

  describe('when A cardinality is 1..*', () => {
    it('should assess as equivalent to B cardinality 0..*', () => {
      expectResult(1, '*', 0, '*', ReviewResult.SUBSET);
    });

    it('should assess as superset of B cardinality 0..1', () => {
      expectResult(1, '*', 0, '1', ReviewResult.OVERLAPPING);
    });

    it('should assess as superset of B cardinality 0..0', () => {
      expectResult(1, '*', 0, '0', ReviewResult.DISJOINT);
    });

    it('should assess as superset of B cardinality 1..*', () => {
      expectResult(1, '*', 1, '*', ReviewResult.EQUIVALENT);
    });

    it('should assess as superset of B cardinality 1..1', () => {
      expectResult(1, '*', 1, '1', ReviewResult.SUPERSET);
    });

    it('should assess as superset of B cardinality 1..1', () => {
      expectResult(1, '*', 2, '3', ReviewResult.SUPERSET);
    });
  });

  describe('when A cardinality is 1..1', () => {
    it('should assess as equivalent to B cardinality 0..*', () => {
      expectResult(1, '1', 0, '*', ReviewResult.SUBSET);
    });

    it('should assess as superset of B cardinality 0..1', () => {
      expectResult(1, '1', 0, '1', ReviewResult.SUBSET);
    });

    it('should assess as superset of B cardinality 0..0', () => {
      expectResult(1, '1', 0, '0', ReviewResult.DISJOINT);
    });

    it('should assess as superset of B cardinality 1..*', () => {
      expectResult(1, '1', 1, '*', ReviewResult.SUBSET);
    });

    it('should assess as superset of B cardinality 1..1', () => {
      expectResult(1, '1', 1, '1', ReviewResult.EQUIVALENT);
    });

    it('should assess as superset of B cardinality 1..1', () => {
      expectResult(1, '1', 2, '3', ReviewResult.DISJOINT);
    });
  });

  describe('when A cardinality is 2..3', () => {
    it('should assess as equivalent to B cardinality 0..*', () => {
      expectResult(2, '3', 0, '*', ReviewResult.SUBSET);
    });

    it('should assess as superset of B cardinality 0..1', () => {
      expectResult(2, '3', 0, '1', ReviewResult.DISJOINT);
    });

    it('should assess as superset of B cardinality 0..0', () => {
      expectResult(2, '3', 0, '0', ReviewResult.DISJOINT);
    });

    it('should assess as superset of B cardinality 1..*', () => {
      expectResult(2, '3', 1, '*', ReviewResult.SUBSET);
    });

    it('should assess as superset of B cardinality 1..1', () => {
      expectResult(2, '3', 1, '1', ReviewResult.DISJOINT);
    });

    it('should assess as superset of B cardinality 1..1', () => {
      expectResult(2, '3', 2, '3', ReviewResult.EQUIVALENT);
    });
  });
});
