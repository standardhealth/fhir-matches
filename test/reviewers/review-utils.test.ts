import { ReviewResult } from '../../src/reviewers';
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
        {
          reviewer: 'Test0',
          a: { id: 'a1' },
          b: { id: 'b2' },
          result: ReviewResult.SUBSET
        },
        {
          reviewer: 'Test1',
          a: { id: 'a1' },
          b: { id: 'b2' },
          result: ReviewResult.OVERLAPPING
        },
        {
          reviewer: 'Test2',
          a: { id: 'a1' },
          b: { id: 'b2' },
          result: ReviewResult.EQUIVALENT
        },
        {
          reviewer: 'Test3',
          a: { id: 'a1' },
          b: { id: 'b2' },
          result: ReviewResult.DISJOINT
        },
        {
          reviewer: 'Test4',
          a: { id: 'a1' },
          b: { id: 'b2' },
          result: ReviewResult.SUPERSET
        },
        {
          reviewer: 'Test5',
          a: { id: 'a1' },
          b: { id: 'b2' },
          result: ReviewResult.UNKNOWN
        },
        {
          reviewer: 'Test6',
          a: { id: 'a1' },
          b: { id: 'b2' },
          result: ReviewResult.EQUIVALENT
        },
        {
          reviewer: 'Test7',
          a: { id: 'a1' },
          b: { id: 'b2' },
          result: ReviewResult.DISJOINT
        }
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
