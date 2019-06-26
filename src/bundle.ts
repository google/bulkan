import * as fg from 'fast-glob';
import * as fileSize from 'filesize';
import { promises, statSync } from 'fs';
import * as path from 'path';
import { write } from './format';
import { PackageJson, PackageLock } from './npm';

export async function createBundle(
  outfile: string,
  root = process.cwd(),
  extensions = ['.js', '.json']
) {
  let paths: string[] = [];

  const lockPath = path.resolve(path.join(root, 'package-lock.json'));
  const dirs = getPackageLockDeps(require(lockPath))
    .map(name => `node_modules/${name}/**/*`)
    .map(dir => extensions.map(ext => dir + ext))
    .reduce((acc, val) => acc.concat(val), []);

  paths = paths.concat(await fg(dirs));

  if (paths.length === 0) throw new Error('No paths to be bundled');

  const bufs = await Promise.all(paths.map(loadBuf));
  const entries = paths.map((p, i) => ({ key: p, data: bufs[i] }));

  write(outfile, entries);
  const size = fileSize(statSync(outfile).size);
  console.log(`Bundled ${paths.length} files into ${outfile} using ${size}`);
}

export function getPackageLockDeps(
  lock: PackageLock,
  { includeDev = false } = {}
): string[] {
  return Object.entries(lock.dependencies || {})
    .filter(([name, pkg]) => includeDev || !pkg.dev)
    .map(([name, pkg]) => name);
}

export function getPackageJsonDeps(
  pkgJson: PackageJson,
  { includeDev = false } = {}
): string[] {
  let deps = pkgJson.dependencies || {};
  if (includeDev) deps = { ...(pkgJson.devDependencies || {}), ...deps };
  return Object.keys(deps);
}

function loadBuf(path: string): Promise<Buffer> {
  return promises.stat(path).then(stats => {
    if (stats.isDirectory()) return Buffer.allocUnsafe(0);
    return promises.readFile(path);
  });
}
