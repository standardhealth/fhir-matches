import fs from 'fs-extra';
import path from 'path';
import { BaseDefinitionReviewer } from '../../../src/reviewers/sd';
import { StructureDefinition } from 'fhir/r4';
import { Review, ReviewResult } from '../../../src/reviewers';

describe('BaseDefinitionReviewer', () => {
  let reviewer: BaseDefinitionReviewer;
  let stubReview: Review;
  let a: StructureDefinition;
  let b: StructureDefinition;

  beforeEach(() => {
    reviewer = new BaseDefinitionReviewer();
    stubReview = new Review('Base Definition Reviewer', 'simple-patient-a', 'simple-patient-b');
    a = fs.readJSONSync(
      path.join(__dirname, 'fixtures', 'StructureDefinition-simple-patient-a.json')
    );
    b = fs.readJSONSync(
      path.join(__dirname, 'fixtures', 'StructureDefinition-simple-patient-b.json')
    );
  });

  it('should have the correct name', () => {
    expect(reviewer.name).toBe('Base Definition Reviewer');
  });

  it('should assess two profiles with the same type as equivalent', () => {
    const result = reviewer.review(a, b);
    expect(result).toEqual(stubReview.withResult(ReviewResult.EQUIVALENT));
  });

  it('should assess two profiles with different types as disjoint', () => {
    b.type = 'Observation';

    const result = reviewer.review(a, b);
    expect(result).toEqual(
      stubReview
        .withResult(ReviewResult.DISJOINT)
        .withMessage('A and B do not have the same types (A: Patient, B: Observation).')
    );
  });
});
