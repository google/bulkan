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

import * as Debugger from 'debug';
import {
  NodeModuleResolution,
  Parent as NMRParent,
  registerLoader,
} from 'node-module-resolution';
import {
  Compiler,
  Resolver,
} from 'node-module-resolution/build/src/extend-internal-module';
import * as Path from 'path';
import { loadCompiledJs } from './bytecode';
import { read } from './format';
import { compileJson, makeRequireFunction } from './third_party/from-node';

const debug = Debugger('bulkan:loader');

export function register(archive: string): void {
  const bufMap = loadBuffersFromBundle(archive);
  registerLoader({
    resolve: createResolver(bufMap),
    compile: createCompiler(bufMap),
  });
}

function loadBuffersFromBundle(path: string): BufMap {
  const entries = read(path);
  const bufMap: BufMap = {};
  entries.forEach(({ key, data }) => (bufMap[Path.resolve(key)] = data));
  return bufMap;
}

export interface Parent extends NMRParent {
  // tslint:disable:no-any
  exports?: any;
  _compile?: (content: string, filename: string) => any;
  // tslint:enable:no-any
}

interface BufMap {
  [path: string]: Buffer;
}

function createResolver(bufMap: BufMap): Resolver {
  // nmr.resolve handles fallback to default behaviour
  const nmr = createNMR(bufMap);
  return (filename, parent, isMain, resolveContext) => {
    const res = nmr.resolve(filename, parent, isMain);
    debug('resolved', filename, 'to', res);
    return res;
  };
}

function createNMR(bufMap: BufMap): NodeModuleResolution {
  return new NodeModuleResolution(
    new Map(Object.entries(bufMap).map(([k, v]) => [k, { getData: () => v }]))
  );
}

function createCompiler(bufMap: BufMap): Compiler {
  const compile: Compiler = (module, filename, extension, resolveContext) => {
    debug('compiling', filename, 'from bundle');

    const mod = module as Parent;
    const content = bufMap[filename].toString('utf8');

    if (extension === '.json') {
      compileJson(mod, content, filename);
    } else if (extension === '.js') {
      if (!module || !mod._compile) {
        throw Error(`Unable to compile ${filename} within a module`);
      }

      const precompiledPath = filename + '.v8b';
      if (precompiledPath in bufMap) {
        debug(`\tcompiling from bundled bytecode`);
        moduleBoundCompileFromBytecode.bind(mod)(
          bufMap[filename].toString('utf8'),
          filename,
          bufMap[precompiledPath]
        );
      } else {
        debug(`\tcompiling from bundled javascript`);
        mod._compile(content, filename);
      }
    }
  };

  return compile;
}
/**
 * This is pared down from lib/internal/modules/cjs/loader.js Module._compile
 * @param this
 * @param source
 * @param filename
 * @param byteCode
 */
function moduleBoundCompileFromBytecode(
  this: Parent,
  source: string,
  filename: string,
  byteCode: Buffer
) {
  const compiledWrapper = loadCompiledJs(
    filename,
    source,
    byteCode
  ).runInThisContext();

  const dirname = Path.dirname(filename);
  const require = makeRequireFunction(this);
  const exports = this.exports;
  const thisValue = exports;
  const module = this;
  const result = compiledWrapper.call(
    thisValue,
    exports,
    require,
    module,
    filename,
    dirname
  );
  return result;
}
