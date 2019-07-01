import * as shebangRegex from 'shebang-regex';
import * as vm from 'vm';
import { PackageJson, PackageLock } from './npm';

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

export function nodeModulesGlobs(dependencies: string[]): string[] {
  return dependencies.map(d => `./node_modules/${d}/**/*`);
}

export function compileJsModule(path: string, content: string): Buffer {
  content = stripShebang(content);
  const wrapped = require('module').wrap(content);
  const script = new vm.Script(wrapped, {
    filename: path, // tslint:disable-next-line: no-any
  }) as any; // .createCachedData isn't part of the types yet...

  // TODO: should I execute the script before collecting the cache?
  return script.createCachedData();
}

function stripShebang(content: string) {
  return content.replace(shebangRegex, '');
}
