#!/usr/bin/env node
import { Command } from 'commander';
import { mbuilder } from './mbuilder.js';
import { Context } from './src/context.js';

async function main() {
  const program = new Command();
  program
    .option('--input <path>', 'input dir')
    .option('--output <path>', 'output dir')
    .parse(process.argv);

  const options = program.opts();
  const context = await Context.build(options.input, options.output);
  mbuilder(context);
}

main();
