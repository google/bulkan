# bulkan

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/bulkan.svg)](https://npmjs.org/package/bulkan)
[![Downloads/week](https://img.shields.io/npm/dw/bulkan.svg)](https://npmjs.org/package/bulkan)
[![License](https://img.shields.io/npm/l/bulkan.svg)](https://github.com/A-lxe/bulkan/blob/master/package.json)

Bulkan is a dependency bundler/loader for node focused on working anywhere and loading fast.

<!-- toc -->

- [Usage](#usage)
- [Commands](#commands)

<!-- tocstop -->

# Usage

```sh
npm i bulkan # NOTE: This project isn't public yet, so that probably won't work
```

To build a bundle from within your project root:

```sh
npm i # to ensure node_modules is where you want it
npx bulkan build
```

To use bulkan as a run-time loader from the generated `bundle.blkn`:

```sh
node -r bulkan index.js # OR
node -r bulkan/register index.js # OR
# For verbose output of dependency resolution+compiling:
node -r bulkan/register/verbose index.js
```

For more information on the included CLI, read on!

<!-- usage -->

```sh-session
$ npm install -g bulkan
$ bulkan COMMAND
running command...
$ bulkan (-v|--version|version)
bulkan/0.0.0 linux-x64 node-v12.2.0
$ bulkan --help [COMMAND]
USAGE
  $ bulkan COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

- [`bulkan build [ROOT]`](#bulkan-build-root)
- [`bulkan help [COMMAND]`](#bulkan-help-command)

## `bulkan build [ROOT]`

build a bundle

```
USAGE
  $ bulkan build [ROOT]

OPTIONS
  -h, --help             show CLI help
  -o, --outfile=outfile  [default: bundle.blkn] Output file for the generated bundle.

EXAMPLE
  $ bulkan build
```

_See code: [dist/commands/build.ts](https://github.com/A-lxe/bulkan/blob/v0.0.0/dist/commands/build.ts)_

## `bulkan help [COMMAND]`

display help for bulkan

```
USAGE
  $ bulkan help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.0/src/commands/help.ts)_

<!-- commandsstop -->
