#!/usr/bin/env node
import { Command } from 'commander';
import { init } from './commands/init';
import { themeGenerate } from './commands/theme-generate';
import { tokens } from './commands/tokens';

const program = new Command();

program
  .name('hyperkit')
  .description('SolidKit CLI - Theme generation and utilities')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize SolidKit theme in your project')
  .option('-d, --dir <directory>', 'Target directory', '.')
  .action(init);

const theme = program.command('theme').description('Theme management commands');

theme
  .command('generate')
  .description('Generate TypeScript types from theme config')
  .option('-i, --input <file>', 'Theme config file', './theme.ts')
  .option('-o, --output <file>', 'Output declaration file', './hyperkit-theme.d.ts')
  .action(themeGenerate);

program.command('tokens').description('List all available design tokens').action(tokens);

program.parse();
