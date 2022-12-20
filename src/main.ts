import 'reflect-metadata';
import { Command } from 'commander';
import config from './config.js';
import * as commands from './commands/index.js';

const program = new Command();

program.version(config.app.version);

program.command('serve').action(() => {
  commands.serve();
});

program.parse(process.argv);
