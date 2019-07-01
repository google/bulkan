import { Command, flags } from '@oclif/command';
import * as fg from 'fast-glob';
import * as fileSize from 'filesize';
import { promises, statSync } from 'fs';
import * as Path from 'path';
import {
  compileJsModule,
  getPackageJsonDeps,
  nodeModulesGlobs,
} from '../bundle';
import { Entry, write } from '../format';

// tslint:disable-next-line: no-default-export
export default class Build extends Command {
  static description = 'build a bundle';
  static examples = [`$ bulkan build`];

  static flags = {
    help: flags.help({ char: 'h' }),
    no_compile: flags.boolean({
      char: 'C',
      description: "don't compile javascript files",
    }),
    outfile: flags.string({
      char: 'o',
      description: 'output file for the generated bundle.',
      default: 'bundle.blkn',
    }),
  };

  static args = [{ name: 'cwd', default: './' }];

  async run() {
    const { args, flags } = this.parse(Build);

    const handlers: { [extension: string]: Handler } = {
      '.json': loadBuffer,
      '.js': loadBufferAndCompileCache,
    };
    if (flags.no_compile) handlers['.js'] = loadBuffer;

    this.log('Collecting paths');
    const pkgPath = Path.resolve(Path.join(args.cwd, 'package.json'));
    const globs = nodeModulesGlobs(getPackageJsonDeps(require(pkgPath)));
    const paths = await fg(globs);
    this.log(`Found ${paths.length} paths`);

    this.log(`Preparing buffers`);
    const entryPs = ([] as Array<Promise<Entry>>)
      .concat(
        ...paths.map((path: string) => {
          const ext = Path.extname(path);
          if (ext in handlers) return handlers[ext](path);
          return [];
        })
      )
      .map(e =>
        e.catch(err => {
          this.log(`Failed to load ${err.path}: ${err.msg}`);
          return null;
        })
      );
    const entries = (await Promise.all(entryPs)).filter(e => !!e) as Entry[];

    this.log(`Writing bundle to ${flags.outfile}`);
    write(flags.outfile as string, entries);

    const size = fileSize(statSync(flags.outfile as string).size);
    this.log(
      `Bundled ${entries.length} files into ${flags.outfile} using ${size}`
    );
  }
}

type Handler = (path: string) => Array<Promise<Entry>>;

const loadBuffer: Handler = path => {
  return [
    promises
      .readFile(path)
      .then(buf => ({ key: path, data: buf }))
      .catch(e => Promise.reject({ path, msg: e })),
  ];
};

const loadEmptyBuffer: Handler = path => {
  return [
    Promise.resolve({ key: path, data: Buffer.allocUnsafe(0) }).catch(e =>
      Promise.reject({ path, msg: e })
    ),
  ];
};

const loadBufferAndCompileCache: Handler = path => {
  const readFile = promises.readFile(path);
  return [
    readFile
      .then(buf => ({ key: path, data: buf }))
      .catch(e => Promise.reject({ path, msg: e })),
    readFile
      .then(buf => ({
        key: path + '.cjs',
        data: compileJsModule(path, buf.toString('utf8')),
      }))
      .catch(e => Promise.reject({ path, msg: e })),
  ];
};
