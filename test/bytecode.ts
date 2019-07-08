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

import * as assert from 'assert';
import * as vm from 'vm';
import { compileJsModule, loadCompiledJs } from '../src/bytecode';

describe('bytecode', () => {
  describe(compileJsModule.name, () => {
    it('should compile the provided js as a module', () => {
      const path = '/a/file.js';
      const content = `exports.out = 5;`;
      const wrapped = require('module').wrap(content);
      const compiled = compileJsModule(path, content);
      const script = new vm.Script(wrapped, {
        filename: path,
        cachedData: compiled,
      }) as any;
      const res = script.runInThisContext();
      const exp = { out: 0 };
      res(exp);
      assert.strictEqual(script.cachedDataRejected, false);
      assert.strictEqual(exp.out, 5);
    });
    it('should strip the shebang from the input content', () => {
      const path = '/a/file.js';
      const withoutShebang = `
        console.log('hello');`;
      const withShebang = `#!/usr/bin/env node
        console.log('hello');`;
      assert.deepStrictEqual(
        compileJsModule(path, withShebang),
        compileJsModule(path, withoutShebang)
      );
    });
  });

  describe(loadCompiledJs.name, () => {
    it('should load a compiled buffer that matches the input source', () => {
      const path = '/a/file.js';
      const source = `exports.out = 5;`;
      const compiled = compileJsModule(path, source);
      const loadedScript = loadCompiledJs(path, source, compiled) as any;
      const res = loadedScript.runInThisContext();
      const exp = { out: 0 };
      res(exp);
      assert.strictEqual(loadedScript.cachedDataRejected, false);
      assert.strictEqual(exp.out, 5);
    });
    it("should indicate cachedDataRejected when the source doesn't match", () => {
      const path = '/a/file.js';
      const source = `exports.out = 5;`;
      const compiled = compileJsModule(path, source);
      const loadedScript = loadCompiledJs(path, source + ' ', compiled) as any;
      assert.strictEqual(loadedScript.cachedDataRejected, true);
    });
  });
});
