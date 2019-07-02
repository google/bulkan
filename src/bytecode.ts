import { Script } from 'vm';
import shebangRegex = require('shebang-regex');

export function compileJsModule(path: string, content: string): Buffer {
  content = stripShebang(content);
  const wrapped = require('module').wrap(content);
  const script = new Script(wrapped, {
    filename: path, // tslint:disable-next-line: no-any
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
    cachedData: compiled,
  });
  return script;
}

function stripShebang(content: string) {
  return content.replace(shebangRegex, '');
}
