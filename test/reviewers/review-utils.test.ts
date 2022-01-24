import { Review, ReviewResult } from '../../src/reviewers';
import { getAggregateResult, organizeReviews } from '../../src/reviewers/review-utils';
describe('review-utils', () => {
  describe('#organizeReviews', () => {
    it('should return an object w/ empty values when no reviews are passed in', () => {
      const organized = organizeReviews([]);
      expect(organized).toEqual({
        equivalent: [],
        subset: [],
        superset: [],
        overlapping: [],
        disjoint: [],
        unknown: []
      });
    });

    it('should return an object w/ organized values', () => {
      const reviews = [
        new Review('Test0', 'a1', 'b2', ReviewResult.SUBSET),
        new Review('Test1', 'a1', 'b2', ReviewResult.OVERLAPPING),
        new Review('Test2', 'a1', 'b2', ReviewResult.EQUIVALENT),
        new Review('Test3', 'a1', 'b2', ReviewResult.DISJOINT),
        new Review('Test4', 'a1', 'b2', ReviewResult.SUPERSET),
        new Review('Test5', 'a1', 'b2', ReviewResult.UNKNOWN),
        new Review('Test6', 'a1', 'b2', ReviewResult.EQUIVALENT),
        new Review('Test7', 'a1', 'b2', ReviewResult.DISJOINT)
      ];

      const organized = organizeReviews(reviews);

      expect(organized).toEqual({
        equivalent: [reviews[2], reviews[6]],
        subset: [reviews[0]],
        superset: [reviews[4]],
        overlapping: [reviews[1]],
        disjoint: [reviews[3], reviews[7]],
        unknown: [reviews[5]]
      });
    });
  });

  describe('#getAggregateResult', () => {
    it('should return equivalent when all reviews are equivalent', () => {
      const reviews = [
        new Review('R', 'A', 'B', ReviewResult.EQUIVALENT),
        new Review('R', 'A', 'B', ReviewResult.EQUIVALENT),
        new Review('R', 'A', 'B', ReviewResult.EQUIVALENT)
      ];
      expect(getAggregateResult(reviews)).toBe(ReviewResult.EQUIVALENT);
    });

    it('should return subset when all reviews are subset', () => {
      const reviews = [
        new Review('R', 'A', 'B', ReviewResult.SUBSET),
        new Review('R', 'A', 'B', ReviewResult.SUBSET),
        new Review('R', 'A', 'B', ReviewResult.SUBSET)
      ];
      expect(getAggregateResult(reviews)).toBe(ReviewResult.SUBSET);
    });

    it('should return subset when reviews are subset and equivalent', () => {
      const reviews = [
        new Review('R', 'A', 'B', ReviewResult.SUBSET),
        new Review('R', 'A', 'B', ReviewResult.EQUIVALENT),
        new Review('R', 'A', 'B', ReviewResult.SUBSET)
      ];
      expect(getAggregateResult(reviews)).toBe(ReviewResult.SUBSET);
    });

    it('should return superset when all reviews are superset', () => {
      const reviews = [
        new Review('R', 'A', 'B', ReviewResult.SUPERSET),
        new Review('R', 'A', 'B', ReviewResult.SUPERSET),
        new Review('R', 'A', 'B', ReviewResult.SUPERSET)
      ];
      expect(getAggregateResult(reviews)).toBe(ReviewResult.SUPERSET);
    });

    it('should return superset when reviews are superset and equivalent', () => {
      const reviews = [
        new Review('R', 'A', 'B', ReviewResult.EQUIVALENT),
        new Review('R', 'A', 'B', ReviewResult.SUPERSET),
        new Review('R', 'A', 'B', ReviewResult.EQUIVALENT)
      ];
      expect(getAggregateResult(reviews)).toBe(ReviewResult.SUPERSET);
    });

    it('should return overlapping when all reviews are overlapping', () => {
      const reviews = [
        new Review('R', 'A', 'B', ReviewResult.OVERLAPPING),
        new Review('R', 'A', 'B', ReviewResult.OVERLAPPING),
        new Review('R', 'A', 'B', ReviewResult.OVERLAPPING)
      ];
      expect(getAggregateResult(reviews)).toBe(ReviewResult.OVERLAPPING);
    });

    it('should return overlapping when reviews are overlapping and equivalent', () => {
      const reviews = [
        new Review('R', 'A', 'B', ReviewResult.EQUIVALENT),
        new Review('R', 'A', 'B', ReviewResult.OVERLAPPING),
        new Review('R', 'A', 'B', ReviewResult.OVERLAPPING)
      ];
      expect(getAggregateResult(reviews)).toBe(ReviewResult.OVERLAPPING);
    });

    it('should return overlapping when reviews are overlapping and subset', () => {
      const reviews = [
        new Review('R', 'A', 'B', ReviewResult.OVERLAPPING),
        new Review('R', 'A', 'B', ReviewResult.SUBSET),
        new Review('R', 'A', 'B', ReviewResult.OVERLAPPING)
      ];
      expect(getAggregateResult(reviews)).toBe(ReviewResult.OVERLAPPING);
    });

    it('should return overlapping when reviews are overlapping and superset', () => {
      const reviews = [
        new Review('R', 'A', 'B', ReviewResult.OVERLAPPING),
        new Review('R', 'A', 'B', ReviewResult.SUPERSET),
        new Review('R', 'A', 'B', ReviewResult.OVERLAPPING)
      ];
      expect(getAggregateResult(reviews)).toBe(ReviewResult.OVERLAPPING);
    });

    it('should return overlapping when reviews are subset and superset', () => {
      const reviews = [
        new Review('R', 'A', 'B', ReviewResult.SUBSET),
        new Review('R', 'A', 'B', ReviewResult.SUPERSET),
        new Review('R', 'A', 'B', ReviewResult.SUBSET)
      ];
      expect(getAggregateResult(reviews)).toBe(ReviewResult.OVERLAPPING);
    });

    it('should return disjoint when all reviews are disjoint', () => {
      const reviews = [
        new Review('R', 'A', 'B', ReviewResult.DISJOINT),
        new Review('R', 'A', 'B', ReviewResult.DISJOINT),
        new Review('R', 'A', 'B', ReviewResult.DISJOINT)
      ];
      expect(getAggregateResult(reviews)).toBe(ReviewResult.DISJOINT);
    });

    it('should return disjoint when one reviewer reports disjoint', () => {
      const reviews = [
        new Review('R', 'A', 'B', ReviewResult.EQUIVALENT),
        new Review('R', 'A', 'B', ReviewResult.SUBSET),
        new Review('R', 'A', 'B', ReviewResult.SUPERSET),
        new Review('R', 'A', 'B', ReviewResult.OVERLAPPING),
        new Review('R', 'A', 'B', ReviewResult.DISJOINT),
        new Review('R', 'A', 'B', ReviewResult.UNKNOWN)
      ];
      expect(getAggregateResult(reviews)).toBe(ReviewResult.DISJOINT);
    });

    it('should return unknown when all reviews are unknown', () => {
      const reviews = [
        new Review('R', 'A', 'B', ReviewResult.UNKNOWN),
        new Review('R', 'A', 'B', ReviewResult.UNKNOWN),
        new Review('R', 'A', 'B', ReviewResult.UNKNOWN)
      ];
      expect(getAggregateResult(reviews)).toBe(ReviewResult.UNKNOWN);
    });

    it('should return unknown when one reviewer reports unknown (with no disjoints)', () => {
      const reviews = [
        new Review('R', 'A', 'B', ReviewResult.EQUIVALENT),
        new Review('R', 'A', 'B', ReviewResult.SUBSET),
        new Review('R', 'A', 'B', ReviewResult.SUPERSET),
        new Review('R', 'A', 'B', ReviewResult.OVERLAPPING),
        new Review('R', 'A', 'B', ReviewResult.UNKNOWN)
      ];
      expect(getAggregateResult(reviews)).toBe(ReviewResult.UNKNOWN);
    });
  });
});
