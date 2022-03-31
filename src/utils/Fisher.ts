import { FHIRDefinitions, Type } from 'fhir-package-loader';

interface Metadata {
  id: string;
  name: string;
  sdType?: string;
  resourceType?: string;
  url?: string;
  parent?: string;
  abstract?: boolean;
}

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
          def = this.fhirDefs.fishForFHIR(item, Type.Resource);
          break;
        case Type.Logical:
          def = this.fhirDefs.fishForFHIR(item, Type.Logical);
          break;
        case Type.Type:
          def = this.fhirDefs.fishForFHIR(item, Type.Type);
          break;
        case Type.Profile:
          def = this.fhirDefs.fishForFHIR(item, Type.Profile);
          break;
        case Type.Extension:
          def = this.fhirDefs.fishForFHIR(item, Type.Extension);
          break;
        case Type.ValueSet:
          def = this.fhirDefs.fishForFHIR(item, Type.ValueSet);
          break;
        case Type.CodeSystem:
          def = this.fhirDefs.fishForFHIR(item, Type.CodeSystem);
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
