import * as fg from 'fast-glob';
import { promises } from 'fs';
import { write, read } from './format';
import * as path from 'path';

export async function createBundle(
  filename: string,
  root = process.cwd(),
  extensions = ['.js', '.json'],
  loadFromLockfile = true
) {
  let paths: string[] = [];
  if (loadFromLockfile) {
    if (!require.main) throw Error("couldn't find main module");

    const lockPath = path.resolve(path.join(root, 'package-lock.json'));
    const pkgLock = require(lockPath);
    const dirs = getToplevelDepsFromLockfile(pkgLock)
      .map(name => `node_modules/${name}/**/*`)
      .map(dir => extensions.map(i => dir + i))
      .reduce((acc, val) => acc.concat(val), []);

    paths = paths.concat(await fg(dirs));
  }

  if (paths.length === 0) throw new Error('No paths to be bundled');

  const bufs = await Promise.all(paths.map(loadBuf));
  const entries = paths.map((p, i) => ({ key: p, data: bufs[i] }));

  write(filename, entries);
}

// tslint:disable-next-line:no-any
function getToplevelDepsFromLockfile(lock: any): string[] {
  // TODO: write types for lockfile json?
  return Object.entries(lock.dependencies) // tslint:disable-next-line:no-any
    .filter(([name, pkg]) => !(pkg as any).dev)
    .map(([name, pkg]) => name);
}

function loadBuf(path: string): Promise<Buffer> {
  console.log('Loading', path);
  return promises.stat(path).then(stats => {
    if (stats.isDirectory()) return Buffer.allocUnsafe(0);
    return promises.readFile(path);
  });
}

function printBundle(filename: string) {
  const entries = read(filename);
  console.log(entries);
}
