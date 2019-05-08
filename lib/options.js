const Parser = require('./parser');

class Options {
  constructor(args, options, catchAll = '_') {
    const parser = new Parser(options, catchAll);
    this.settings = parser.parse(args.slice(2));
    this.errors = parser.errors;
  }
}

module.exports = Options;