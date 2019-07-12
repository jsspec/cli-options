# @jsspec/cli-options
[![Travis](https://img.shields.io/travis/jsspec/cli-options/master.svg?logo=travis&style=for-the-badge)](https://travis-ci.org/jsspec/cli-options)
[![AppVeyor](https://img.shields.io/appveyor/ci/HookyQR/cli-options/master.svg?logo=appveyor&style=for-the-badge)](https://ci.appveyor.com/project/HookyQR/cli-options)

Command line options parser for jsspec.

Example:
```javascript
const CLIOptions = require('@jsspec/cli-options')

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
