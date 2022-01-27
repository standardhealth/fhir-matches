#!/usr/bin/env node

import path from 'path';
import { Command } from 'commander';
import process from 'process';
import fs from 'fs-extra';
import chalk, { Chalk } from 'chalk';
import { padStart, padEnd } from 'lodash';
import { logger } from './utils';
import { StructureDefinition } from 'fhir/r4';
import { AggregateSDReviewer } from './reviewers/sd';
import { Review, ReviewResult } from './reviewers';

app().catch(e => {
  logger.error(`Matches encountered the following unexpected error: ${e.message}`);
  process.exit(1);
});

async function app() {
  const options = new Command()
    .name('matches')
    .usage('[options]')
    // TODO: Future versions should support id and canonical
    .requiredOption(
      '-a, --resourceA <filepath>',
      'the file path to the first resource for comparison'
    )
    .requiredOption(
      '-b, --resourceB <filepath>',
      'the file path to the second resource for comparison'
    )
    // TODO: Implement dependency loading
    // .option(
    //   '-d, --dependency <dependency...>',
    //   'specify dependencies to be loaded using format dependencyId@version (FHIR R4 included by default)'
    // )
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
  // TODO: Implement dependency loading
  // if (options.dependency) {
  //   options.dependency.forEach((d: string) =>
  //     logger.info(`  --dependency ${d}`)
  //   );
  // }
  if (options.logLevel) {
    logger.info(`  --log-level ${options.logLevel}`);
  }

  // NOTE: For now we assume StructureDefinitions, but this will not always be the case
  let a: StructureDefinition;
  if (options.resourceA.endsWith('.json') && fs.existsSync(options.resourceA)) {
    a = fs.readJsonSync(options.resourceA);
  }
  let b: StructureDefinition;
  if (options.resourceB.endsWith('.json') && fs.existsSync(options.resourceB)) {
    b = fs.readJsonSync(options.resourceB);
  }

  if (a && b) {
    const reviewer = new AggregateSDReviewer();
    const review = reviewer.review(a, b);

    // Log All Non-Equivalent Non-Aggregate Reviews
    collectNonEquivalentReviews(review).forEach(r => {
      if (r?.details?.childReviews?.length) {
        return;
      }
      const padLength = r.a.id.length > r.b.id.length ? r.a.id.length : r.b.id.length;
      const message = [
        `${r.reviewer} Result: ${r.result}`,
        `  A: ${padEnd(r.a.id, padLength)}${r.a.path ? ` -> ${r.a.path}` : ''}`,
        `  B: ${padEnd(r.b.id, padLength)}${r.b.path ? ` -> ${r.a.path}` : ''}`
      ];
      if (r.details?.message) {
        message.push(`  ${r.details.message}`);
      }
      message.forEach(logger.info);
    });

    // Warn users about FHIR Match's juvenile ways...
    logger.warn(
      'NOTE: FHIR Matches is ridiculously young and naive. Do not trust it. Even if it smiles nicely at you.'
    );

    // Draw the summary results
    // ASSUMPTIONS (that may need to change over time):
    // - Reviews go no more than 3 deep: overall -> by reviewer -> by path
    // - When a.path exists, b.path == a.path

    // Get the right color
    let clr: Chalk;
    switch (review.result) {
      case ReviewResult.EQUIVALENT:
        clr = chalk.green;
        break;
      case ReviewResult.DISJOINT:
        clr = chalk.red;
        break;
      default:
        clr = chalk.rgb(179, 98, 0);
    }

    // NOTE: Use prettier-ignore to align messages nicely in the code

    // prettier-ignore
    const results = [
               clr('╔══════════════════════════════════FHIR MATCHES ═══════════════════════════════╗'),
               clr('║') + ' A: ' + padEnd(review.a.id, 73) +                                 clr(' ║'),
               clr('║') + ' B: ' + padEnd(review.b.id, 73) +                                 clr(' ║'),
               clr('╠══════════════════════════════════════════════════════════════════════════════╣'),
    ];

    review.details?.childReviews?.forEach((c, i) => {
      const padLength = 75 - c.reviewer.length;
      //prettier-ignore
      results.push(
               clr('║ ') + c.reviewer + ' '  +               padStart(c.result, padLength) + clr(' ║')
      );
      const nonEqSubs = c.details?.childReviews?.filter(r => r.result !== ReviewResult.EQUIVALENT);
      // prettier-ignore
      results.push(...(nonEqSubs ?? []).map(c2 => {
        const padLength2 = 73 - c2.a.path.length;
        // prettier-ignore
        return clr('║   ') + c2.a.path + ' ' +             padStart(c2.result, padLength2) + clr(' ║');
      }));
      if (i < review.details.childReviews.length - 1) {
        //prettier-ignore
        results.push(
               clr('║──────────────────────────────────────────────────────────────────────────────║')
        );
      }
    });

    // prettier-ignore
    results.push(...[
               clr('╠══════════════════════════════════════════════════════════════════════════════╣'),
               clr('║ OVERALL: ' +                                 padStart(review.result, 67) + ' ║'),
               clr('╚══════════════════════════════════════════════════════════════════════════════╝')
    ]);
    results.forEach(r => console.log(r));
  } else {
    logger.error('FHIR Matches currently only supports file paths to StructureDefinitions.');
  }

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
function collectNonEquivalentReviews(review: Review, collected: Review[] = []): Review[] {
  if (review.result !== ReviewResult.EQUIVALENT) {
    collected.push(review);
  }
  review.details?.childReviews?.forEach(child => collectNonEquivalentReviews(child, collected));
  return collected;
}
