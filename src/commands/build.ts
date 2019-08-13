/**
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Command, flags } from '@oclif/command';
import * as fg from 'fast-glob';
import * as fileSize from 'filesize';
import { promises as fsPromises, statSync, readFileSync } from 'fs';
import { extname, join, resolve } from 'path';
import {
  getPackageJsonDeps,
  getPackageLockDeps,
  nodeModulesGlobs,
} from '../bundle';
import { compileJsModule } from '../bytecode';
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
    this.log('Reading package.json');
    const pkgPath = resolve(join(args.cwd, 'package.json'));
    const pkgDeps = getPackageJsonDeps(readProjectJson(pkgPath));
    this.log('Reading package-lock.json');
    const pkgLockPath = resolve(join(args.cwd, 'package-lock.json'));
    const pkgLockDeps = getPackageLockDeps(readProjectJson(pkgLockPath));
    const globs = nodeModulesGlobs([...new Set([...pkgDeps, ...pkgLockDeps])]);

    const paths = await fg(globs);
    this.log(`Found ${paths.length} paths`);

    this.log(`Preparing buffers`);
    const entryPs = paths
      .filter(path => extname(path) in handlers)
      .flatMap(path => handlers[extname(path)](path))
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

function readProjectJson(path: string) {
  const data = readFileSync(path, 'utf8');
  return JSON.parse(data);
}

type Handler = (path: string) => Array<Promise<Entry>>;

const loadBuffer: Handler = path => {
  return [
    fsPromises
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
  const readFile = fsPromises.readFile(path);
  return [
    readFile
      .then(buf => ({ key: path, data: buf }))
      .catch(e => Promise.reject({ path, msg: e })),
    readFile
      .then(buf => ({
        key: path + '.v8b',
        data: compileJsModule(path, buf.toString('utf8')),
      }))
      .catch(e => Promise.reject({ path, msg: `Couldn't compile js: ${e}` })),
  ];
};
