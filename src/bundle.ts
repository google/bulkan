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

import { PackageJson, PackageLock } from './third_party/npm';

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
