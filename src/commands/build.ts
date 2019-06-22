import { Command, flags } from '@oclif/command';
import { createBundle } from '../bundle';

// tslint:disable-next-line: no-default-export
export default class Build extends Command {
  static description = 'build a bundle';
  static examples = [`$ bulkan build`];

  static flags = {
    help: flags.help({ char: 'h' }),
    outfile: flags.string({
      char: 'o',
      description: 'Output file for the generated bundle.',
      default: 'bundle.blkn',
    }),
  };

  static args = [{ name: 'root', default: './' }];

  async run() {
    const { args, flags } = this.parse(Build);

    createBundle(flags.outfile as string, args.root);
  }
}
