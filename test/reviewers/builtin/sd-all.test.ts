import path from 'path';
import fs from 'fs-extra';
import { StructureDefinition } from 'fhir/r4';
import AggregateSDReviewer from '../../../src/reviewers/builtin/sd-all';
import SDFHIRVersionReviewer from '../../../src/reviewers/builtin/sd-fhir-version';
import { ReviewResult } from '../../../src/reviewers';

describe('sd-all', () => {
  let a: StructureDefinition;
  let b: StructureDefinition;
  const versionReviewSpy = jest.spyOn(SDFHIRVersionReviewer, 'review');

  beforeEach(() => {
    a = fs.readJSONSync(
      path.join(__dirname, 'fixtures', 'StructureDefinition-simple-patient-a.json')
    );
    b = fs.readJSONSync(
      path.join(__dirname, 'fixtures', 'StructureDefinition-simple-patient-b.json')
    );
  });

  afterEach(() => versionReviewSpy.mockReset());

  it('should have the correct name', () => {
    expect(AggregateSDReviewer.name).toBe('Aggregate StructureDefinition Reviewer');
  });

  it('should run all the reviewers', () => {
    versionReviewSpy.mockReturnValue(
      [ReviewResult.EQUIVALENT].map(result => {
        return {
          reviewer: 'FHIR Version Reviewer',
          a: { id: 'simple-patient-a' },
          b: { id: 'simple-patient-b' },
          result
        };
      })
    );
    const results = AggregateSDReviewer.review(a, b);
    expect(results).toEqual([
      {
        reviewer: 'Aggregate StructureDefinition Reviewer',
        a: { id: 'simple-patient-a' },
        b: { id: 'simple-patient-b' },
        result: ReviewResult.EQUIVALENT
      },
      {
        reviewer: 'FHIR Version Reviewer',
        a: { id: 'simple-patient-a' },
        b: { id: 'simple-patient-b' },
        result: ReviewResult.EQUIVALENT
      }
    ]);
  });

  it('should report equivalent when all reviewers report equivalent', () => {
    versionReviewSpy.mockReturnValue(
      [ReviewResult.EQUIVALENT, ReviewResult.EQUIVALENT].map(result => {
        return {
          reviewer: 'FHIR Version Reviewer',
          a: { id: 'simple-patient-a' },
          b: { id: 'simple-patient-b' },
          result
        };
      })
    );
    const results = AggregateSDReviewer.review(a, b);
    expect(results).toHaveLength(3);
    expect(results[0]).toEqual({
      reviewer: 'Aggregate StructureDefinition Reviewer',
      a: { id: 'simple-patient-a' },
      b: { id: 'simple-patient-b' },
      result: ReviewResult.EQUIVALENT
    });
  });

  it('should report subset when all reviewers report subset', () => {
    versionReviewSpy.mockReturnValue(
      [ReviewResult.SUBSET, ReviewResult.SUBSET].map(result => {
        return {
          reviewer: 'FHIR Version Reviewer',
          a: { id: 'simple-patient-a' },
          b: { id: 'simple-patient-b' },
          result
        };
      })
    );
    const results = AggregateSDReviewer.review(a, b);
    expect(results).toHaveLength(3);
    expect(results[0]).toEqual({
      reviewer: 'Aggregate StructureDefinition Reviewer',
      a: { id: 'simple-patient-a' },
      b: { id: 'simple-patient-b' },
      result: ReviewResult.SUBSET
    });
  });

  it('should report subset when reviewers report subset and equivalent', () => {
    versionReviewSpy.mockReturnValue(
      [ReviewResult.SUBSET, ReviewResult.EQUIVALENT].map(result => {
        return {
          reviewer: 'FHIR Version Reviewer',
          a: { id: 'simple-patient-a' },
          b: { id: 'simple-patient-b' },
          result
        };
      })
    );
    const results = AggregateSDReviewer.review(a, b);
    expect(results).toHaveLength(3);
    expect(results[0]).toEqual({
      reviewer: 'Aggregate StructureDefinition Reviewer',
      a: { id: 'simple-patient-a' },
      b: { id: 'simple-patient-b' },
      result: ReviewResult.SUBSET
    });
  });

  it('should report superset when all reviewers report superset', () => {
    versionReviewSpy.mockReturnValue(
      [ReviewResult.SUPERSET, ReviewResult.SUPERSET].map(result => {
        return {
          reviewer: 'FHIR Version Reviewer',
          a: { id: 'simple-patient-a' },
          b: { id: 'simple-patient-b' },
          result
        };
      })
    );
    const results = AggregateSDReviewer.review(a, b);
    expect(results).toHaveLength(3);
    expect(results[0]).toEqual({
      reviewer: 'Aggregate StructureDefinition Reviewer',
      a: { id: 'simple-patient-a' },
      b: { id: 'simple-patient-b' },
      result: ReviewResult.SUPERSET
    });
  });

  it('should report superset when reviewers report superset and equivalent', () => {
    versionReviewSpy.mockReturnValue(
      [ReviewResult.SUPERSET, ReviewResult.EQUIVALENT].map(result => {
        return {
          reviewer: 'FHIR Version Reviewer',
          a: { id: 'simple-patient-a' },
          b: { id: 'simple-patient-b' },
          result
        };
      })
    );
    const results = AggregateSDReviewer.review(a, b);
    expect(results).toHaveLength(3);
    expect(results[0]).toEqual({
      reviewer: 'Aggregate StructureDefinition Reviewer',
      a: { id: 'simple-patient-a' },
      b: { id: 'simple-patient-b' },
      result: ReviewResult.SUPERSET
    });
  });

  it('should report overlapping when all reviewers report overlapping', () => {
    versionReviewSpy.mockReturnValue(
      [ReviewResult.OVERLAPPING, ReviewResult.OVERLAPPING].map(result => {
        return {
          reviewer: 'FHIR Version Reviewer',
          a: { id: 'simple-patient-a' },
          b: { id: 'simple-patient-b' },
          result
        };
      })
    );
    const results = AggregateSDReviewer.review(a, b);
    expect(results).toHaveLength(3);
    expect(results[0]).toEqual({
      reviewer: 'Aggregate StructureDefinition Reviewer',
      a: { id: 'simple-patient-a' },
      b: { id: 'simple-patient-b' },
      result: ReviewResult.OVERLAPPING
    });
  });

  it('should report overlapping when reviewers report overlapping and equivalent', () => {
    versionReviewSpy.mockReturnValue(
      [ReviewResult.OVERLAPPING, ReviewResult.EQUIVALENT].map(result => {
        return {
          reviewer: 'FHIR Version Reviewer',
          a: { id: 'simple-patient-a' },
          b: { id: 'simple-patient-b' },
          result
        };
      })
    );
    const results = AggregateSDReviewer.review(a, b);
    expect(results).toHaveLength(3);
    expect(results[0]).toEqual({
      reviewer: 'Aggregate StructureDefinition Reviewer',
      a: { id: 'simple-patient-a' },
      b: { id: 'simple-patient-b' },
      result: ReviewResult.OVERLAPPING
    });
  });

  it('should report overlapping when reviewers report overlapping and subset', () => {
    versionReviewSpy.mockReturnValue(
      [ReviewResult.OVERLAPPING, ReviewResult.SUBSET].map(result => {
        return {
          reviewer: 'FHIR Version Reviewer',
          a: { id: 'simple-patient-a' },
          b: { id: 'simple-patient-b' },
          result
        };
      })
    );
    const results = AggregateSDReviewer.review(a, b);
    expect(results).toHaveLength(3);
    expect(results[0]).toEqual({
      reviewer: 'Aggregate StructureDefinition Reviewer',
      a: { id: 'simple-patient-a' },
      b: { id: 'simple-patient-b' },
      result: ReviewResult.OVERLAPPING
    });
  });

  it('should report overlapping when reviewers report overlapping and superset', () => {
    versionReviewSpy.mockReturnValue(
      [ReviewResult.OVERLAPPING, ReviewResult.SUPERSET].map(result => {
        return {
          reviewer: 'FHIR Version Reviewer',
          a: { id: 'simple-patient-a' },
          b: { id: 'simple-patient-b' },
          result
        };
      })
    );
    const results = AggregateSDReviewer.review(a, b);
    expect(results).toHaveLength(3);
    expect(results[0]).toEqual({
      reviewer: 'Aggregate StructureDefinition Reviewer',
      a: { id: 'simple-patient-a' },
      b: { id: 'simple-patient-b' },
      result: ReviewResult.OVERLAPPING
    });
  });

  it('should report overlapping when reviewers report subset and superset', () => {
    versionReviewSpy.mockReturnValue(
      [ReviewResult.SUBSET, ReviewResult.SUPERSET].map(result => {
        return {
          reviewer: 'FHIR Version Reviewer',
          a: { id: 'simple-patient-a' },
          b: { id: 'simple-patient-b' },
          result
        };
      })
    );
    const results = AggregateSDReviewer.review(a, b);
    expect(results).toHaveLength(3);
    expect(results[0]).toEqual({
      reviewer: 'Aggregate StructureDefinition Reviewer',
      a: { id: 'simple-patient-a' },
      b: { id: 'simple-patient-b' },
      result: ReviewResult.OVERLAPPING
    });
  });

  it('should report disjoint when all reviewers report disjoint', () => {
    versionReviewSpy.mockReturnValue(
      [ReviewResult.DISJOINT, ReviewResult.DISJOINT].map(result => {
        return {
          reviewer: 'FHIR Version Reviewer',
          a: { id: 'simple-patient-a' },
          b: { id: 'simple-patient-b' },
          result
        };
      })
    );
    const results = AggregateSDReviewer.review(a, b);
    expect(results).toHaveLength(3);
    expect(results[0]).toEqual({
      reviewer: 'Aggregate StructureDefinition Reviewer',
      a: { id: 'simple-patient-a' },
      b: { id: 'simple-patient-b' },
      result: ReviewResult.DISJOINT
    });
  });

  it('should report disjoint when one reviewer reports disjoint', () => {
    versionReviewSpy.mockReturnValue(
      [
        ReviewResult.EQUIVALENT,
        ReviewResult.DISJOINT,
        ReviewResult.SUBSET,
        ReviewResult.SUPERSET,
        ReviewResult.OVERLAPPING,
        ReviewResult.UNKNOWN
      ].map(result => {
        return {
          reviewer: 'FHIR Version Reviewer',
          a: { id: 'simple-patient-a' },
          b: { id: 'simple-patient-b' },
          result
        };
      })
    );
    const results = AggregateSDReviewer.review(a, b);
    expect(results).toHaveLength(7);
    expect(results[0]).toEqual({
      reviewer: 'Aggregate StructureDefinition Reviewer',
      a: { id: 'simple-patient-a' },
      b: { id: 'simple-patient-b' },
      result: ReviewResult.DISJOINT
    });
  });

  it('should report unknown when all reviewers report unknown', () => {
    versionReviewSpy.mockReturnValue(
      [ReviewResult.UNKNOWN, ReviewResult.UNKNOWN].map(result => {
        return {
          reviewer: 'FHIR Version Reviewer',
          a: { id: 'simple-patient-a' },
          b: { id: 'simple-patient-b' },
          result
        };
      })
    );
    const results = AggregateSDReviewer.review(a, b);
    expect(results).toHaveLength(3);
    expect(results[0]).toEqual({
      reviewer: 'Aggregate StructureDefinition Reviewer',
      a: { id: 'simple-patient-a' },
      b: { id: 'simple-patient-b' },
      result: ReviewResult.UNKNOWN
    });
  });

  it('should report unknown when one reviewer reports unknown (with no disjoints)', () => {
    versionReviewSpy.mockReturnValue(
      [
        ReviewResult.EQUIVALENT,
        ReviewResult.SUBSET,
        ReviewResult.SUPERSET,
        ReviewResult.OVERLAPPING,
        ReviewResult.UNKNOWN
      ].map(result => {
        return {
          reviewer: 'FHIR Version Reviewer',
          a: { id: 'simple-patient-a' },
          b: { id: 'simple-patient-b' },
          result
        };
      })
    );
    const results = AggregateSDReviewer.review(a, b);
    expect(results).toHaveLength(6);
    expect(results[0]).toEqual({
      reviewer: 'Aggregate StructureDefinition Reviewer',
      a: { id: 'simple-patient-a' },
      b: { id: 'simple-patient-b' },
      result: ReviewResult.UNKNOWN
    });
  });
});
