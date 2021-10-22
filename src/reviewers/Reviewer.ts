import { Element } from 'fhir/r4';
import { Review } from './Review';

export interface Reviewer {
  name: string;
  review(a: Element, b: Element): Review[];
}
