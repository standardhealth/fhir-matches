import path from 'path';
import fs from 'fs-extra';
import { StructureDefinition } from 'fhir/r4';
import { ExtensionReviewer } from '../../../src/reviewers/sd';
import { getElement, getReview } from '../../testhelpers';
import { ReviewResult } from '../../../src/reviewers';
import { cloneDeep } from 'lodash';

describe('ExtensionReviewer', () => {
  let reviewer: ExtensionReviewer;
  let a: StructureDefinition;
  let b: StructureDefinition;
  beforeEach(() => {
    reviewer = new ExtensionReviewer();
    a = fs.readJSONSync(
      path.join(__dirname, 'fixtures', 'StructureDefinition-extension-patient-a.json')
    );
    b = fs.readJSONSync(
      path.join(__dirname, 'fixtures', 'StructureDefinition-extension-patient-b.json')
    );
  });

  it('should have the correct name', () => {
    expect(reviewer.name).toBe('Extension Reviewer');
  });

  it('should populate the result with the correct reviewer and ids', () => {
    const review = reviewer.review(a, b);
    expect(review.reviewer).toBe('Extension Reviewer');
    expect(review.a).toEqual({ id: 'extension-patient-a' });
    expect(review.b).toEqual({ id: 'extension-patient-b' });
  });

  it('should populate the result with child reviews for each extension element', () => {
    const review = reviewer.review(a, b);
    expect(review.details.childReviews).toHaveLength(2);
    review.details.childReviews.forEach(child => {
      expect(child.reviewer).toEqual('Extension Reviewer');
      expect(child.a.id).toEqual('extension-patient-a');
      expect(child.a.path).toBeDefined();
      expect(child.b.id).toEqual('extension-patient-b');
      expect(child.b.path).toBeDefined();
      expect(child.result).toBeDefined();
      expect(child.details).toBeDefined();
    });
  });

  it('should check extensions that are at modifierExtension paths', () => {
    // add a slice on Patient.modifierExtension on each profile
    const modifierExtensionIndex = a.snapshot.element.findIndex(
      element => element.id === 'Patient.modifierExtension'
    );
    let modifierExtensionSlice = cloneDeep(a.snapshot.element[modifierExtensionIndex]);
    modifierExtensionSlice.sliceName = 'SomeModifier';
    modifierExtensionSlice.id = 'Patient.modifierExtension:SomeModifier';
    modifierExtensionSlice.type[0].profile = [
      'http://hl7.org/my-ig/StructureDefinition/SpecialModifier'
    ];
    a.snapshot.element.splice(modifierExtensionIndex + 1, 0, modifierExtensionSlice);
    modifierExtensionSlice = cloneDeep(modifierExtensionSlice);
    modifierExtensionSlice.sliceName = 'ThisSlice';
    modifierExtensionSlice.id = 'Patient.modifierExtension:ThisSlice';
    b.snapshot.element.splice(modifierExtensionIndex + 1, 0, modifierExtensionSlice);
    const review = reviewer.review(a, b);
    expect(review.details.childReviews).toHaveLength(3);
    const modifierReview = getReview(
      review.details.childReviews,
      'extension-patient-a',
      'Patient.modifierExtension:SomeModifier'
    );
    expect(modifierReview).toBeDefined();
  });

  it('should not check extensions that are contained within other extensions', () => {
    // add extension elements on Patient.communication.extension
    const communicationExtensionIndex = a.snapshot.element.findIndex(
      element => element.path === 'Patient.communication.extension'
    );
    const complexExtension = cloneDeep(a.snapshot.element[communicationExtensionIndex]);
    complexExtension.path = 'Patient.communication.extension.extension';
    complexExtension.id = 'Patient.communication.extension.extension';
    complexExtension.min = 0;
    complexExtension.max = '*';
    const complexSlice = cloneDeep(complexExtension);
    complexSlice.id = 'Patient.communication.extension.extension:ComplexSlice';
    complexSlice.sliceName = 'ComplexSlice';
    complexSlice.type[0].profile = ['http://hl7.org/my-ig/StructureDefinition/ThisIsComplex'];
    a.snapshot.element.splice(communicationExtensionIndex + 1, 0, complexExtension, complexSlice);
    const review = reviewer.review(a, b);
    expect(review.details.childReviews).toHaveLength(2);
    const complexReview = getReview(
      review.details.childReviews,
      'extension-patient-a',
      'Patient.communication.extension.extension:ComplexSlice'
    );
    expect(complexReview).toBeNull();
  });

  describe('same extensions on A and B', () => {
    it('should assess two profiles with the same extensions and cardinalities as equivalent', () => {
      const review = reviewer.review(a, b);
      expect(review.result).toBe(ReviewResult.EQUIVALENT);
      const extensionReview = getReview(
        review.details.childReviews,
        'extension-patient-a',
        'Patient.extension:ExtA'
      );
      expect(extensionReview.result).toBe(ReviewResult.EQUIVALENT);
      const communicationExtensionReview = getReview(
        review.details.childReviews,
        'extension-patient-a',
        'Patient.communication.extension:ExtB'
      );
      expect(communicationExtensionReview.result).toBe(ReviewResult.EQUIVALENT);
    });

    it('should assess two profiles with the same extensions and narrower cardinalities on A as subset', () => {
      const extensionElementB = getElement(b, 'Patient.extension:ExtA');
      extensionElementB.max = '3';
      const review = reviewer.review(a, b);
      expect(review.result).toBe(ReviewResult.SUBSET);
      const extensionReview = getReview(
        review.details.childReviews,
        'extension-patient-a',
        'Patient.extension:ExtA'
      );
      expect(extensionReview.result).toBe(ReviewResult.SUBSET);
      const communicationExtensionReview = getReview(
        review.details.childReviews,
        'extension-patient-a',
        'Patient.communication.extension:ExtB'
      );
      expect(communicationExtensionReview.result).toBe(ReviewResult.EQUIVALENT);
    });

    it('should assess two profiles with the same extensions and wider cardinalities on A as superset', () => {
      const extensionElementA = getElement(a, 'Patient.extension:ExtA');
      extensionElementA.max = '*';
      const review = reviewer.review(a, b);
      expect(review.result).toBe(ReviewResult.SUPERSET);
      const extensionReview = getReview(
        review.details.childReviews,
        'extension-patient-a',
        'Patient.extension:ExtA'
      );
      expect(extensionReview.result).toBe(ReviewResult.SUPERSET);
      const communicationExtensionReview = getReview(
        review.details.childReviews,
        'extension-patient-a',
        'Patient.communication.extension:ExtB'
      );
      expect(communicationExtensionReview.result).toBe(ReviewResult.EQUIVALENT);
    });

    it('should assess two profiles with the same extensions and overlapping cardinalities as overlapping', () => {
      const communicationExtensionElementA = getElement(a, 'Patient.communication.extension:ExtB');
      communicationExtensionElementA.max = '4';
      const communicationExtensionElementB = getElement(b, 'Patient.communication.extension:ExtB');
      communicationExtensionElementB.min = 1;
      communicationExtensionElementB.max = '8';
      const review = reviewer.review(a, b);
      expect(review.result).toBe(ReviewResult.OVERLAPPING);
      const extensionReview = getReview(
        review.details.childReviews,
        'extension-patient-a',
        'Patient.extension:ExtA'
      );
      expect(extensionReview.result).toBe(ReviewResult.EQUIVALENT);
      const communicationExtensionReview = getReview(
        review.details.childReviews,
        'extension-patient-a',
        'Patient.communication.extension:ExtB'
      );
      expect(communicationExtensionReview.result).toBe(ReviewResult.OVERLAPPING);
    });

    it('should assess two profiles with the same extensions, but at least one disjoint cardinality, as disjoint', () => {
      const communicationExtensionElementB = getElement(b, 'Patient.communication.extension:ExtB');
      communicationExtensionElementB.min = 2;
      communicationExtensionElementB.max = '*';
      const review = reviewer.review(a, b);
      expect(review.result).toBe(ReviewResult.DISJOINT);
      const extensionReview = getReview(
        review.details.childReviews,
        'extension-patient-a',
        'Patient.extension:ExtA'
      );
      expect(extensionReview.result).toBe(ReviewResult.EQUIVALENT);
      const communicationExtensionReview = getReview(
        review.details.childReviews,
        'extension-patient-a',
        'Patient.communication.extension:ExtB'
      );
      expect(communicationExtensionReview.result).toBe(ReviewResult.DISJOINT);
    });

    it('should assess two profiles with the same extensions where A has both narrower and wider cardinalities as overlapping', () => {
      // A has a narrower cardinality than B on Patient.extension
      const extensionElementA = getElement(a, 'Patient.extension:ExtA');
      extensionElementA.min = 1;
      extensionElementA.max = '3';
      const extensionElementB = getElement(b, 'Patient.extension:ExtA');
      extensionElementB.max = '3';
      // A has a wider cardinality than B on Patient.communication.extension
      const communicationExtensionElementA = getElement(a, 'Patient.communication.extension:ExtB');
      communicationExtensionElementA.max = '4';
      const communicationExtensionElementB = getElement(b, 'Patient.communication.extension:ExtB');
      communicationExtensionElementB.min = 1;
      communicationExtensionElementB.max = '1';
      const review = reviewer.review(a, b);
      expect(review.result).toBe(ReviewResult.OVERLAPPING);
      const extensionReview = getReview(
        review.details.childReviews,
        'extension-patient-a',
        'Patient.extension:ExtA'
      );
      expect(extensionReview.result).toBe(ReviewResult.SUBSET);
      const communicationExtensionReview = getReview(
        review.details.childReviews,
        'extension-patient-a',
        'Patient.communication.extension:ExtB'
      );
      expect(communicationExtensionReview.result).toBe(ReviewResult.SUPERSET);
    });

    it('should assess two profiles with the same extension elements but missing cardinality information on A as unknown', () => {
      const extensionElementA = getElement(a, 'Patient.extension:ExtA');
      delete extensionElementA.min;
      const review = reviewer.review(a, b);
      expect(review.result).toBe(ReviewResult.UNKNOWN);
      const extensionReview = getReview(
        review.details.childReviews,
        'extension-patient-a',
        'Patient.extension:ExtA'
      );
      expect(extensionReview.result).toBe(ReviewResult.UNKNOWN);
      const communicationExtensionReview = getReview(
        review.details.childReviews,
        'extension-patient-a',
        'Patient.communication.extension:ExtB'
      );
      expect(communicationExtensionReview.result).toBe(ReviewResult.EQUIVALENT);
    });

    it('should assess two profiles with the same extension elements but missing cardinality information on B as unknown', () => {
      const extensionElementB = getElement(b, 'Patient.extension:ExtA');
      delete extensionElementB.max;
      const review = reviewer.review(a, b);
      expect(review.result).toBe(ReviewResult.UNKNOWN);
      const extensionReview = getReview(
        review.details.childReviews,
        'extension-patient-a',
        'Patient.extension:ExtA'
      );
      expect(extensionReview.result).toBe(ReviewResult.UNKNOWN);
      const communicationExtensionReview = getReview(
        review.details.childReviews,
        'extension-patient-a',
        'Patient.communication.extension:ExtB'
      );
      expect(communicationExtensionReview.result).toBe(ReviewResult.EQUIVALENT);
    });
  });

  describe('different extensions on A and B', () => {
    it('should assess two profiles where A has extension elements not present on B as subset', () => {
      // remove Patient.extension from B
      const extensionIndex = b.snapshot.element.findIndex(
        element => element.id === 'Patient.extension'
      );
      b.snapshot.element.splice(extensionIndex, 2);
      const review = reviewer.review(a, b);
      expect(review.result).toBe(ReviewResult.SUBSET);
      const extensionReview = getReview(
        review.details.childReviews,
        'extension-patient-a',
        'Patient.extension:ExtA'
      );
      expect(extensionReview.result).toBe(ReviewResult.SUBSET);
      expect(extensionReview.b.path).toBe('Patient.extension');
      const communicationExtensionReview = getReview(
        review.details.childReviews,
        'extension-patient-a',
        'Patient.communication.extension:ExtB'
      );
      expect(communicationExtensionReview.result).toBe(ReviewResult.EQUIVALENT);
    });

    it('should assess two profiles where A is missing extension elements present on B as superset', () => {
      // remove Patient.communication.extension from A
      const communicationExtensionIndex = a.snapshot.element.findIndex(
        element => element.id === 'Patient.communication.extension'
      );
      a.snapshot.element.splice(communicationExtensionIndex, 2);
      const review = reviewer.review(a, b);
      expect(review.result).toBe(ReviewResult.SUPERSET);
      const extensionReview = getReview(
        review.details.childReviews,
        'extension-patient-a',
        'Patient.extension:ExtA'
      );
      expect(extensionReview.result).toBe(ReviewResult.EQUIVALENT);
      const communicationExtensionReview = getReview(
        review.details.childReviews,
        'extension-patient-b',
        'Patient.communication.extension:ExtB'
      );
      expect(communicationExtensionReview.result).toBe(ReviewResult.SUPERSET);
      expect(communicationExtensionReview.a.path).toBe('Patient.communication.extension');
    });

    it('should assess two profiles where A has extension elements not present on B and A is missing extension elements present on B as overlapping', () => {
      // remove Patient.communication.extension from A
      const communicationExtensionIndex = a.snapshot.element.findIndex(
        element => element.id === 'Patient.communication.extension:ExtB'
      );
      a.snapshot.element.splice(communicationExtensionIndex, 1);
      // remove Patient.extension from B
      const extensionIndex = b.snapshot.element.findIndex(
        element => element.id === 'Patient.extension:ExtA'
      );
      b.snapshot.element.splice(extensionIndex, 1);
      const review = reviewer.review(a, b);
      expect(review.result).toBe(ReviewResult.OVERLAPPING);
      const extensionReview = getReview(
        review.details.childReviews,
        'extension-patient-a',
        'Patient.extension:ExtA'
      );
      expect(extensionReview.result).toBe(ReviewResult.SUBSET);
      expect(extensionReview.b.path).toBe('Patient.extension');
      const communicationExtensionReview = getReview(
        review.details.childReviews,
        'extension-patient-b',
        'Patient.communication.extension:ExtB'
      );
      expect(communicationExtensionReview.result).toBe(ReviewResult.SUPERSET);
      expect(communicationExtensionReview.a.path).toBe('Patient.communication.extension');
    });

    it('should assess two profiles where A and B have extensions on the same path, but they are different types, as overlapping', () => {
      // change the profile on Patient.extension from A
      const extensionElement = a.snapshot.element.find(
        element => element.id === 'Patient.extension:ExtA'
      );
      extensionElement.type = [
        {
          code: 'Extension',
          profile: ['http://hl7.org/my-ig/StructureDefinition/DifferentExtension']
        }
      ];
      const review = reviewer.review(a, b);
      expect(review.result).toBe(ReviewResult.OVERLAPPING);
      const extensionReviewA = getReview(
        review.details.childReviews,
        'extension-patient-a',
        'Patient.extension:ExtA'
      );
      expect(extensionReviewA.result).toBe(ReviewResult.SUBSET);
      const extensionReviewB = getReview(
        review.details.childReviews,
        'extension-patient-b',
        'Patient.extension:ExtA'
      );
      expect(extensionReviewB.result).toBe(ReviewResult.SUPERSET);
      const communicationExtensionReview = getReview(
        review.details.childReviews,
        'extension-patient-a',
        'Patient.communication.extension:ExtB'
      );
      expect(communicationExtensionReview.result).toBe(ReviewResult.EQUIVALENT);
    });
  });

  describe('multiple profiles on an extension element', () => {
    it('should provide results for each profile on an extension element', () => {
      // add some profiles to Patient.communication.extension on A
      const communicationExtension = a.snapshot.element.find(
        element => element.id === 'Patient.communication.extension:ExtB'
      );
      communicationExtension.type = [
        {
          code: 'Extension',
          profile: [
            'http://hl7.org/my-ig/StructureDefinition/ExtensionB',
            'http://hl7.org/my-ig/StructureDefinition/DifferentExtension',
            'http://hl7.org/my-ig/StructureDefinition/UnusualExtension'
          ]
        }
      ];
      const review = reviewer.review(a, b);
      const communicationExtensionReviews = review.details.childReviews.filter(
        rev =>
          rev.a.id === 'extension-patient-a' &&
          rev.a.path === 'Patient.communication.extension:ExtB'
      );
      expect(communicationExtensionReviews).toHaveLength(3);
      expect(
        communicationExtensionReviews.some(rev => {
          rev.details.message.includes('http://hl7.org/my-ig/StructureDefinition/ExtensionB');
        })
      );
      expect(
        communicationExtensionReviews.some(rev => {
          rev.details.message.includes(
            'http://hl7.org/my-ig/StructureDefinition/DifferentExtension'
          );
        })
      );
      expect(
        communicationExtensionReviews.some(rev => {
          rev.details.message.includes('http://hl7.org/my-ig/StructureDefinition/UnusualExtension');
        })
      );
    });
  });

  describe('multiple slices at an extension path', () => {
    it('should combine the cardinalities for all slices that contain a given profile', () => {
      // add some slices on Patient.extension for A to make the aggregate cardinality 1..4
      const extensionIndexA = a.snapshot.element.findIndex(
        element => element.id === 'Patient.extension:ExtA'
      );
      let newSlice = cloneDeep(a.snapshot.element[extensionIndexA]);
      newSlice.sliceName = 'AnotherExt';
      newSlice.id = 'Patient.extension:AnotherExt';
      newSlice.min = 1;
      newSlice.max = '1';
      a.snapshot.element.splice(extensionIndexA, 0, newSlice);
      newSlice = cloneDeep(a.snapshot.element[extensionIndexA]);
      newSlice.sliceName = 'BiggerExt';
      newSlice.id = 'Patient.extension:BiggerExt';
      newSlice.min = 0;
      newSlice.max = '2';
      a.snapshot.element.splice(extensionIndexA, 0, newSlice);
      // add a slice on Patient.extension for B to make the aggregate cardinality 1..4
      const extensionIndexB = b.snapshot.element.findIndex(
        element => element.id === 'Patient.extension:ExtA'
      );
      newSlice = cloneDeep(b.snapshot.element[extensionIndexB]);
      newSlice.sliceName = 'MoreExtension';
      newSlice.id = 'Patient.extension:MoreExtension';
      newSlice.min = 1;
      newSlice.max = '3';
      b.snapshot.element.splice(extensionIndexB, 0, newSlice);
      const review = reviewer.review(a, b);
      const extensionReview = getReview(
        review.details.childReviews,
        'extension-patient-b',
        'Patient.extension'
      );
      expect(extensionReview.result).toBe(ReviewResult.EQUIVALENT);
      expect(extensionReview.details.childReviews).toHaveLength(6);
    });
  });
});
