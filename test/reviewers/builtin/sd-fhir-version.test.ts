import path from 'path';
import fs from 'fs-extra';
import { StructureDefinition } from 'fhir/r4';
import SDFHIRVersionReviewer from '../../../src/reviewers/builtin/sd-fhir-version';
import { ReviewResult } from '../../../src/reviewers';

describe('sd-fhir-version', () => {
  let a: StructureDefinition;
  let b: StructureDefinition;
  beforeEach(() => {
    a = fs.readJSONSync(
      path.join(__dirname, 'fixtures', 'StructureDefinition-simple-patient-a.json')
    );
    b = fs.readJSONSync(
      path.join(__dirname, 'fixtures', 'StructureDefinition-simple-patient-b.json')
    );
  });

  it('should have the correct name', () => {
    expect(SDFHIRVersionReviewer.name).toBe('FHIR Version Reviewer');
  });

  it('should assess two profiles w/ the same FHIR version as equivalent', () => {
    const result = SDFHIRVersionReviewer.review(a, b);
    expect(result).toEqual([
      {
        reviewer: 'FHIR Version Reviewer',
        a: { id: 'simple-patient-a' },
        b: { id: 'simple-patient-b' },
        result: ReviewResult.EQUIVALENT
      }
    ]);
  });

  it('should assess two profiles w/ different FHIR versions as disjoint', () => {
    b.fhirVersion = '3.0.1';

    const result = SDFHIRVersionReviewer.review(a, b);
    expect(result).toEqual([
      {
        reviewer: 'FHIR Version Reviewer',
        a: { id: 'simple-patient-a' },
        b: { id: 'simple-patient-b' },
        result: ReviewResult.DISJOINT,
        details: 'A and B do not have compatible FHIR versions (A: 4.0.1, B: 3.0.1).'
      }
    ]);
  });

  it('should assess profiles as unknown when A is missing fhirVersion', () => {
    delete a.fhirVersion;

    const result = SDFHIRVersionReviewer.review(a, b);
    expect(result).toEqual([
      {
        reviewer: 'FHIR Version Reviewer',
        a: { id: 'simple-patient-a' },
        b: { id: 'simple-patient-b' },
        result: ReviewResult.UNKNOWN,
        details: 'A does not declare a fhirVersion.'
      }
    ]);
  });

  it('should assess profiles as unknown when B is missing fhirVersion', () => {
    delete b.fhirVersion;

    const result = SDFHIRVersionReviewer.review(a, b);
    expect(result).toEqual([
      {
        reviewer: 'FHIR Version Reviewer',
        a: { id: 'simple-patient-a' },
        b: { id: 'simple-patient-b' },
        result: ReviewResult.UNKNOWN,
        details: 'B does not declare a fhirVersion.'
      }
    ]);
  });

  it('should assess profiles as unknown when A and B are missing fhirVersion', () => {
    delete a.fhirVersion;
    delete b.fhirVersion;

    const result = SDFHIRVersionReviewer.review(a, b);
    expect(result).toEqual([
      {
        reviewer: 'FHIR Version Reviewer',
        a: { id: 'simple-patient-a' },
        b: { id: 'simple-patient-b' },
        result: ReviewResult.UNKNOWN,
        details: 'A and B do not declare a fhirVersion.'
      }
    ]);
  });
});
