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

import { readFileSync, writeFileSync } from 'fs';
import { parse } from '@oclif/parser';

/**
 * SIZE is a big-endian uint64
 *
 * SIZE path
 * SIZE filecontent
 */

export const HS = 6;
export const ENCODING = 'utf8';

export interface Entry {
  key: string;
  data: Buffer;
}

interface Item {
  buf: Buffer;
  bytesRead: number;
}

export interface BufMap {
  [path: string]: Buffer;
}

export function read(path: string): BufMap {
  const buf = readFileSync(path);
  return parseAll(buf);
}

export function write(path: string, entries: Entry[]): void {
  const buf = Buffer.allocUnsafe(encodedLength(entries));
  encodeAll(buf, entries);
  writeFileSync(path, buf);
}

export function parseAll(buf: Buffer, loc = 0): BufMap {
  const res: BufMap = {};
  while (loc < buf.length) {
    const path = parseItem(buf, loc);
    loc += path.bytesRead;
    const contents = parseItem(buf, loc);
    loc += contents.bytesRead;

    res[path.buf.toString(ENCODING)] = contents.buf;
  }
  return res;
}

// NOTE: The returned buffer shares memory with the input buf!
export function parseItem(buf: Buffer, loc: number): Item {
  const size = buf.readUIntBE(loc, HS);
  if (size > Number.MAX_SAFE_INTEGER) throw new Error('unhandled item size');

  const data = buf.slice(loc + HS, loc + HS + Number(size));
  return {
    buf: data,
    bytesRead: HS + Number(size),
  };
}

export function encodeAll(buf: Buffer, entries: Entry[], loc = 0): number {
  const initial = loc;
  entries.forEach(e => {
    loc += encodeItem(buf, Buffer.from(e.key, ENCODING), loc);
    loc += encodeItem(buf, e.data, loc);
  });
  return loc - initial;
}

export function encodeItem(buf: Buffer, item: Buffer, loc: number): number {
  const size = item.length;
  buf.writeUIntBE(size, loc, HS);
  item.copy(buf, loc + HS);

  return size + HS;
}

export function encodedLength(entries: Entry[]): number {
  return entries
    .map(({ key, data }) => key.length + data.length + 2 * HS)
    .reduce((a, b) => a + b, 0);
}
