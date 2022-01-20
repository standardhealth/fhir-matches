import { StructureDefinition } from 'fhir/r4';
import { FHIRVersionReviewer, BaseDefinitionReviewer } from '.';
import { AggregateReviewer, Review } from '..';
import { SDReviewer } from './SDReviewer';

export class AggregateSDReviewer extends AggregateReviewer implements SDReviewer {
  readonly name = 'StructureDefinition Reviewer';
  reviewers = [new FHIRVersionReviewer(), new BaseDefinitionReviewer()];

  review(a: StructureDefinition, b: StructureDefinition): Review {
    return super.review(a, b);
  }
}
