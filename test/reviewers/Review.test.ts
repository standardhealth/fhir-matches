import { Review, ReviewResult } from '../../src/reviewers';

describe('Review', () => {
  it('should support the minimum 3-arg constructor', () => {
    const review = new Review('Test Reviewer', { id: 'A' }, { id: 'B' });
    expect(review.reviewer).toBe('Test Reviewer');
    expect(review.a).toEqual({ id: 'A' });
    expect(review.b).toEqual({ id: 'B' });
    expect(review.result).toBe(ReviewResult.UNKNOWN);
    expect(review.details).toBeUndefined();
  });

  it('should convert a and b to objects when constructed with strings', () => {
    const review = new Review('Test Reviewer', 'A', 'B');
    expect(review.reviewer).toBe('Test Reviewer');
    expect(review.a).toEqual({ id: 'A' });
    expect(review.b).toEqual({ id: 'B' });
    expect(review.result).toBe(ReviewResult.UNKNOWN);
    expect(review.details).toBeUndefined();
  });

  it('should support the 4-arg constructor', () => {
    const review = new Review('Test Reviewer', { id: 'A' }, { id: 'B' }, ReviewResult.EQUIVALENT);
    expect(review.reviewer).toBe('Test Reviewer');
    expect(review.a).toEqual({ id: 'A' });
    expect(review.b).toEqual({ id: 'B' });
    expect(review.result).toBe(ReviewResult.EQUIVALENT);
    expect(review.details).toBeUndefined();
  });

  it('should support the 5-arg constructor', () => {
    const review = new Review(
      'Test Reviewer',
      { id: 'A' },
      { id: 'B' },
      ReviewResult.EQUIVALENT,
      'It is equivalent!'
    );
    expect(review.reviewer).toBe('Test Reviewer');
    expect(review.a).toEqual({ id: 'A' });
    expect(review.b).toEqual({ id: 'B' });
    expect(review.result).toBe(ReviewResult.EQUIVALENT);
    expect(review.details).toEqual({
      message: 'It is equivalent!'
    });
  });

  it('should support the 6-arg constructor', () => {
    const review = new Review(
      'Test Reviewer',
      { id: 'A' },
      { id: 'B' },
      ReviewResult.EQUIVALENT,
      'It is equivalent!',
      [
        new Review('Child1', { id: 'AC1' }, { id: 'BC1' }),
        new Review('Child2', { id: 'AC2' }, { id: 'BC2' })
      ]
    );
    expect(review.reviewer).toBe('Test Reviewer');
    expect(review.a).toEqual({ id: 'A' });
    expect(review.b).toEqual({ id: 'B' });
    expect(review.result).toBe(ReviewResult.EQUIVALENT);
    expect(review.details).toEqual({
      message: 'It is equivalent!',
      childReviews: [
        new Review('Child1', { id: 'AC1' }, { id: 'BC1' }),
        new Review('Child2', { id: 'AC2' }, { id: 'BC2' })
      ]
    });
  });

  it('should support the 6-arg constructor with null message', () => {
    const review = new Review(
      'Test Reviewer',
      { id: 'A' },
      { id: 'B' },
      ReviewResult.EQUIVALENT,
      null,
      [
        new Review('Child1', { id: 'AC1' }, { id: 'BC1' }),
        new Review('Child2', { id: 'AC2' }, { id: 'BC2' })
      ]
    );
    expect(review.reviewer).toBe('Test Reviewer');
    expect(review.a).toEqual({ id: 'A' });
    expect(review.b).toEqual({ id: 'B' });
    expect(review.result).toBe(ReviewResult.EQUIVALENT);
    expect(review.details).toEqual({
      childReviews: [
        new Review('Child1', { id: 'AC1' }, { id: 'BC1' }),
        new Review('Child2', { id: 'AC2' }, { id: 'BC2' })
      ]
    });
  });

  it('should set the result when withResult is called', () => {
    const review = new Review('Test Reviewer', { id: 'A' }, { id: 'B' });
    const review2 = review.withResult(ReviewResult.EQUIVALENT);
    expect(review.reviewer).toBe('Test Reviewer');
    expect(review.a).toEqual({ id: 'A' });
    expect(review.b).toEqual({ id: 'B' });
    expect(review.result).toBe(ReviewResult.EQUIVALENT);
    expect(review.details).toBeUndefined();
    expect(review2).toBe(review);
  });

  it('should set the message when withMessage is called', () => {
    const review = new Review('Test Reviewer', { id: 'A' }, { id: 'B' });
    const review2 = review.withMessage('Here is a message!');
    expect(review.reviewer).toBe('Test Reviewer');
    expect(review.a).toEqual({ id: 'A' });
    expect(review.b).toEqual({ id: 'B' });
    expect(review.result).toBe(ReviewResult.UNKNOWN);
    expect(review.details).toEqual({
      message: 'Here is a message!'
    });
    expect(review2).toBe(review);
  });

  it('should add a childReview when withChildReview is called', () => {
    const review = new Review('Test Reviewer', { id: 'A' }, { id: 'B' });
    const review2 = review.withChildReview('Child1', { id: 'AC1' }, { id: 'BC1' });
    expect(review.reviewer).toBe('Test Reviewer');
    expect(review.a).toEqual({ id: 'A' });
    expect(review.b).toEqual({ id: 'B' });
    expect(review.result).toBe(ReviewResult.UNKNOWN);
    expect(review.details).toEqual({
      childReviews: [new Review('Child1', { id: 'AC1' }, { id: 'BC1' })]
    });
    expect(review2).toBe(review);
    const review3 = review.withChildReview('Child2', { id: 'AC2' }, { id: 'BC2' });
    expect(review.reviewer).toBe('Test Reviewer');
    expect(review.a).toEqual({ id: 'A' });
    expect(review.b).toEqual({ id: 'B' });
    expect(review.result).toBe(ReviewResult.UNKNOWN);
    expect(review.details).toEqual({
      childReviews: [
        new Review('Child1', { id: 'AC1' }, { id: 'BC1' }),
        new Review('Child2', { id: 'AC2' }, { id: 'BC2' })
      ]
    });
    expect(review3).toBe(review);
    expect(review3).toBe(review2);
  });

  it('should add a childReview when withChildReview is called with string args for a and b', () => {
    const review = new Review('Test Reviewer', { id: 'A' }, { id: 'B' });
    const review2 = review.withChildReview('Child1', 'AC1', 'BC1');
    expect(review.reviewer).toBe('Test Reviewer');
    expect(review.a).toEqual({ id: 'A' });
    expect(review.b).toEqual({ id: 'B' });
    expect(review.result).toBe(ReviewResult.UNKNOWN);
    expect(review.details).toEqual({
      childReviews: [new Review('Child1', { id: 'AC1' }, { id: 'BC1' })]
    });
    expect(review2).toBe(review);
  });

  it('should add a childReview when withChildReview is called with all 6 args', () => {
    const review = new Review('Test Reviewer', { id: 'A' }, { id: 'B' });
    const review2 = review.withChildReview(
      'Child1',
      { id: 'AC1' },
      { id: 'BC1' },
      ReviewResult.EQUIVALENT,
      'It is an equivalent child!',
      [
        new Review('GrandChild1', { id: 'AGC1' }, { id: 'BGC1' }),
        new Review('GrandChild2', { id: 'AGC2' }, { id: 'BGC2' })
      ]
    );
    expect(review.reviewer).toBe('Test Reviewer');
    expect(review.a).toEqual({ id: 'A' });
    expect(review.b).toEqual({ id: 'B' });
    expect(review.result).toBe(ReviewResult.UNKNOWN);
    expect(review.details).toEqual({
      childReviews: [
        new Review(
          'Child1',
          { id: 'AC1' },
          { id: 'BC1' },
          ReviewResult.EQUIVALENT,
          'It is an equivalent child!',
          [
            new Review('GrandChild1', { id: 'AGC1' }, { id: 'BGC1' }),
            new Review('GrandChild2', { id: 'AGC2' }, { id: 'BGC2' })
          ]
        )
      ]
    });
    expect(review2).toBe(review);
  });

  it('should add childReviews when withChildReviews is called', () => {
    const review = new Review('Test Reviewer', { id: 'A' }, { id: 'B' });
    const review2 = review.withChildReviews(
      new Review('Child1', { id: 'AC1' }, { id: 'BC1' }),
      new Review('Child2', { id: 'AC2' }, { id: 'BC2' })
    );
    expect(review.reviewer).toBe('Test Reviewer');
    expect(review.a).toEqual({ id: 'A' });
    expect(review.b).toEqual({ id: 'B' });
    expect(review.result).toBe(ReviewResult.UNKNOWN);
    expect(review.details).toEqual({
      childReviews: [
        new Review('Child1', { id: 'AC1' }, { id: 'BC1' }),
        new Review('Child2', { id: 'AC2' }, { id: 'BC2' })
      ]
    });
    expect(review2).toBe(review);
    const review3 = review.withChildReviews(
      new Review('Child3', { id: 'AC3' }, { id: 'BC3' }),
      new Review('Child4', { id: 'AC4' }, { id: 'BC4' })
    );
    expect(review.reviewer).toBe('Test Reviewer');
    expect(review.a).toEqual({ id: 'A' });
    expect(review.b).toEqual({ id: 'B' });
    expect(review.result).toBe(ReviewResult.UNKNOWN);
    expect(review.details).toEqual({
      childReviews: [
        new Review('Child1', { id: 'AC1' }, { id: 'BC1' }),
        new Review('Child2', { id: 'AC2' }, { id: 'BC2' }),
        new Review('Child3', { id: 'AC3' }, { id: 'BC3' }),
        new Review('Child4', { id: 'AC4' }, { id: 'BC4' })
      ]
    });
    expect(review3).toBe(review);
    expect(review3).toBe(review2);
  });

  it('should support chaining all the with methods together', () => {
    const review = new Review('Test Reviewer', { id: 'A' }, { id: 'B' })
      .withResult(ReviewResult.EQUIVALENT)
      .withMessage('It is a train!')
      .withChildReview('Child1', { id: 'AC1' }, { id: 'BC1' })
      .withChildReviews(
        new Review('Child2', { id: 'AC2' }, { id: 'BC2' }),
        new Review('Child3', { id: 'AC3' }, { id: 'BC3' })
      );

    expect(review.reviewer).toBe('Test Reviewer');
    expect(review.a).toEqual({ id: 'A' });
    expect(review.b).toEqual({ id: 'B' });
    expect(review.result).toBe(ReviewResult.EQUIVALENT);
    expect(review.details).toEqual({
      message: 'It is a train!',
      childReviews: [
        new Review('Child1', { id: 'AC1' }, { id: 'BC1' }),
        new Review('Child2', { id: 'AC2' }, { id: 'BC2' }),
        new Review('Child3', { id: 'AC3' }, { id: 'BC3' })
      ]
    });
  });
});
