import { Parent } from './loader';

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
