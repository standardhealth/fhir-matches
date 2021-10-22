import { StructureDefinition } from 'fhir/r4';
import { Review } from './Review';

export interface StructureDefinitionReviewer {
  name: string;
  review(a: StructureDefinition, b: StructureDefinition): Review[];
}
