import path from 'path';
import fs from 'fs-extra';
import { StructureDefinition } from 'fhir/r4';
import { AggregateSDReviewer } from '../../../src/reviewers/sd';
import { ReviewResult } from '../../../src/reviewers';

describe('AggregateSDReviewer', () => {
  let reviewer: AggregateSDReviewer;
  let a: StructureDefinition;
  let b: StructureDefinition;
  beforeEach(() => {
    reviewer = new AggregateSDReviewer();
    //reviewer.review({ id: 'Foo' }, { id: 'Bar' });
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
    expect(reviewer.reviewers.map(r => r.name)).toEqual(['FHIR Version Reviewer']);
  });

  it('should return an aggregate review first', () => {
    const results = reviewer.review(a, b);
    expect(results.length).toBeGreaterThan(1);
    expect(results[0]).toEqual({
      reviewer: 'StructureDefinition Reviewer',
      a: { id: 'simple-patient-a' },
      b: { id: 'simple-patient-b' },
      result: ReviewResult.EQUIVALENT
    });
  });

  it('should return reviews for all registered reviewers', () => {
    const resultReviewers = reviewer.review(a, b).map(r => r.reviewer);
    reviewer.reviewers.forEach(reviewer => {
      expect(resultReviewers).toContain(reviewer.name);
    });
  });
});
