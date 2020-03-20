#!/usr/bin/env node

const program = require('commander');
const mbuilder = require('./mbuilder');
const Context = require('./src/context');

async function main() {
  program
    .option('--input <path>', 'input dir')
    .option('--output <path>', 'output dir')
    .parse(process.argv);

  const context = await Context.build(program.input, program.output);
  mbuilder(context);
}

main();
