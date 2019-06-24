import * as assert from 'assert';
import {
  encodeAll,
  encodedLength,
  encodeItem,
  ENCODING,
  HS,
  parseAll,
  parseItem,
} from '../src/format';

const hs = HS;
const enc = ENCODING;

describe('format', () => {
  describe('parseItem', () => {
    it('should parse an item from a hand-written buffer', () => {
      const expected = './a/test/path.js';
      const buf = Buffer.from(
        '\u0000\u0000\u0000\u0000\u0000\u0010./a/test/path.js'
      );
      const res = parseItem(buf, 0).buf.toString(enc);
      assert.strictEqual(res, expected);
    });

    it('should parse an item from a buffer', () => {
      const expected = './a/test/path.js';
      const buf = Buffer.alloc(hs + expected.length);
      encodeItem(buf, Buffer.from(expected), 0);
      const res = parseItem(buf, 0).buf.toString(enc);
      assert.strictEqual(res, expected);
    });

    it('should parse an item from a particular location', () => {
      const ex1 = './a/test/path.js';
      const ex2 = 'another/test/path.js';
      const ex3 = 'console.log("hello");';

      let loc = 0;
      const buf = Buffer.alloc(3 * hs + ex1.length + ex2.length + ex3.length);
      loc += encodeItem(buf, Buffer.from(ex1), loc);
      loc += encodeItem(buf, Buffer.from(ex2), loc);
      loc += encodeItem(buf, Buffer.from(ex3), loc);

      const res1 = parseItem(buf, 0);
      assert.strictEqual(res1.buf.toString(enc), ex1);
      const res2 = parseItem(buf, hs + ex1.length);
      assert.strictEqual(res2.buf.toString(enc), ex2);
      const res3 = parseItem(buf, 2 * hs + ex1.length + ex2.length);
      assert.strictEqual(res3.buf.toString(enc), ex3);
    });
  });

  describe('parseAll', () => {
    it('should parse a buffer containing one entry', () => {
      const exPath = 'some/path.js';
      const exContents = 'console.log("im javascript")';

      let loc = 0;
      const buf = Buffer.alloc(2 * hs + exPath.length + exContents.length);
      loc += encodeItem(buf, Buffer.from(exPath), loc);
      loc += encodeItem(buf, Buffer.from(exContents), loc);

      const res = parseAll(buf);
      assert.strictEqual(res[0].key, exPath);
      assert.strictEqual(res[0].data.toString(enc), exContents);
    });

    it('should parse a buffer with multiple entries', () => {
      const expected = [
        { key: 'a/path.js', data: Buffer.from('console.log(5 * "5")') },
        { key: './another/path.js', data: Buffer.from('export PI = 3.14;') },
        { key: 'a/directory/', data: Buffer.alloc(0) },
        { key: './package.json', data: Buffer.from('{"main": "./indexjs"') },
      ];

      const len =
        8 * hs +
        expected
          .map(({ key, data }) => key.length + data.length)
          .reduce((a, b) => a + b);
      const buf = Buffer.alloc(len);
      encodeAll(buf, expected);

      const res = parseAll(buf);
      assert.deepStrictEqual(res, expected);
    });
  });

  describe('encodedLength', () => {
    it('should return 0 on no entries', () => {
      assert.strictEqual(encodedLength([]), 0);
    });

    it('should return the correct encoded size of a list of entries', () => {
      const entries = [
        { key: 'a/path.js', data: Buffer.from('console.log(5 * "5")') }, // 9 + 20 = 29
        { key: './another/path.js', data: Buffer.from('export PI = 3.14;') }, // 17 + 17 = 34
        { key: 'a/directory/', data: Buffer.alloc(0) }, // 12 + 0 = 12
        { key: './package.json', data: Buffer.from('{"main": "./indexjs"') }, // 14 + 20 = 34
      ];
      const expected = 8 * HS + 109;
      assert.strictEqual(encodedLength(entries), expected);
    });
  });
});
