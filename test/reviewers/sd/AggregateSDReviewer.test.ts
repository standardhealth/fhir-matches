import path from 'path';
import fs from 'fs-extra';
import { StructureDefinition } from 'fhir/r4';
import { AggregateSDReviewer } from '../../../src/reviewers/sd';
import { Review, ReviewResult } from '../../../src/reviewers';

describe('AggregateSDReviewer', () => {
  let reviewer: AggregateSDReviewer;
  let a: StructureDefinition;
  let b: StructureDefinition;
  beforeEach(() => {
    reviewer = new AggregateSDReviewer();
    a = fs.readJSONSync(
      path.join(__dirname, 'fixtures', 'StructureDefinition-simple-patient-a.json')
    );
    b = fs.readJSONSync(
      path.join(__dirname, 'fixtures', 'StructureDefinition-simple-patient-b.json')
    );
  });

  it('should have the correct name', () => {
    expect(reviewer.name).toBe('StructureDefinition Reviewer');
  });

  it('should be initialized with the correct reviewers', () => {
    expect(reviewer.reviewers.map(r => r.name)).toEqual([
      'FHIR Version Reviewer',
      'Base Definition Reviewer',
      'Cardinality Reviewer'
    ]);
  });

  it('should return an aggregate review first', () => {
    const result = reviewer.review(a, b);
    expect(result).toMatchObject(
      new Review(
        'StructureDefinition Reviewer',
        'simple-patient-a',
        'simple-patient-b',
        ReviewResult.EQUIVALENT
      )
    );
    expect(result.details.childReviews).toHaveLength(3);
  });

  it('should return reviews for all registered reviewers', () => {
    const resultReviewers = reviewer.review(a, b).details.childReviews.map(r => r.reviewer);
    reviewer.reviewers.forEach(reviewer => {
      expect(resultReviewers).toContain(reviewer.name);
    });
  });
});
