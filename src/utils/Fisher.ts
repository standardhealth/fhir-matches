import { FHIRDefinitions, Type, Metadata } from 'fhir-package-loader';
import { cloneDeep } from 'lodash';

export class Fisher {
  protected fhirDefs: FHIRDefinitions;

  constructor(defs: FHIRDefinitions) {
    this.fhirDefs = defs;
  }

  /**
   * Search for a definition based on the type it could be
   * @param {string} item - the item to search for
   * @param {Type[]} types - the possible type the item could be
   * @returns the definition that is returned or undefined if none is found
   */
  fishForFHIR(item: string, ...types: Type[]): any | undefined {
    // No types passed in means to search ALL supported types
    if (types.length === 0) {
      types = [
        Type.Resource,
        Type.Logical,
        Type.Type,
        Type.Profile,
        Type.Extension,
        Type.ValueSet,
        Type.CodeSystem
      ];
    }

    for (const type of types) {
      let def;
      switch (type) {
        case Type.Resource:
          def = cloneDeep(
            this.fhirDefs
              .allResources()
              .find(def => def.id === item || def.url === item || def.name === item)
          );
          break;
        case Type.Logical:
          def = cloneDeep(
            this.fhirDefs
              .allLogicals()
              .find(def => def.id === item || def.url === item || def.name === item)
          );
          break;
        case Type.Type:
          def = cloneDeep(
            this.fhirDefs
              .allTypes()
              .find(def => def.id === item || def.url === item || def.name === item)
          );
          break;
        case Type.Profile:
          def = cloneDeep(
            this.fhirDefs
              .allProfiles()
              .find(def => def.id === item || def.url === item || def.name === item)
          );
          break;
        case Type.Extension:
          def = cloneDeep(
            this.fhirDefs
              .allExtensions()
              .find(def => def.id === item || def.url === item || def.name === item)
          );
          break;
        case Type.ValueSet:
          def = cloneDeep(
            this.fhirDefs
              .allValueSets()
              .find(def => def.id === item || def.url === item || def.name === item)
          );
          break;
        case Type.CodeSystem:
          def = cloneDeep(
            this.fhirDefs
              .allCodeSystems()
              .find(def => def.id === item || def.url === item || def.name === item)
          );
          break;
        case Type.Instance: // don't support resolving to FHIR instances
        default:
          break;
      }
      if (def) {
        return def;
      }
    }
  }

  /**
   * Search for the metadata of a definition based on the type it could be
   * @param {string} item - the item to search for
   * @param {Type[]} types - the possible types the item could be
   * @returns {Metadata | undefined} the metadata of the item or undefined if none is found
   */
  fishForMetadata(item: string, ...types: Type[]): Metadata | undefined {
    const result = this.fishForFHIR(item, ...types);
    if (result) {
      return {
        id: result.id as string,
        name: result.name as string,
        sdType: result.type as string,
        url: result.url as string,
        parent: result.baseDefinition as string,
        abstract: result.abstract as boolean,
        resourceType: result.resourceType as string
      };
    }
  }
}
