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
