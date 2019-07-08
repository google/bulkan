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

import { Script } from 'vm';
import shebangRegex = require('shebang-regex');

export function compileJsModule(path: string, content: string): Buffer {
  content = stripShebang(content);
  const wrapped = require('module').wrap(content);
  const script = new Script(wrapped, {
    filename: path,
    displayErrors: true, // tslint:disable-next-line: no-any
  }) as any; // .createCachedData isn't part of the types yet...
  // TODO: should I execute the script before collecting the cache?
  return script.createCachedData();
}

export function loadCompiledJs(
  path: string,
  source: string,
  compiled: Buffer
): Script {
  source = stripShebang(source);
  const wrapped = require('module').wrap(source);
  const script = new Script(wrapped, {
    filename: path,
    displayErrors: true,
    cachedData: compiled,
  });
  return script;
}

function stripShebang(content: string) {
  return content.replace(shebangRegex, '');
}
