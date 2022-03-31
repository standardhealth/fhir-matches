import {
  reformatDependencies,
  loadExternalDependencies,
  determineCorePackageId
} from '../../src/utils/Dependencies';
import { loggerSpy } from '../testhelpers/loggerSpy';

describe('Dependencies', () => {
  beforeEach(() => {
    loggerSpy.reset();
  });

  // TODO: Add a describe bloc for determineCorePackageId
  describe('determineCorePackageId', () => {
    it('should recognize FHIR R4 version numbers', () => {
      const packageId1 = determineCorePackageId('4.0.1');
      const packageId2 = determineCorePackageId('4.0.0');
      expect(packageId1).toBe('hl7.fhir.r4.core');
      expect(packageId2).toBe('hl7.fhir.r4.core');
    });

    it('should recognize FHIR R4B version numbers', () => {
      const packageId1 = determineCorePackageId('4.1.0');
      const packageId2 = determineCorePackageId('4.3.0');
      expect(packageId1).toBe('hl7.fhir.r4b.core');
      expect(packageId2).toBe('hl7.fhir.r4b.core');
    });

    it('should recognize FHIR R5 version numbers', () => {
      const packageId1 = determineCorePackageId('5.0.0');
      const packageId2 = determineCorePackageId('5.5.0');
      expect(packageId1).toBe('hl7.fhir.r5.core');
      expect(packageId2).toBe('hl7.fhir.r5.core');
    });
  });

  describe('loadExternalDependencies', () => {
    it('should load specified dependencies', async () => {
      const dependencies = ['hl7.fhir.us.core@3.1.0', 'hl7.fhir.us.mcode@1.0.0'];
      const defs = await loadExternalDependencies(dependencies);
      expect(defs.childFHIRDefs).toHaveLength(3);
      expect(defs.childFHIRDefs[0].package).toBe('hl7.fhir.us.core#3.1.0');
      expect(defs.childFHIRDefs[1].package).toBe('hl7.fhir.us.mcode#1.0.0');
      expect(defs.childFHIRDefs[2].package).toBe('hl7.fhir.r4.core#4.0.1');
    });
  });

  describe('reformatDependencies', () => {
    it('should split an array of dependencies on @', () => {
      const dependencies = ['hl7.fhir.us.core@3.1.1', 'hl7.fhir.us.mcode@1.2.0'];
      const parsedDependencies = reformatDependencies(dependencies);
      expect(parsedDependencies).toHaveLength(2);
      expect(parsedDependencies).toContain('hl7.fhir.us.core#3.1.1');
      expect(parsedDependencies).toContain('hl7.fhir.us.mcode#1.2.0');
    });
    it('should trim empty space from packageIds and version numbers', () => {
      const dependencies = [' hl7.fhir.us.core@3.1.1', 'hl7.fhir.us.mcode@1.2.0 '];
      const parsedDependencies = reformatDependencies(dependencies);
      expect(parsedDependencies).toHaveLength(2);
      expect(parsedDependencies).toContain('hl7.fhir.us.core#3.1.1');
      expect(parsedDependencies).toContain('hl7.fhir.us.mcode#1.2.0');
    });

    it('should log an error when @ is not used to seperate version numbers from packageIds', () => {
      const dependencies = [' hl7.fhir.us.core#3.1.1', 'hl7.fhir.us.mcode@1.2.0 '];
      const parsedDependencies = reformatDependencies(dependencies);
      expect(loggerSpy.getLastMessage('error')).toBe(
        "Dependency ' hl7.fhir.us.core#3.1.1' is not formatted correctly and will not be loaded. Please specify dependencies using the format dependencyId@version"
      );
      expect(parsedDependencies).toHaveLength(1);
      expect(parsedDependencies).not.toContain('hl7.fhir.us.core#3.1.1');
      expect(parsedDependencies).toContain('hl7.fhir.us.mcode#1.2.0');
    });
  });
});
