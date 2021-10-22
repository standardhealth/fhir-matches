import { FHIRVersionReviewer } from '.';
import { AggregateReviewer } from '..';
import { SDReviewer } from './SDReviewer';

export class AggregateSDReviewer extends AggregateReviewer implements SDReviewer {
  readonly name = 'StructureDefinition Reviewer';
  reviewers = [new FHIRVersionReviewer()];
}
