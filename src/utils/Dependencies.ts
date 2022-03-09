import { loadDependencies, FHIRDefinitions } from 'fhir-package-loader';
import { logger, logMessage } from './Logger';

export function reformatDependencies(dependencies: string[]): string[] {
  const parsedDepencies = dependencies.reduce(function (workingArray, dep) {
    const versionSplit = dep.split('@');
    if (versionSplit.length !== 2) {
      logger.error(
        `Dependency \'${dep}\' is not formatted correctly and will not be loaded. Please specify depdencies using the format dependencyId@version`
      );
    } else {
      workingArray.push(`${versionSplit[0].trim()}#${versionSplit[1].trim()}`);
    }
    return workingArray;
  }, []);
  return parsedDepencies;
}

export async function loadExternalDependencies(dependencies: string[]): Promise<FHIRDefinitions> {
  if (dependencies) {
    const parsedDependencies = ['hl7.fhir.r4.core#4.0.1'];
    parsedDependencies.push(...reformatDependencies(dependencies));
    return loadDependencies(parsedDependencies, undefined, logMessage);
  }
}

export function determineCorePackageId(fhirVersion: string): string {
  if (/^4\.0\./.test(fhirVersion)) {
    return 'hl7.fhir.r4.core';
  } else if (/^(4\.1\.|4\.3.\d+-)/.test(fhirVersion)) {
    return 'hl7.fhir.r4b.core';
  } else if (/^4\.3.\d+$/.test(fhirVersion)) {
    return 'hl7.fhir.r4b.core';
  } else if (/^5\.0.\d+$/.test(fhirVersion)) {
    return 'hl7.fhir.r5.core';
  } else {
    return 'hl7.fhir.r5.core';
  }
}
