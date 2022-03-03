import { StructureDefinition } from 'fhir/r4';
import {
  FHIRVersionReviewer,
  BaseDefinitionReviewer,
  CardinalityReviewer,
  ExtensionReviewer
} from '.';
import { AggregateReviewer, Review } from '..';
import { SDReviewer } from './SDReviewer';

export class AggregateSDReviewer extends AggregateReviewer implements SDReviewer {
  readonly name = 'StructureDefinition Reviewer';
  reviewers = [
    new FHIRVersionReviewer(),
    new BaseDefinitionReviewer(),
    new CardinalityReviewer(),
    new ExtensionReviewer()
  ];

  review(a: StructureDefinition, b: StructureDefinition): Review {
    return super.review(a, b);
  }
}
