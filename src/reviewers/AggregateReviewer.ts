import { Element } from 'fhir/r4';
import { getAggregateResult, Review, Reviewer } from '.';

export abstract class AggregateReviewer implements Reviewer {
  readonly name: string;
  reviewers: Reviewer[] = [];

  review(a: Element, b: Element): Review {
    const reviews = this.reviewers.map(r => r.review(a, b));
    const overallResult = getAggregateResult(reviews);
    return new Review(this.name, a.id, b.id, overallResult).withChildReviews(...reviews);
  }
}
