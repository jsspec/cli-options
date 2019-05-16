'use strict';

const Parser = require('./parser');

class Options {
  constructor(args, options, catchAll = '_') {
    const parser = new Parser(options, catchAll);
    this.settings = parser.parse(args);
    this.errors = parser.errors;
  }
}

module.exports = Options;
