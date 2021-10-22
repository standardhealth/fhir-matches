export enum ReviewResult {
  EQUIVALENT = 'equivalent',
  SUBSET = 'subset',
  SUPERSET = 'superset',
  OVERLAPPING = 'overlapping',
  DISJOINT = 'disjoint',
  UNKNOWN = 'unknown'
}

export type Item = {
  id: string;
  path?: string;
};

export class Review {
  a: Item;
  b: Item;
  details?: {
    message?: string;
    childReviews?: Review[];
  };

  constructor(
    public reviewer: string,
    a: Item | string,
    b: Item | string,
    public result: ReviewResult = ReviewResult.UNKNOWN,
    message?: string,
    childReviews?: Review[]
  ) {
    this.a = typeof a === 'string' ? { id: a } : a;
    this.b = typeof b === 'string' ? { id: b } : b;
    if (message != null) {
      this.details = { message };
    }
    if (childReviews != null) {
      this.details = {
        ...(this.details ?? {}),
        childReviews
      };
    }
  }

  withResult(result: ReviewResult): Review {
    this.result = result;
    return this;
  }

  withMessage(message: string): Review {
    this.details ||= {};
    this.details.message = message;
    return this;
  }

  withChildReview(
    reviewer: string,
    a: Item | string,
    b: Item | string,
    result: ReviewResult = ReviewResult.UNKNOWN,
    message?: string,
    childReviews?: Review[]
  ): Review {
    return this.withChildReviews(new Review(reviewer, a, b, result, message, childReviews));
  }

  withChildReviews(...reviews: Review[]): Review {
    this.details ||= {};
    this.details.childReviews ||= [];
    this.details.childReviews.push(...reviews);
    return this;
  }
}
