# @jsspec/cli-options
[![Build Status](https://travis-ci.org/jsspec/cli-options.svg?branch=master)](https://travis-ci.org/jsspec/cli-options)
[![Build status](https://ci.appveyor.com/api/projects/status/as9xrd9ytic7brrl?svg=true)](https://ci.appveyor.com/project/HookyQR/cli-options)

Command line options parser for jsspec.

Example:
```javascript
const CLIOptions = requrie('@jsspec/cli-options')

options = {
  random: { alias: 'R', type: Boolean, required: false, default: true },
  require: { alias: 'r', type: Array, required: false, default: [] },
  format: { alias: 'f', type: String, required: false, default: 'documentation' },
  files: { type: Array, required: false, default: [] }
};

const cliOptions = new CLIOptions(process.argv.slice(2), options, 'files');
const settings = cliOptions.settings;

console.log(cliOptions.errors.join('\n'));
```
