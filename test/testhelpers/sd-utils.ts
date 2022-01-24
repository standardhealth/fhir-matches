import { StructureDefinition } from 'fhir/r4';

export function getElement(sd: StructureDefinition, id: string) {
  // Add the type prefix if necessary (e.g., name -> Patient.name)
  if (!/^[A-Z]/.test(id)) {
    id = `${sd.type}.${id}`;
  }
  return sd.snapshot?.element?.find(e => e.id === id);
}
