import { mock } from 'jest-mock-extended';
import { AggregateReviewer } from '../../src/reviewers';
import { Review, ReviewResult, Reviewer } from '../../src/reviewers';

class TestAggregateReviewer extends AggregateReviewer {
  readonly name = 'Test Aggregate Reviewer';
}

describe('AggregateReviewer', () => {
  const reviewer = new TestAggregateReviewer();
  const a = { id: 'A' };
  const b = { id: 'B' };

  beforeEach(() => {
    reviewer.reviewers = [];
  });

  it('should have the correct name', () => {
    expect(reviewer.name).toBe('Test Aggregate Reviewer');
  });

  it('should run all the reviewers', () => {
    reviewer.reviewers = [
      getMockReviewer('R1', ReviewResult.EQUIVALENT),
      getMockReviewer('R2', ReviewResult.OVERLAPPING),
      getMockReviewer('R3', ReviewResult.DISJOINT)
    ];
    const results = reviewer.review(a, b);
    expect(results).toEqual([
      getReview('Test Aggregate Reviewer', ReviewResult.DISJOINT),
      getReview('R1', ReviewResult.EQUIVALENT),
      getReview('R2', ReviewResult.OVERLAPPING),
      getReview('R3', ReviewResult.DISJOINT)
    ]);
  });

  it('should report equivalent when all reviewers report equivalent', () => {
    reviewer.reviewers = [
      getMockReviewer('R1', ReviewResult.EQUIVALENT),
      getMockReviewer('R2', ReviewResult.EQUIVALENT),
      getMockReviewer('R3', ReviewResult.EQUIVALENT)
    ];
    const results = reviewer.review(a, b);
    expect(results).toHaveLength(4);
    expect(results[0]).toEqual(getReview('Test Aggregate Reviewer', ReviewResult.EQUIVALENT));
  });

  it('should report subset when all reviewers report subset', () => {
    reviewer.reviewers = [
      getMockReviewer('R1', ReviewResult.SUBSET),
      getMockReviewer('R2', ReviewResult.SUBSET),
      getMockReviewer('R3', ReviewResult.SUBSET)
    ];
    const results = reviewer.review(a, b);
    expect(results).toHaveLength(4);
    expect(results[0]).toEqual(getReview('Test Aggregate Reviewer', ReviewResult.SUBSET));
  });

  it('should report subset when reviewers report subset and equivalent', () => {
    reviewer.reviewers = [
      getMockReviewer('R1', ReviewResult.SUBSET),
      getMockReviewer('R2', ReviewResult.EQUIVALENT),
      getMockReviewer('R3', ReviewResult.SUBSET)
    ];
    const results = reviewer.review(a, b);
    expect(results).toHaveLength(4);
    expect(results[0]).toEqual(getReview('Test Aggregate Reviewer', ReviewResult.SUBSET));
  });

  it('should report superset when all reviewers report superset', () => {
    reviewer.reviewers = [
      getMockReviewer('R1', ReviewResult.SUPERSET),
      getMockReviewer('R2', ReviewResult.SUPERSET),
      getMockReviewer('R3', ReviewResult.SUPERSET)
    ];
    const results = reviewer.review(a, b);
    expect(results).toHaveLength(4);
    expect(results[0]).toEqual(getReview('Test Aggregate Reviewer', ReviewResult.SUPERSET));
  });

  it('should report superset when reviewers report superset and equivalent', () => {
    reviewer.reviewers = [
      getMockReviewer('R1', ReviewResult.EQUIVALENT),
      getMockReviewer('R2', ReviewResult.SUPERSET),
      getMockReviewer('R3', ReviewResult.EQUIVALENT)
    ];
    const results = reviewer.review(a, b);
    expect(results).toHaveLength(4);
    expect(results[0]).toEqual(getReview('Test Aggregate Reviewer', ReviewResult.SUPERSET));
  });

  it('should report overlapping when all reviewers report overlapping', () => {
    reviewer.reviewers = [
      getMockReviewer('R1', ReviewResult.OVERLAPPING),
      getMockReviewer('R2', ReviewResult.OVERLAPPING),
      getMockReviewer('R3', ReviewResult.OVERLAPPING)
    ];
    const results = reviewer.review(a, b);
    expect(results).toHaveLength(4);
    expect(results[0]).toEqual(getReview('Test Aggregate Reviewer', ReviewResult.OVERLAPPING));
  });

  it('should report overlapping when reviewers report overlapping and equivalent', () => {
    reviewer.reviewers = [
      getMockReviewer('R1', ReviewResult.EQUIVALENT),
      getMockReviewer('R2', ReviewResult.OVERLAPPING),
      getMockReviewer('R3', ReviewResult.OVERLAPPING)
    ];
    const results = reviewer.review(a, b);
    expect(results).toHaveLength(4);
    expect(results[0]).toEqual(getReview('Test Aggregate Reviewer', ReviewResult.OVERLAPPING));
  });

  it('should report overlapping when reviewers report overlapping and subset', () => {
    reviewer.reviewers = [
      getMockReviewer('R1', ReviewResult.OVERLAPPING),
      getMockReviewer('R2', ReviewResult.SUBSET),
      getMockReviewer('R3', ReviewResult.OVERLAPPING)
    ];
    const results = reviewer.review(a, b);
    expect(results).toHaveLength(4);
    expect(results[0]).toEqual(getReview('Test Aggregate Reviewer', ReviewResult.OVERLAPPING));
  });

  it('should report overlapping when reviewers report overlapping and superset', () => {
    reviewer.reviewers = [
      getMockReviewer('R1', ReviewResult.OVERLAPPING),
      getMockReviewer('R2', ReviewResult.SUPERSET),
      getMockReviewer('R3', ReviewResult.OVERLAPPING)
    ];
    const results = reviewer.review(a, b);
    expect(results).toHaveLength(4);
    expect(results[0]).toEqual(getReview('Test Aggregate Reviewer', ReviewResult.OVERLAPPING));
  });

  it('should report overlapping when reviewers report subset and superset', () => {
    reviewer.reviewers = [
      getMockReviewer('R1', ReviewResult.SUBSET),
      getMockReviewer('R2', ReviewResult.SUPERSET),
      getMockReviewer('R3', ReviewResult.SUBSET)
    ];
    const results = reviewer.review(a, b);
    expect(results).toHaveLength(4);
    expect(results[0]).toEqual(getReview('Test Aggregate Reviewer', ReviewResult.OVERLAPPING));
  });

  it('should report disjoint when all reviewers report disjoint', () => {
    reviewer.reviewers = [
      getMockReviewer('R1', ReviewResult.DISJOINT),
      getMockReviewer('R2', ReviewResult.DISJOINT),
      getMockReviewer('R3', ReviewResult.DISJOINT)
    ];
    const results = reviewer.review(a, b);
    expect(results).toHaveLength(4);
    expect(results[0]).toEqual(getReview('Test Aggregate Reviewer', ReviewResult.DISJOINT));
  });

  it('should report disjoint when one reviewer reports disjoint', () => {
    reviewer.reviewers = [
      getMockReviewer('R1', ReviewResult.EQUIVALENT),
      getMockReviewer('R2', ReviewResult.SUBSET),
      getMockReviewer('R3', ReviewResult.SUPERSET),
      getMockReviewer('R3', ReviewResult.OVERLAPPING),
      getMockReviewer('R3', ReviewResult.DISJOINT),
      getMockReviewer('R3', ReviewResult.UNKNOWN)
    ];
    const results = reviewer.review(a, b);
    expect(results).toHaveLength(7);
    expect(results[0]).toEqual(getReview('Test Aggregate Reviewer', ReviewResult.DISJOINT));
  });

  it('should report unknown when all reviewers report unknown', () => {
    reviewer.reviewers = [
      getMockReviewer('R1', ReviewResult.UNKNOWN),
      getMockReviewer('R2', ReviewResult.UNKNOWN),
      getMockReviewer('R3', ReviewResult.UNKNOWN)
    ];
    const results = reviewer.review(a, b);
    expect(results).toHaveLength(4);
    expect(results[0]).toEqual(getReview('Test Aggregate Reviewer', ReviewResult.UNKNOWN));
  });

  it('should report unknown when one reviewer reports unknown (with no disjoints)', () => {
    reviewer.reviewers = [
      getMockReviewer('R1', ReviewResult.EQUIVALENT),
      getMockReviewer('R2', ReviewResult.SUBSET),
      getMockReviewer('R3', ReviewResult.SUPERSET),
      getMockReviewer('R3', ReviewResult.OVERLAPPING),
      getMockReviewer('R3', ReviewResult.UNKNOWN)
    ];
    const results = reviewer.review(a, b);
    expect(results).toHaveLength(6);
    expect(results[0]).toEqual(getReview('Test Aggregate Reviewer', ReviewResult.UNKNOWN));
  });
});

function getMockReviewer(name: string, ...results: ReviewResult[]): Reviewer {
  const m = mock<Reviewer>();
  m.name = name;
  m.review.mockReturnValue(results.map(r => getReview(name, r)));
  return m;
}

function getReview(name: string, result: ReviewResult): Review {
  return {
    reviewer: name,
    a: { id: 'A' },
    b: { id: 'B' },
    result
  };
}
