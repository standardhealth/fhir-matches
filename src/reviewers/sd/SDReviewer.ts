import { StructureDefinition } from 'fhir/r4';
import { Reviewer } from '../Reviewer';
import { Review } from '../Review';

export interface SDReviewer extends Reviewer {
  name: string;
  review(a: StructureDefinition, b: StructureDefinition): Review[];
}
