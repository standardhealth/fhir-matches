import { Fisher } from '../../src/utils/Fisher';
import { loadExternalDependencies } from '../../src/utils/Dependencies';
import { loggerSpy } from '../testhelpers/loggerSpy';
import { FHIRDefinitions, Type } from 'fhir-package-loader';

let defs: FHIRDefinitions;
let fisher: Fisher;

describe('Fisher', () => {
  beforeAll(async () => {
    defs = await loadExternalDependencies(['hl7.fhir.us.mcode@1.0.0']);
    fisher = new Fisher(defs);
    loggerSpy.reset();
  });

  describe('fishForFHIR', () => {
    // TODO: Add unit tests to ensure all supported Types can be fished
    // TODO: Add unit test to ensure all Types are fished for when no Type is included
    it('should fish based on resource name', () => {
      const cancerPatient = fisher.fishForFHIR('CancerPatient', Type.Profile);
      expect(cancerPatient).toBeDefined();
      expect(cancerPatient.resourceType).toBe('StructureDefinition');
    });

    it('should fish based on resource id', () => {
      const cancerPatient = fisher.fishForFHIR('mcode-cancer-patient', Type.Profile);
      expect(cancerPatient).toBeDefined();
      expect(cancerPatient.resourceType).toBe('StructureDefinition');
    });

    it('should fish based on resource url', () => {
      const cancerPatient = fisher.fishForFHIR(
        'http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-patient',
        Type.Profile
      );
      expect(cancerPatient).toBeDefined();
      expect(cancerPatient.resourceType).toBe('StructureDefinition');
    });
  });

  describe('fishForMetadata', () => {
    // TODO: Add unit tests to ensure metadata for all supported Types can be fished
    it('should fish metadata based on resource name', () => {
      const cancerPatientMetadata = fisher.fishForMetadata('CancerPatient', Type.Profile);
      expect(cancerPatientMetadata).toBeDefined();
      expect(cancerPatientMetadata).toEqual({
        id: 'mcode-cancer-patient',
        name: 'CancerPatient',
        sdType: 'Patient',
        url: 'http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-patient',
        parent: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient',
        abstract: false,
        resourceType: 'StructureDefinition'
      });
    });

    it('should fish metadata based on resource id', () => {
      const cancerPatientMetadata = fisher.fishForMetadata('mcode-cancer-patient', Type.Profile);
      expect(cancerPatientMetadata).toBeDefined();
      expect(cancerPatientMetadata).toEqual({
        id: 'mcode-cancer-patient',
        name: 'CancerPatient',
        sdType: 'Patient',
        url: 'http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-patient',
        parent: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient',
        abstract: false,
        resourceType: 'StructureDefinition'
      });
    });

    it('should fish metadata based on resource url', () => {
      const cancerPatientMetadata = fisher.fishForMetadata(
        'http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-patient',
        Type.Profile
      );
      expect(cancerPatientMetadata).toBeDefined();
      expect(cancerPatientMetadata).toEqual({
        id: 'mcode-cancer-patient',
        name: 'CancerPatient',
        sdType: 'Patient',
        url: 'http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-patient',
        parent: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient',
        abstract: false,
        resourceType: 'StructureDefinition'
      });
    });
  });
});
