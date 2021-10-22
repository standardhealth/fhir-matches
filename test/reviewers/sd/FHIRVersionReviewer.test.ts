import path from 'path';
import fs from 'fs-extra';
import { StructureDefinition } from 'fhir/r4';
import { FHIRVersionReviewer } from '../../../src/reviewers/sd';
import { Review, ReviewResult } from '../../../src/reviewers';

describe('FHIRVersionReviewer', () => {
  let reviewer: FHIRVersionReviewer;
  let stubReview: Review;
  let a: StructureDefinition;
  let b: StructureDefinition;
  beforeEach(() => {
    reviewer = new FHIRVersionReviewer();
    stubReview = new Review('FHIR Version Reviewer', 'simple-patient-a', 'simple-patient-b');
    a = fs.readJSONSync(
      path.join(__dirname, 'fixtures', 'StructureDefinition-simple-patient-a.json')
    );
    b = fs.readJSONSync(
      path.join(__dirname, 'fixtures', 'StructureDefinition-simple-patient-b.json')
    );
  });

  it('should have the correct name', () => {
    expect(reviewer.name).toBe('FHIR Version Reviewer');
  });

  it('should assess two profiles w/ the same FHIR version as equivalent', () => {
    const result = reviewer.review(a, b);
    expect(result).toEqual(stubReview.withResult(ReviewResult.EQUIVALENT));
  });

  it('should assess two profiles w/ different FHIR versions as disjoint', () => {
    b.fhirVersion = '3.0.1';

    const result = reviewer.review(a, b);
    expect(result).toEqual(
      stubReview
        .withResult(ReviewResult.DISJOINT)
        .withMessage('A and B do not have compatible FHIR versions (A: 4.0.1, B: 3.0.1).')
    );
  });

  it('should assess profiles as unknown when A is missing fhirVersion', () => {
    delete a.fhirVersion;

    const result = reviewer.review(a, b);
    expect(result).toEqual(
      stubReview.withResult(ReviewResult.UNKNOWN).withMessage('A does not declare a fhirVersion.')
    );
  });

  it('should assess profiles as unknown when B is missing fhirVersion', () => {
    delete b.fhirVersion;

    const result = reviewer.review(a, b);
    expect(result).toEqual(
      stubReview.withResult(ReviewResult.UNKNOWN).withMessage('B does not declare a fhirVersion.')
    );
  });

  it('should assess profiles as unknown when A and B are missing fhirVersion', () => {
    delete a.fhirVersion;
    delete b.fhirVersion;

    const result = reviewer.review(a, b);
    expect(result).toEqual(
      stubReview
        .withResult(ReviewResult.UNKNOWN)
        .withMessage('A and B do not declare a fhirVersion.')
    );
  });
});
