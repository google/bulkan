# bulkan

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/bulkan.svg)](https://npmjs.org/package/bulkan)
[![Downloads/week](https://img.shields.io/npm/dw/bulkan.svg)](https://npmjs.org/package/bulkan)
[![License](https://img.shields.io/npm/l/bulkan.svg)](https://github.com/google/bulkan/blob/master/package.json)

Bulkan is a dependency bundler/loader for node focused on working anywhere and loading fast.

<!-- toc -->
* [bulkan](#bulkan)
* [Usage](#usage)
* [Commands](#commands)
* [Contributing](#contributing)
<!-- tocstop -->

# Usage

```sh
npm i bulkan
```

To build a bundle from within your project root:

```sh
npm i # to ensure node_modules is where you want it
npx bulkan build
```

To use bulkan as a run-time loader from the generated `bundle.blkn`:

```sh
node -r bulkan index.js # OR
node -r bulkan/register index.js # OR for verbose output of dependency resolution+compiling:
node -r bulkan/register/verbose index.js
```

For more information on the included CLI, read on!

<!-- usage -->
```sh-session
$ npm install -g bulkan
$ bulkan COMMAND
running command...
$ bulkan (-v|--version|version)
bulkan/0.0.1 linux-x64 node-v12.2.0
$ bulkan --help [COMMAND]
USAGE
  $ bulkan COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`bulkan build [CWD]`](#bulkan-build-cwd)
* [`bulkan help [COMMAND]`](#bulkan-help-command)

## `bulkan build [CWD]`

build a bundle

```
USAGE
  $ bulkan build [CWD]

OPTIONS
  -C, --no_compile       don't compile javascript files
  -h, --help             show CLI help
  -o, --outfile=outfile  [default: bundle.blkn] output file for the generated bundle.

EXAMPLE
  $ bulkan build
```

_See code: [dist/commands/build.ts](https://github.com/google/bulkan/blob/v0.0.1/dist/commands/build.ts)_

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

# Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

> This is not an official Google product.
