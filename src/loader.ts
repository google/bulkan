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
import * as perfTrace from './third_party/perf-trace';

export function register(
  archive: string,
  verbose = Boolean(process.env['BLKN_VERBOSE']),
  trace = true
): void {
  let bufMap;
  if (trace) {
    process.on('exit', () => perfTrace.write('./blkn-trace.1.log'));
    perfTrace.wrap('loading bundle', () => {
      bufMap = loadBuffersFromBundle(archive);
    });
  } else {
    bufMap = loadBuffersFromBundle(archive);
  }
  registerLoader({
    resolve: createResolver(
      bufMap as BufMap,
      (verbose = verbose),
      (trace = trace)
    ),
    compile: createCompiler(
      bufMap as BufMap,
      (verbose = verbose),
      (trace = trace)
    ),
  });
}

function loadBuffersFromBundle(path: string): BufMap {
  perfTrace.enter('read bundle');
  const entries = read(path);
  perfTrace.exit('read bundle');
  perfTrace.enter('build bufmap');
  const bufMap: BufMap = {};
  entries.forEach(({ key, data }) => (bufMap[Path.resolve(key)] = data));
  perfTrace.exit('build bufmap');
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

function createResolver(
  bufMap: BufMap,
  verbose: boolean,
  trace: boolean
): Resolver {
  // nmr.resolve handles fallback to default behaviour
  let nmr: NodeModuleResolution;
  if (trace) {
    perfTrace.wrap('initialize nmr', () => {
      nmr = createNMR(bufMap);
    });
  } else {
    nmr = createNMR(bufMap);
  }
  let resolver: Resolver = (filename, parent, isMain, resolveContext) => {
    const res = nmr.resolve(filename, parent, isMain);
    if (verbose) console.log('resolved', filename, 'to', res);
    return res;
  };
  if (trace) {
    const old = resolver;
    resolver = ((filename, ...args) => {
      let resolved: string | false = false;
      perfTrace.wrap(`blkn resolve`, () => {
        resolved = old(filename, ...args);
      });
      return resolved;
    }) as Resolver;
  }
  return resolver;
}

function createNMR(bufMap: BufMap): NodeModuleResolution {
  return new NodeModuleResolution(
    new Map(Object.entries(bufMap).map(([k, v]) => [k, { getData: () => v }]))
  );
}

function createCompiler(
  bufMap: BufMap,
  verbose: boolean,
  trace: boolean
): Compiler {
  let compile: Compiler = (module, filename, extension, resolveContext) => {
    if (verbose) console.log('compiling', filename, 'from bundle');

    const mod = module as Parent;
    const content = bufMap[filename].toString('utf8');

    if (extension === '.json') {
      perfTrace.wrap('compile json', () => {
        compileJson(mod, content, filename);
      });
    } else if (extension === '.js') {
      if (!module || !mod._compile) {
        throw Error(`Unable to compile ${filename} within a module`);
      }

      const precompiledPath = filename + '.cjs';
      if (precompiledPath in bufMap) {
        if (verbose) console.log(`\tcompiling from bundled bytecode`);
        moduleBoundCompileFromBytecode.bind(mod)(
          bufMap[filename].toString('utf8'),
          filename,
          bufMap[precompiledPath]
        );
      } else {
        if (verbose) console.log(`\tcompiling from bundled javascript`);
        perfTrace.wrap('compile js', () => {
          mod._compile && mod._compile(content, filename);
        });
      }
    }
  };
  if (trace) {
    const old = compile;
    compile = ((module, filename, ...args) => {
      perfTrace.wrap(`blkn compile`, () => {
        old(module, filename, ...args);
      });
    }) as Compiler;
  }

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
  perfTrace.enter('load bytecode');
  const compiledWrapper = loadCompiledJs(
    filename,
    source,
    byteCode
  ).runInThisContext();
  perfTrace.exit('load bytecode');

  const dirname = Path.dirname(filename);
  const require = makeRequireFunction(this);
  const exports = this.exports;
  const thisValue = exports;
  const module = this;
  perfTrace.enter('call bytecode');
  const result = compiledWrapper.call(
    thisValue,
    exports,
    require,
    module,
    filename,
    dirname
  );
  perfTrace.exit('call bytecode');
  return result;
}
