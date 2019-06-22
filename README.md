bulkan
======



[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/bulkan.svg)](https://npmjs.org/package/bulkan)
[![Downloads/week](https://img.shields.io/npm/dw/bulkan.svg)](https://npmjs.org/package/bulkan)
[![License](https://img.shields.io/npm/l/bulkan.svg)](https://github.com/A-lxe/bulkan/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
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
* [`bulkan build [ROOT]`](#bulkan-build-root)
* [`bulkan help [COMMAND]`](#bulkan-help-command)

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
