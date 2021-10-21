#!/usr/bin/env node

import path from 'path';
import { Command } from 'commander';
import process from 'process';
import fs from 'fs-extra';
import { logger } from './utils';

app().catch(e => {
  logger.error(`Matches encountered the following unexpected error: ${e.message}`);
  process.exit(1);
});

async function app() {
  const options = new Command()
    .name('matches')
    .usage('[options]')
    .requiredOption(
      '-a, --resourceA <id|canonical>',
      'the id or canonical of the first resource for comparison'
    )
    .requiredOption(
      '-b, --resourceB <id|canonical>',
      'the id or canonical of the second resource for comparison'
    )
    .option(
      '-d, --dependency <dependency...>',
      'specify dependencies to be loaded using format dependencyId@version (FHIR R4 included by default)'
    )
    .option(
      '-l, --log-level <level>',
      'specify the level of log messages: error, warn, info (default), debug'
    )
    .version(getVersion(), '-v, --version', 'print FHIR Matches version')
    .on('--help', () => {
      console.log('');
      console.log('FHIR Matches is currently under development (and incomplete).');
    })
    .parse(process.argv)
    .opts();

  // Set the log level. If no level specified, loggers default to info
  const { logLevel } = options;
  if (logLevel === 'debug' || logLevel === 'warn' || logLevel === 'error') {
    logger.level = logLevel;
  }

  logger.info(`Running ${getVersion()}`);
  logger.info('Arguments:');
  logger.info(`  --resourceA ${options.resourceA}`);
  logger.info(`  --resourceB ${options.resourceB}`);
  if (options.dependency) {
    options.dependency.forEach((d: string) => logger.info(`  --dependency ${d}`));
  }
  if (options.logLevel) {
    logger.info(`  --log-level ${options.logLevel}`);
  }

  logger.info(
    'FHIR Matches has not yet been implemented. Thank you for visiting.  Please come again.'
  );

  process.exit(0);
}

function getVersion(): string {
  const packageJSONPath = path.join(__dirname, '..', 'package.json');
  if (fs.existsSync(packageJSONPath)) {
    const version = fs.readJSONSync(packageJSONPath)?.version;
    return `FHIR Matches v${version}`;
  }
  return 'unknown';
}
