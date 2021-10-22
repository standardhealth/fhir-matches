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

  it('should return aggregate review and all child reviewers', () => {
    reviewer.reviewers = [
      getMockReviewer('R1', ReviewResult.EQUIVALENT),
      getMockReviewer('R2', ReviewResult.EQUIVALENT),
      getMockReviewer('R3', ReviewResult.EQUIVALENT)
    ];
    const result = reviewer.review(a, b);
    expect(result).toEqual(
      new Review('Test Aggregate Reviewer', a, b, ReviewResult.EQUIVALENT)
        .withChildReview('R1', 'A', 'B', ReviewResult.EQUIVALENT)
        .withChildReview('R2', 'A', 'B', ReviewResult.EQUIVALENT)
        .withChildReview('R3', 'A', 'B', ReviewResult.EQUIVALENT)
    );
  });

  it('should report equivalent when all reviewers report equivalent', () => {
    reviewer.reviewers = [
      getMockReviewer('R1', ReviewResult.EQUIVALENT),
      getMockReviewer('R2', ReviewResult.EQUIVALENT),
      getMockReviewer('R3', ReviewResult.EQUIVALENT)
    ];
    expect(reviewer.review(a, b).result).toBe(ReviewResult.EQUIVALENT);
  });

  it('should report subset when all reviewers report subset', () => {
    reviewer.reviewers = [
      getMockReviewer('R1', ReviewResult.SUBSET),
      getMockReviewer('R2', ReviewResult.SUBSET),
      getMockReviewer('R3', ReviewResult.SUBSET)
    ];
    expect(reviewer.review(a, b).result).toBe(ReviewResult.SUBSET);
  });

  it('should report subset when reviewers report subset and equivalent', () => {
    reviewer.reviewers = [
      getMockReviewer('R1', ReviewResult.SUBSET),
      getMockReviewer('R2', ReviewResult.EQUIVALENT),
      getMockReviewer('R3', ReviewResult.SUBSET)
    ];
    expect(reviewer.review(a, b).result).toBe(ReviewResult.SUBSET);
  });

  it('should report superset when all reviewers report superset', () => {
    reviewer.reviewers = [
      getMockReviewer('R1', ReviewResult.SUPERSET),
      getMockReviewer('R2', ReviewResult.SUPERSET),
      getMockReviewer('R3', ReviewResult.SUPERSET)
    ];
    expect(reviewer.review(a, b).result).toBe(ReviewResult.SUPERSET);
  });

  it('should report superset when reviewers report superset and equivalent', () => {
    reviewer.reviewers = [
      getMockReviewer('R1', ReviewResult.EQUIVALENT),
      getMockReviewer('R2', ReviewResult.SUPERSET),
      getMockReviewer('R3', ReviewResult.EQUIVALENT)
    ];
    expect(reviewer.review(a, b).result).toBe(ReviewResult.SUPERSET);
  });

  it('should report overlapping when all reviewers report overlapping', () => {
    reviewer.reviewers = [
      getMockReviewer('R1', ReviewResult.OVERLAPPING),
      getMockReviewer('R2', ReviewResult.OVERLAPPING),
      getMockReviewer('R3', ReviewResult.OVERLAPPING)
    ];
    expect(reviewer.review(a, b).result).toBe(ReviewResult.OVERLAPPING);
  });

  it('should report overlapping when reviewers report overlapping and equivalent', () => {
    reviewer.reviewers = [
      getMockReviewer('R1', ReviewResult.EQUIVALENT),
      getMockReviewer('R2', ReviewResult.OVERLAPPING),
      getMockReviewer('R3', ReviewResult.OVERLAPPING)
    ];
    expect(reviewer.review(a, b).result).toBe(ReviewResult.OVERLAPPING);
  });

  it('should report overlapping when reviewers report overlapping and subset', () => {
    reviewer.reviewers = [
      getMockReviewer('R1', ReviewResult.OVERLAPPING),
      getMockReviewer('R2', ReviewResult.SUBSET),
      getMockReviewer('R3', ReviewResult.OVERLAPPING)
    ];
    expect(reviewer.review(a, b).result).toBe(ReviewResult.OVERLAPPING);
  });

  it('should report overlapping when reviewers report overlapping and superset', () => {
    reviewer.reviewers = [
      getMockReviewer('R1', ReviewResult.OVERLAPPING),
      getMockReviewer('R2', ReviewResult.SUPERSET),
      getMockReviewer('R3', ReviewResult.OVERLAPPING)
    ];
    expect(reviewer.review(a, b).result).toBe(ReviewResult.OVERLAPPING);
  });

  it('should report overlapping when reviewers report subset and superset', () => {
    reviewer.reviewers = [
      getMockReviewer('R1', ReviewResult.SUBSET),
      getMockReviewer('R2', ReviewResult.SUPERSET),
      getMockReviewer('R3', ReviewResult.SUBSET)
    ];
    expect(reviewer.review(a, b).result).toBe(ReviewResult.OVERLAPPING);
  });

  it('should report disjoint when all reviewers report disjoint', () => {
    reviewer.reviewers = [
      getMockReviewer('R1', ReviewResult.DISJOINT),
      getMockReviewer('R2', ReviewResult.DISJOINT),
      getMockReviewer('R3', ReviewResult.DISJOINT)
    ];
    expect(reviewer.review(a, b).result).toBe(ReviewResult.DISJOINT);
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
    expect(reviewer.review(a, b).result).toBe(ReviewResult.DISJOINT);
  });

  it('should report unknown when all reviewers report unknown', () => {
    reviewer.reviewers = [
      getMockReviewer('R1', ReviewResult.UNKNOWN),
      getMockReviewer('R2', ReviewResult.UNKNOWN),
      getMockReviewer('R3', ReviewResult.UNKNOWN)
    ];
    expect(reviewer.review(a, b).result).toBe(ReviewResult.UNKNOWN);
  });

  it('should report unknown when one reviewer reports unknown (with no disjoints)', () => {
    reviewer.reviewers = [
      getMockReviewer('R1', ReviewResult.EQUIVALENT),
      getMockReviewer('R2', ReviewResult.SUBSET),
      getMockReviewer('R3', ReviewResult.SUPERSET),
      getMockReviewer('R3', ReviewResult.OVERLAPPING),
      getMockReviewer('R3', ReviewResult.UNKNOWN)
    ];
    expect(reviewer.review(a, b).result).toBe(ReviewResult.UNKNOWN);
  });
});

function getMockReviewer(name: string, result: ReviewResult): Reviewer {
  const m = mock<Reviewer>();
  m.name = name;
  m.review.mockReturnValue(new Review(name, 'A', 'B', result));
  return m;
}
