// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

import { Parent } from '../loader';

/**
 * TAKEN FROM NODE lib/internal/modules/cjs/helpers.js
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 * because the buffer-to-string conversion in `fs.readFileSync()`
 * translates it to FEFF, the UTF-16 BOM.
 *
 * @param content
 */
export function stripBOM(content: string) {
  if (content.charCodeAt(0) === 0xfeff) {
    content = content.slice(1);
  }
  return content;
}

/**
 * TAKEN FROM NODE lib/internal/modules/cjs/loader.js Module._extensions['.json']
 * @param module
 * @param content
 * @param filename
 */
export function compileJson(module: Parent, content: string, filename: string) {
  // TODO: handle --experimental-policy
  // if (manifest) {
  //   const moduleURL = pathToFileURL(filename);
  //   manifest.assertIntegrity(moduleURL, content);
  // }

  try {
    module.exports = JSON.parse(stripBOM(content));
  } catch (err) {
    err.message = filename + ': ' + err.message;
    throw err;
  }
}

/**
 * TAKEN FROM NODE lib/internal/modules/cjs/helpers.js
 * @param mod
 */
// Invoke with makeRequireFunction(module) where |module| is the Module object
// to use as the context for the require() function.
// tslint:disable:no-any
export function makeRequireFunction(mod: any) {
  const modCon = mod.constructor;

  function require(path: string) {
    return mod.require(path);
  }

  function resolve(request: string, options: any) {
    validateString(request, 'request');
    return modCon._resolveFilename(request, mod, false, options);
  }

  require.resolve = resolve;

  function paths(request: string) {
    validateString(request, 'request');
    return modCon._resolveLookupPaths(request, mod);
  }

  resolve.paths = paths;

  require.main = process.mainModule;

  // Enable support to add extra extension types.
  require.extensions = modCon._extensions;

  require.cache = modCon._cache;

  return require;
}
// tslint:enable:no-any

/**
 * TAKEN FROM NODE lib/internal/validators.js
 * @param value
 * @param name
 */
function validateString(value: string, name: string) {
  if (typeof value !== 'string') {
    // NOTE: Not worth importing the real error definition, so use this as a mock
    throw new Error(
      `ERR_INVALID_ARG_TYPE produced with parameters: ${name}, ${'string'}, ${value}`
    );
  }
}
