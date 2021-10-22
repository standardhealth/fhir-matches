import { Review, ReviewResult } from '../../src/reviewers';
import { organizeReviews } from '../../src/reviewers/review-utils';
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
});
