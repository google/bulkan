import {
  NodeModuleResolution,
  Parent as NMRParent,
  registerLoader,
} from 'node-module-resolution';
import {
  Compiler,
  Resolver,
} from 'node-module-resolution/build/src/extend-internal-module';
import { resolve } from 'path';
import { read } from './format';
import { compileJson } from './from-node';

export function register(archive: string, verbose: boolean): void {
  const bufMap = loadBuffersFromBundle(archive);
  registerLoader({
    resolve: createResolver(bufMap, (verbose = verbose)),
    compile: createCompiler(bufMap, (verbose = verbose)),
  });
}

function loadBuffersFromBundle(path: string): BufMap {
  const entries = read(path);
  const bufMap: BufMap = {};
  entries.forEach(({ key, data }) => (bufMap[resolve(key)] = data));
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

function createResolver(bufMap: BufMap, verbose: boolean): Resolver {
  // nmr.resolve handles fallback to default behaviour
  const nmr = createNMR(bufMap);
  return (filename, parent, isMain, resolveContext) => {
    const res = nmr.resolve(filename, parent, isMain);
    if (verbose) console.log('resolved', filename, 'to', res);
    return res;
  };
}

function createNMR(bufMap: BufMap): NodeModuleResolution {
  return new NodeModuleResolution(
    new Map(Object.entries(bufMap).map(([k, v]) => [k, { getData: () => v }]))
  );
}

function createCompiler(bufMap: BufMap, verbose: boolean): Compiler {
  const compile: Compiler = (module, filename, extension, resolveContext) => {
    if (verbose) console.log('compiling', filename, 'from bundle');

    const mod = module as Parent;
    const content = bufMap[filename].toString('utf8');

    if (extension === '.json') {
      compileJson(mod, content, filename);
    } else if (extension === '.js') {
      if (!module || !mod._compile) {
        throw Error(`Unable to compile ${filename} within a module`);
      }

      mod._compile(content, filename);
    }
  };

  return compile;
}
